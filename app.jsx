import { useState, useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const MANAGER_PIN = "1987";

const DEFAULT_TEAM = [
  { name:"Scott",  pin:"1001" },
  { name:"Phil",   pin:"1002" },
  { name:"Rory",   pin:"1003" },
  { name:"Garry",  pin:"1004" },
  { name:"Kelvin", pin:"1005" },
  { name:"Paul",   pin:"1006" },
  { name:"Mark P", pin:"1007" },
  { name:"Mark J", pin:"1008" },
  { name:"Brian",  pin:"1009" },
  { name:"Chris",  pin:"1010" },
];

const DEFAULT_AREAS = [
  { group:"Manor Bedrooms",    items:[1,2,3,4,5,6,7,8,9,10,11,12,14,15,16].map(n=>`Manor Bedroom ${n}`) },
  { group:"Manor Common Areas", items:["Parlour","Reception","Games Room","Library","Dining Room","Courtyard","Staff Corridor"] },
  { group:"Manor Working Areas", items:["Kitchen","Coffee Area","Still Room","Glass Room","Manor Office","Sales Office","James Office","Fjona Office","Printing Room"] },
  { group:"Birches",           items:["Birches Office Space","Birches"] },
  { group:"Restaurants & Kitchen", items:["Kynd","Bakery","Kynd Prep Kitchen"] },
  { group:"Gardens & Grounds", items:["Walled Garden","Cottage"] },
  { group:"Grace & Savour",    items:["Grace & Savour","Grace Bedroom 1","Grace Bedroom 2","Grace Bedroom 3","Grace Bedroom 4","Grace Bedroom 5"] },
];

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const B = {
  cream:       "#F5F2ED",
  creamDark:   "#EDE9E2",
  creamBorder: "#DDD8CF",
  charcoal:    "#2C2C2C",
  charcoalMid: "#555050",
  charcoalLight:"#888180",
  white:       "#FFFFFF",
  doneBg:      "#EEF2EB",
  doneText:    "#3A5A2A",
  todoBg:      "#EDEAE4",
  errorText:   "#8B2020",
};

const fontSerif = "'Cormorant Garamond','Garamond','Georgia',serif";
const fontSans  = "'Gill Sans','Optima','Trebuchet MS',sans-serif";

if (!document.getElementById("hm-fonts")) {
  const link = document.createElement("link");
  link.id = "hm-fonts"; link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap";
  document.head.appendChild(link);
}

// ─── UI translations ──────────────────────────────────────────────────────────
const UI = {
  en: {
    flag:"🇬🇧", name:"English",
    estateTitle:"Estate Maintenance", reportTitle:"Report an Issue",
    reportSubtitle:"Please describe the issue below. The estate management team will be notified and respond promptly.",
    yourName:"Your Name", optional:"(optional)", where:"Where?",
    wherePlaceholder:"e.g. Manor Bedroom 4, Kitchen, Walled Garden…",
    describeIssue:"Describe the Issue",
    describePlaceholder:"Please describe the problem in as much detail as possible…",
    photograph:"Photograph", takePhoto:"Take Photo", uploadPhoto:"Upload Photo",
    tapToChange:"Tap to change", remove:"Remove", language:"Language",
    translateNote:"Your report will be automatically translated to English for the manager.",
    submit:"Submit Report", translating:"Translating…",
    required:"Both location and issue description are required",
    successTitle:"Issue Logged!", successRef:"Your ticket reference",
    successNote:"Please note this reference. The estate manager will review your report shortly.",
    close:"Close",
  },
  pl: {
    flag:"🇵🇱", name:"Polski",
    estateTitle:"Konserwacja posiadłości", reportTitle:"Zgłoś problem",
    reportSubtitle:"Proszę opisać problem poniżej. Zespół zarządzający posiadłością zostanie powiadomiony i niezwłocznie zareaguje.",
    yourName:"Twoje imię", optional:"(opcjonalnie)", where:"Gdzie?",
    wherePlaceholder:"np. Sypialnia 4, Kuchnia, Ogród murowany…",
    describeIssue:"Opisz problem",
    describePlaceholder:"Proszę opisać problem jak najbardziej szczegółowo…",
    photograph:"Zdjęcie", takePhoto:"Zrób zdjęcie", uploadPhoto:"Prześlij zdjęcie",
    tapToChange:"Dotknij, aby zmienić", remove:"Usuń", language:"Język",
    translateNote:"Twój raport zostanie automatycznie przetłumaczony na język angielski dla menedżera.",
    submit:"Wyślij zgłoszenie", translating:"Tłumaczenie…",
    required:"Lokalizacja i opis problemu są wymagane",
    successTitle:"Problem zgłoszony!", successRef:"Numer Twojego zgłoszenia",
    successNote:"Proszę zanotować ten numer. Menedżer posiadłości wkrótce przejrzy Twoje zgłoszenie.",
    close:"Zamknij",
  },
  uk: {
    flag:"🇺🇦", name:"Українська",
    estateTitle:"Технічне обслуговування маєтку", reportTitle:"Повідомити про проблему",
    reportSubtitle:"Будь ласка, опишіть проблему нижче. Команда управління маєтком отримає сповіщення та оперативно відреагує.",
    yourName:"Ваше ім'я", optional:"(необов'язково)", where:"Де?",
    wherePlaceholder:"напр. Спальня 4, Кухня, Огороджений сад…",
    describeIssue:"Опишіть проблему",
    describePlaceholder:"Будь ласка, опишіть проблему якомога детальніше…",
    photograph:"Фотографія", takePhoto:"Зробити фото", uploadPhoto:"Завантажити фото",
    tapToChange:"Торкніться, щоб змінити", remove:"Видалити", language:"Мова",
    translateNote:"Ваш звіт буде автоматично перекладено на англійську для менеджера.",
    submit:"Надіслати звіт", translating:"Перекладається…",
    required:"Необхідно вказати місце та опис проблеми",
    successTitle:"Проблему зафіксовано!", successRef:"Номер вашого квитка",
    successNote:"Будь ласка, запишіть цей номер. Менеджер маєтку незабаром розгляне ваш звіт.",
    close:"Закрити",
  },
  hi: {
    flag:"🇮🇳", name:"हिन्दी",
    estateTitle:"एस्टेट रखरखाव", reportTitle:"समस्या रिपोर्ट करें",
    reportSubtitle:"कृपया नीचे समस्या का वर्णन करें। एस्टेट प्रबंधन टीम को सूचित किया जाएगा और वे शीघ्र प्रतिक्रिया देंगे।",
    yourName:"आपका नाम", optional:"(वैकल्पिक)", where:"कहाँ?",
    wherePlaceholder:"जैसे: मैनर बेडरूम 4, रसोई, दीवारबंद बगीचा…",
    describeIssue:"समस्या का वर्णन करें",
    describePlaceholder:"कृपया समस्या का यथासंभव विस्तार से वर्णन करें…",
    photograph:"फोटो", takePhoto:"फोटो लें", uploadPhoto:"फोटो अपलोड करें",
    tapToChange:"बदलने के लिए टैप करें", remove:"हटाएं", language:"भाषा",
    translateNote:"आपकी रिपोर्ट प्रबंधक के लिए स्वचालित रूप से अंग्रेजी में अनुवादित की जाएगी।",
    submit:"रिपोर्ट सबमिट करें", translating:"अनुवाद हो रहा है…",
    required:"स्थान और समस्या विवरण दोनों आवश्यक हैं",
    successTitle:"समस्या दर्ज की गई!", successRef:"आपका टिकट संदर्भ",
    successNote:"कृपया इस संदर्भ को नोट करें। एस्टेट प्रबंधक शीघ्र ही आपकी रिपोर्ट की समीक्षा करेंगे।",
    close:"बंद करें",
  },
  zh: {
    flag:"🇨🇳", name:"普通话",
    estateTitle:"庄园维护", reportTitle:"报告问题",
    reportSubtitle:"请在下方描述问题。庄园管理团队将收到通知并及时响应。",
    yourName:"您的姓名", optional:"（可选）", where:"在哪里？",
    wherePlaceholder:"例如：庄园卧室4、厨房、围墙花园…",
    describeIssue:"描述问题",
    describePlaceholder:"请尽可能详细地描述问题…",
    photograph:"照片", takePhoto:"拍照", uploadPhoto:"上传照片",
    tapToChange:"点击更改", remove:"删除", language:"语言",
    translateNote:"您的报告将自动翻译成英文供管理员查看。",
    submit:"提交报告", translating:"翻译中…",
    required:"位置和问题描述均为必填项",
    successTitle:"问题已记录！", successRef:"您的工单编号",
    successNote:"请记下此编号。庄园经理将尽快审阅您的报告。",
    close:"关闭",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusMeta = (s) => s === "done"
  ? { bg:B.doneBg, text:B.doneText, border:"#B8CCA8", label:"Complete" }
  : { bg:B.todoBg, text:B.charcoal, border:B.creamBorder, label:"To Do" };

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
    + " · " + d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
}

function generateTicketNumber() {
  const n = new Date();
  const yy = String(n.getFullYear()).slice(-2);
  const mm = String(n.getMonth()+1).padStart(2,"0");
  return "HM-" + yy + mm + "-" + String(Math.floor(Math.random()*9000)+1000);
}

// ─── Supabase config ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://nolzqgcqfwexjmpdrpuh.supabase.co";
const SUPABASE_KEY = "sb_publishable_0s2_DNo7OFtB8USXnurY_g_ZU9krNoy";
const SB_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": "Bearer " + SUPABASE_KEY,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

async function loadData(key) {
  try {
    const res = await fetch(
      SUPABASE_URL + "/rest/v1/tickets?key=eq." + encodeURIComponent(key) + "&select=value&limit=1",
      { headers: SB_HEADERS }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    return JSON.parse(rows[0].value);
  } catch { return null; }
}

async function saveData(key, value) {
  try {
    await fetch(SUPABASE_URL + "/rest/v1/tickets", {
      method: "POST",
      headers: { ...SB_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }),
    });
  } catch {}
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle = {
  width:"100%", padding:"11px 12px", borderRadius:0,
  border:"none", borderBottom:"1px solid " + B.creamBorder,
  fontSize:14, background:"transparent", boxSizing:"border-box",
  color:B.charcoal, fontFamily:fontSans, outline:"none", letterSpacing:"0.02em",
};
const labelStyle = {
  display:"block", fontSize:11, fontWeight:600, color:B.charcoalLight,
  marginBottom:6, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:fontSans,
};

// ─── Logo wordmark ────────────────────────────────────────────────────────────
function LogoWordmark({ stacked=false, navSize=22, onDark=false }) {
  const col = onDark ? B.cream : B.charcoal;
  if (stacked) {
    return (
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:fontSerif, fontSize:navSize*1.8, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:col, lineHeight:1.2 }}>
          Hampton<br/>Manor
        </div>
      </div>
    );
  }
  return (
    <span style={{ fontFamily:fontSerif, fontSize:navSize, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:col }}>
      Hampton Manor
    </span>
  );
}

// ─── Ornament ─────────────────────────────────────────────────────────────────
function Ornament({ small }) {
  const size = small ? 60 : 90;
  const line = "1px solid " + B.charcoal;
  const d = small ? 6 : 8;
  return (
    <div style={{ textAlign:"center", margin:small?"12px 0":"20px 0", opacity:0.4 }}>
      <span style={{ display:"inline-block", width:size, borderTop:line, verticalAlign:"middle", marginRight:6 }}/>
      <span style={{ display:"inline-block", width:d, height:d, background:B.charcoal, transform:"rotate(45deg)", verticalAlign:"middle" }}/>
      <span style={{ display:"inline-block", width:d, height:d, border:line, transform:"rotate(45deg)", verticalAlign:"middle", margin:"0 4px" }}/>
      <span style={{ display:"inline-block", width:d, height:d, background:B.charcoal, transform:"rotate(45deg)", verticalAlign:"middle" }}/>
      <span style={{ display:"inline-block", width:size, borderTop:line, verticalAlign:"middle", marginLeft:6 }}/>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const m = statusMeta(status);
  return (
    <span style={{ background:m.bg, color:m.text, border:"1px solid " + m.border, borderRadius:2, padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:fontSans }}>
      {m.label}
    </span>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryBtn({ onClick, disabled, children, small, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: outline ? "transparent" : (disabled ? B.creamBorder : B.charcoal),
      color: outline ? B.charcoal : (disabled ? B.charcoalLight : B.cream),
      border: "1px solid " + (disabled ? B.creamBorder : B.charcoal),
      padding: small ? "8px 18px" : "14px 28px",
      fontSize: small ? 11 : 12, fontFamily:fontSans, fontWeight:600,
      letterSpacing:"0.14em", textTransform:"uppercase",
      cursor: disabled ? "not-allowed" : "pointer",
      borderRadius:0, transition:"all 0.2s",
      width: small ? "auto" : "100%",
    }}>{children}</button>
  );
}

// ─── Print ────────────────────────────────────────────────────────────────────
function printList(tickets, title) {
  const rows = tickets.map(function(t) {
    return "<tr><td style='font-family:monospace;font-size:11px'>" + (t.ticketNo||"—") + "</td><td>" + formatDate(t.createdAt) + "</td><td><strong>" + (t.area||"—") + "</strong></td><td>" + (t.message||"") + "</td><td>" + (t.assignee||"—") + "</td><td style='font-weight:700;text-transform:uppercase'>" + (t.status||"todo") + "</td></tr>";
  }).join("");
  const w = window.open("","_blank");
  w.document.write("<!DOCTYPE html><html><head><title>" + title + "</title><style>body{font-family:'Gill Sans',sans-serif;padding:32px;color:#2C2C2C;background:#F5F2ED}h1{font-family:Georgia,serif;font-size:22px;letter-spacing:0.15em;text-transform:uppercase;border-bottom:1px solid #DDD8CF;padding-bottom:8px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#2C2C2C;color:#F5F2ED;padding:8px 10px;text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase}td{padding:8px 10px;border-bottom:1px solid #DDD8CF;vertical-align:top}tr:nth-child(even) td{background:#EDE9E2}@media print{body{padding:0}}</style></head><body><h1>Hampton Manor</h1><p style='color:#888;font-size:12px;margin-bottom:20px'>" + title + " &middot; Printed " + new Date().toLocaleString("en-GB") + " &middot; " + tickets.length + " issue" + (tickets.length!==1?"s":"") + "</p><table><thead><tr><th>Ticket #</th><th>Date &amp; Time</th><th>Location</th><th>Issue</th><th>Assigned To</th><th>Status</th></tr></thead><tbody>" + rows + "</tbody></table></body></html>");
  w.document.close();
  w.print();
}

// ─── PDF backup export ────────────────────────────────────────────────────────
function exportTodoBackupPDF(tickets) {
  const todoTickets = tickets.filter(function(t) { return t.status==="todo"||t.status==="pending"; });
  const dateStr = new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
  const timeStr = new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});

  const ticketBlocks = todoTickets.map(function(t) {
    const photoHtml = t.photo ? "<div style='margin:10px 0'><img src='" + t.photo + "' style='max-width:100%;max-height:200px;object-fit:cover;border:1px solid #ddd'/></div>" : "";
    const areaSpan = t.area ? "<span style='font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.06em'>" + t.area + "</span>" : "";
    const assigneeSpan = (t.assignee && t.assignee!=="Unassigned") ? "<span style='font-size:11px;color:#1a237e;background:#e8eaf6;padding:2px 8px'>&rarr; " + t.assignee + "</span>" : "";
    return "<div style='border:1px solid #DDD8CF;padding:16px 18px;margin-bottom:14px;background:#fff;page-break-inside:avoid'><div style='display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap'><span style='background:#e8eaf6;color:#1a237e;padding:2px 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase'>TO DO</span><span style='font-family:monospace;font-size:11px;color:#888;background:#f5f5f5;padding:2px 8px'>" + (t.ticketNo||"—") + "</span>" + areaSpan + assigneeSpan + "</div><div style='font-size:15px;color:#2C2C2C;line-height:1.5;margin-bottom:8px'>" + (t.message||"") + "</div><div style='font-size:11px;color:#888'>" + formatDate(t.createdAt) + " &middot; " + (t.submittedBy||"Staff") + "</div>" + photoHtml + "</div>";
  }).join("");

  const html = "<!DOCTYPE html><html><head><title>Hampton Manor To Do Backup " + dateStr + "</title><link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap' rel='stylesheet'><style>body{font-family:'Gill Sans','Optima',sans-serif;padding:36px;color:#2C2C2C;background:#F5F2ED}h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 4px}.sub{color:#888;font-size:12px;letter-spacing:0.04em}.summary{display:flex;gap:20px;margin:16px 0 24px}.stat{background:#fff;border:1px solid #DDD8CF;padding:12px 18px;text-align:center}.stat-num{font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:500}.stat-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-top:2px}@media print{body{padding:16px}button{display:none}}</style></head><body><div style='border-bottom:2px solid #2C2C2C;padding-bottom:14px;margin-bottom:6px'><h1>Hampton Man&#248;r</h1><div class='sub'>Daily To Do Backup &middot; " + dateStr + " at " + timeStr + "</div></div><div class='summary'><div class='stat'><div class='stat-num'>" + todoTickets.length + "</div><div class='stat-label'>To Do</div></div><div class='stat'><div class='stat-num'>" + todoTickets.filter(function(t){return t.assignee&&t.assignee!=="Unassigned";}).length + "</div><div class='stat-label'>Assigned</div></div><div class='stat'><div class='stat-num'>" + todoTickets.filter(function(t){return !!t.photo;}).length + "</div><div class='stat-label'>With Photos</div></div></div>" + (todoTickets.length===0 ? "<p style='font-style:italic;color:#888;text-align:center;padding:40px 0'>No open To Do tickets at time of export.</p>" : ticketBlocks) + "<div style='border-top:1px solid #DDD8CF;margin-top:24px;padding-top:12px;font-size:10px;color:#aaa;text-align:center'>Hampton Manor Maintenance System &middot; Exported " + dateStr + " " + timeStr + "</div><div style='position:fixed;bottom:20px;right:20px'><button onclick='window.print()' style='background:#2C2C2C;color:#F5F2ED;border:none;padding:12px 20px;font-size:13px;cursor:pointer;letter-spacing:0.08em'>Print / Save as PDF</button></div></body></html>";

  const w = window.open("","_blank");
  w.document.write(html);
  w.document.close();
  setTimeout(function(){ w.print(); }, 800);
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function ticketsToCSV(tickets) {
  const headers = ["Ticket #","Date","Time","Area","Issue","Submitted By","Assigned To","Status"];
  const rows = tickets.map(function(t) {
    const d = t.createdAt ? new Date(t.createdAt) : new Date();
    return [
      t.ticketNo||"",
      d.toLocaleDateString("en-GB"),
      d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
      (t.area||"").replace(/,/g,""),
      (t.message||"").replace(/,/g,";"),
      (t.submittedBy||"").replace(/,/g,""),
      (t.assignee||"").replace(/,/g,""),
      (t.status||"").toUpperCase(),
    ];
  });
  return [headers, ...rows].map(function(r){ return r.map(function(v){ return '"'+v+'"'; }).join(","); }).join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function emailList(tickets, title, toEmail) {
  const lines = tickets.map(function(t) {
    return "[" + (t.ticketNo||"—") + "] " + formatDate(t.createdAt) + "\nLocation: " + (t.area||"—") + "\nIssue: " + (t.message||"") + "\nAssigned: " + (t.assignee||"—") + "\nStatus: " + (t.status||"todo").toUpperCase();
  }).join("\n\n---\n\n");
  const subject = encodeURIComponent("Hampton Manor Maintenance — " + title);
  const body    = encodeURIComponent("Hampton Manor Maintenance Log\n" + title + "\nExported: " + new Date().toLocaleString("en-GB") + "\n\n" + lines);
  window.location.href = "mailto:" + (toEmail||"") + "?subject=" + subject + "&body=" + body;
}

// ─── Ticket confirm modal ─────────────────────────────────────────────────────
function TicketConfirmModal({ ticketNo, onClose, t }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,44,44,0.6)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:B.cream, padding:"44px 36px", maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 12px 48px rgba(0,0,0,0.18)" }}>
        <div style={{ fontFamily:fontSerif, fontSize:13, letterSpacing:"0.15em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:8 }}>{t.successTitle}</div>
        <Ornament small />
        <div style={{ fontFamily:fontSerif, fontSize:15, color:B.charcoalMid, margin:"16px 0 12px" }}>{t.successRef}</div>
        <div style={{ background:B.creamDark, border:"1px solid " + B.creamBorder, padding:"16px 24px", margin:"0 0 20px" }}>
          <span style={{ fontFamily:"monospace", fontSize:20, fontWeight:700, color:B.charcoal, letterSpacing:"0.08em" }}>{ticketNo}</span>
        </div>
        <p style={{ color:B.charcoalLight, fontSize:13, fontFamily:fontSans, lineHeight:1.6, margin:"0 0 24px", letterSpacing:"0.02em" }}>{t.successNote}</p>
        <PrimaryBtn onClick={onClose}>{t.close}</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Staff form ───────────────────────────────────────────────────────────────
function StaffForm({ onSubmit }) {
  const [msg, setMsg]       = useState("");
  const [area, setArea]     = useState("");
  const [name, setName]     = useState("");
  const [photo, setPhoto]   = useState(null);
  const [ticketNo, setTicketNo] = useState(null);
  const [lang, setLang]     = useState("en");
  const [translating, setTranslating] = useState(false);
  const cameraRef = useRef();
  const uploadRef = useRef();
  const t = UI[lang] || UI.en;

  const handlePhoto = function(e) {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = function(ev) { setPhoto(ev.target.result); };
    r.readAsDataURL(file);
  };

  const handleSubmit = async function() {
    if (!msg.trim() || !area.trim()) return;
    setTranslating(true);
    let finalMsg = msg.trim();
    let finalArea = area.trim();
    if (lang !== "en") {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:500,
            messages:[{ role:"user", content:"Translate these maintenance report fields to English. Return ONLY a JSON object with keys 'message' and 'area', no other text.\n\nMessage: " + finalMsg + "\nArea: " + finalArea }]
          })
        });
        const data = await res.json();
        const text = (data.content && data.content[0] && data.content[0].text) || "";
        const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
        if (parsed.message) finalMsg  = parsed.message + " [Original: " + msg.trim() + "]";
        if (parsed.area)    finalArea = parsed.area;
      } catch(e) {}
    }
    setTranslating(false);
    const no = generateTicketNumber();
    onSubmit({ message:finalMsg, area:finalArea, submittedBy:name.trim()||"Staff", photo, status:"todo", ticketNo:no, lang });
    setMsg(""); setArea(""); setName(""); setPhoto(null); setLang("en");
    setTicketNo(no);
  };

  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:"0 24px 60px" }}>
      {ticketNo && <TicketConfirmModal ticketNo={ticketNo} onClose={function(){setTicketNo(null);}} t={t} />}
      <div style={{ textAlign:"center", padding:"48px 0 36px" }}>
        <LogoWordmark stacked navSize={28} />
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:16, marginBottom:4 }}>{t.estateTitle}</div>
        <h1 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase", lineHeight:1.1 }}>{t.reportTitle}</h1>
        <Ornament />
        <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalLight, letterSpacing:"0.04em", lineHeight:1.7, maxWidth:340, margin:"0 auto" }}>{t.reportSubtitle}</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
        <div>
          <label style={labelStyle}>{t.yourName} <span style={{ color:B.charcoalLight, fontWeight:400 }}>{t.optional}</span></label>
          <input value={name} onChange={function(e){setName(e.target.value);}} placeholder="e.g. Sarah" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>{t.language}</label>
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {Object.entries(UI).map(function(entry) {
              const code = entry[0]; const val = entry[1];
              return (
                <button key={code} onClick={function(){setLang(code);}} title={val.name} style={{
                  fontSize:26, lineHeight:1, padding:"6px 8px",
                  border:"2px solid " + (lang===code ? B.charcoal : B.creamBorder),
                  background: lang===code ? B.creamDark : "transparent",
                  borderRadius:4, cursor:"pointer", transition:"all 0.15s",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                }}>
                  <span>{val.flag}</span>
                  <span style={{ fontSize:8, fontFamily:fontSans, color:B.charcoalLight, letterSpacing:"0.04em", textTransform:"uppercase", lineHeight:1.4 }}>{val.name}</span>
                </button>
              );
            })}
          </div>
          <select value={lang} onChange={function(e){setLang(e.target.value);}} style={{ ...inputStyle, fontFamily:fontSans }}>
            {Object.entries(UI).map(function(entry) {
              const code = entry[0]; const val = entry[1];
              return <option key={code} value={code}>{val.flag} {val.name}</option>;
            })}
          </select>
          {lang !== "en" && <div style={{ fontSize:11, color:B.charcoalLight, fontFamily:fontSans, marginTop:6, letterSpacing:"0.03em" }}>{t.translateNote}</div>}
        </div>

        <div>
          <label style={labelStyle}>{t.where} <span style={{ color:B.charcoalLight, fontWeight:400 }}>*</span></label>
          <input value={area} onChange={function(e){setArea(e.target.value);}} placeholder={t.wherePlaceholder} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>{t.describeIssue} <span style={{ color:B.charcoalLight, fontWeight:400 }}>*</span></label>
          <textarea value={msg} onChange={function(e){setMsg(e.target.value);}}
            placeholder={t.describePlaceholder}
            rows={5} style={{ ...inputStyle, resize:"vertical", lineHeight:1.7, paddingTop:12 }} />
        </div>

        <div>
          <label style={labelStyle}>{t.photograph} <span style={{ color:B.charcoalLight, fontWeight:400 }}>{t.optional}</span></label>
          {photo ? (
            <div style={{ position:"relative" }}>
              <img src={photo} alt="Preview" style={{ width:"100%", maxHeight:200, objectFit:"cover", display:"block" }} />
              <button onClick={function(){setPhoto(null);}} style={{ position:"absolute", top:8, right:8, background:B.charcoal, color:B.cream, border:"none", padding:"4px 10px", fontSize:11, fontFamily:fontSans, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>{t.remove}</button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div onClick={function(){cameraRef.current.click();}} style={{ border:"1px dashed " + B.creamBorder, padding:"28px 16px", textAlign:"center", cursor:"pointer", background:"transparent" }}>
                <div style={{ fontSize:26, marginBottom:8, opacity:0.5 }}>📷</div>
                <div style={{ fontSize:11, color:B.charcoalLight, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:fontSans }}>{t.takePhoto}</div>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handlePhoto} />
              </div>
              <div onClick={function(){uploadRef.current.click();}} style={{ border:"1px dashed " + B.creamBorder, padding:"28px 16px", textAlign:"center", cursor:"pointer", background:"transparent" }}>
                <div style={{ fontSize:26, marginBottom:8, opacity:0.5 }}>⬆</div>
                <div style={{ fontSize:11, color:B.charcoalLight, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:fontSans }}>{t.uploadPhoto}</div>
                <input ref={uploadRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} />
              </div>
            </div>
          )}
        </div>

        <Ornament small />
        <PrimaryBtn onClick={handleSubmit} disabled={!msg.trim() || !area.trim() || translating}>
          {translating ? t.translating : t.submit}
        </PrimaryBtn>
        <p style={{ textAlign:"center", fontSize:11, color:B.charcoalLight, fontFamily:fontSans, letterSpacing:"0.05em", marginTop:-12 }}>{t.required}</p>
      </div>
    </div>
  );
}

// ─── Ticket card ──────────────────────────────────────────────────────────────
function TicketCard({ t, isManager, onUpdate, assignees }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:B.white, border:"1px solid " + B.creamBorder, marginBottom:10, overflow:"hidden" }}>
      <div onClick={function(){setOpen(function(o){return !o;});}} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <Badge status={t.status} />
            {t.ticketNo && <span style={{ fontFamily:"monospace", fontSize:10, color:B.charcoalLight, background:B.creamDark, padding:"2px 7px" }}>{t.ticketNo}</span>}
            {t.area && <span style={{ fontSize:11, color:B.charcoalLight, fontFamily:fontSans, letterSpacing:"0.06em", textTransform:"uppercase" }}>{t.area}</span>}
            {t.status==="todo" && t.assignee && t.assignee!=="Unassigned" && <span style={{ fontSize:11, color:B.charcoal, background:B.creamDark, padding:"2px 7px", fontFamily:fontSans }}>&rarr; {t.assignee}</span>}
          </div>
          <div style={{ fontSize:15, fontFamily:fontSerif, color:B.charcoal, lineHeight:1.5, wordBreak:"break-word" }}>{t.message}</div>
          <div style={{ fontSize:11, color:B.charcoalLight, fontFamily:fontSans, marginTop:5, letterSpacing:"0.04em" }}>🕐 {formatDate(t.createdAt)} · {t.submittedBy||"Staff"}</div>
        </div>
        <div style={{ fontSize:12, color:B.charcoalLight, flexShrink:0, marginTop:4, fontFamily:fontSans }}>{open?"▲":"▼"}</div>
      </div>
      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid " + B.creamBorder }}>
          {t.photo && <img src={t.photo} alt="Issue" style={{ width:"100%", maxHeight:240, objectFit:"cover", marginTop:12, marginBottom:12 }} />}
          {isManager && (
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:12 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[["To Do","todo","#1a237e"],["Complete","done","#2E5E1A"]].map(function(item) {
                  const label=item[0]; const val=item[1]; const col=item[2];
                  return (
                    <button key={val} onClick={function(){onUpdate(t.id,{status:val});}} style={{
                      padding:"7px 16px", border:"1px solid " + (t.status===val?col:B.creamBorder),
                      background:t.status===val?col:"transparent", color:t.status===val?B.cream:B.charcoalMid,
                      fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
                      fontWeight:600, cursor:"pointer"
                    }}>{label}</button>
                  );
                })}
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom:4 }}>Edit Location</label>
                <input value={t.area||""} onChange={function(e){onUpdate(t.id,{area:e.target.value});}} placeholder="Location…" style={inputStyle} />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom:4 }}>Assign To</label>
                <select value={t.assignee||"Unassigned"} onChange={function(e){onUpdate(t.id,{assignee:e.target.value});}} style={{ ...inputStyle, fontFamily:fontSans }}>
                  {assignees.map(function(a){ return <option key={a}>{a}</option>; })}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────
function SettingsPanel({ team, setTeam, onSave }) {
  const [newName, setNewName] = useState("");
  const [newPin,  setNewPin]  = useState("");
  const [saved,   setSaved]   = useState(false);
  const [showPins, setShowPins] = useState(false);

  const addMember = function() {
    if (!newName.trim()||!newPin.trim()) return;
    if (team.some(function(m){return m.pin===newPin.trim();})) { alert("PIN already in use."); return; }
    setTeam([...team,{name:newName.trim(),pin:newPin.trim()}]);
    setNewName(""); setNewPin("");
  };
  const removeMember = function(name) { setTeam(team.filter(function(m){return m.name!==name;})); };
  const updatePin    = function(name,pin) { setTeam(team.map(function(m){return m.name===name?{...m,pin}:m;})); };
  const handleSave   = async function() { await onSave(); setSaved(true); setTimeout(function(){setSaved(false);},2500); };

  return (
    <div>
      <div style={{ padding:"4px 0 20px", borderBottom:"1px solid " + B.creamBorder, marginBottom:24 }}>
        <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:B.charcoal, fontFamily:fontSerif, letterSpacing:"0.06em" }}>Settings</h3>
        <p style={{ color:B.charcoalLight, fontSize:13, margin:"4px 0 0", fontFamily:fontSans }}>Manage team PINs — syncs to all devices</p>
      </div>

      <div style={{ marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:B.charcoalLight }}>Team & PINs</div>
          <button onClick={function(){setShowPins(function(v){return !v;});}} style={{ fontSize:11, color:B.charcoalLight, background:"none", border:"1px solid " + B.creamBorder, padding:"5px 12px", cursor:"pointer", fontFamily:fontSans }}>{showPins?"Hide PINs":"Show PINs"}</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:16 }}>
          {team.map(function(m) {
            return (
              <div key={m.name} style={{ display:"flex", alignItems:"center", gap:12, background:B.white, border:"1px solid " + B.creamBorder, padding:"12px 16px" }}>
                <div style={{ flex:1, fontFamily:fontSerif, fontSize:16, color:B.charcoal }}>{m.name}</div>
                {showPins
                  ? <input value={m.pin} onChange={function(e){updatePin(m.name,e.target.value);}} maxLength={8} style={{ width:80, padding:"6px 10px", border:"1px solid " + B.creamBorder, fontFamily:"monospace", fontSize:14, textAlign:"center", background:B.cream }} />
                  : <span style={{ fontFamily:"monospace", fontSize:13, color:B.charcoalLight, letterSpacing:"0.1em" }}>••••</span>
                }
                <span onClick={function(){removeMember(m.name);}} style={{ cursor:"pointer", color:B.charcoalLight, fontSize:18, fontWeight:300, lineHeight:1 }}>×</span>
              </div>
            );
          })}
        </div>
        <div style={{ background:B.creamDark, border:"1px solid " + B.creamBorder, padding:16 }}>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:12 }}>Add Team Member</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <input value={newName} onChange={function(e){setNewName(e.target.value);}} placeholder="Full name" style={{ ...inputStyle, flex:2, minWidth:100, background:B.white }} />
            <input value={newPin}  onChange={function(e){setNewPin(e.target.value);}}  placeholder="PIN" maxLength={8} style={{ ...inputStyle, flex:1, minWidth:80, fontFamily:"monospace", background:B.white }} />
            <PrimaryBtn small onClick={addMember}>Add</PrimaryBtn>
          </div>
        </div>
      </div>
      <Ornament small />
      <div style={{ marginTop:20 }}>
        <PrimaryBtn onClick={handleSave}>{saved ? "✓ Saved to All Devices" : "Save Changes"}</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── User portal ──────────────────────────────────────────────────────────────
function UserPortal({ team, tickets, onUpdate, assignees }) {
  const [pin,  setPin]  = useState("");
  const [user, setUser] = useState(null);
  const [err,  setErr]  = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const login = function() {
    const found = team.find(function(m){return m.pin===pin.trim();});
    if (found) { setUser(found); setErr(false); }
    else { setErr(true); setPin(""); setTimeout(function(){setErr(false);},2000); }
  };

  if (!user) return (
    <div style={{ maxWidth:380, margin:"0 auto", padding:"60px 24px 40px", textAlign:"center" }}>
      <LogoWordmark stacked navSize={26} />
      <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:16, marginBottom:4 }}>Estate Maintenance</div>
      <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>My Tasks</h2>
      <Ornament />
      <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalLight, marginBottom:32, letterSpacing:"0.03em", lineHeight:1.6 }}>Enter your personal PIN to view your assigned tasks</p>
      <input type="password" inputMode="numeric" maxLength={6} value={pin}
        onChange={function(e){setPin(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")login();}}
        placeholder="· · · ·"
        style={{ ...inputStyle, textAlign:"center", fontSize:28, letterSpacing:"0.3em", marginBottom:4, borderBottom:"1px solid " + B.charcoal }} />
      {err && <div style={{ color:B.errorText, fontSize:12, fontFamily:fontSans, letterSpacing:"0.04em", marginTop:8, marginBottom:12 }}>PIN not recognised</div>}
      {!err && <div style={{ height:28 }}/>}
      <PrimaryBtn onClick={login}>Enter</PrimaryBtn>
      <p style={{ color:B.charcoalLight, fontSize:11, fontFamily:fontSans, marginTop:20, letterSpacing:"0.05em" }}>Your PIN is provided by the manager</p>
    </div>
  );

  const myOpen = tickets.filter(function(t){return t.assignee===user.name && t.status!=="done";});
  const myDone = tickets.filter(function(t){return t.assignee===user.name && t.status==="done";});
  const allMine= tickets.filter(function(t){return t.assignee===user.name;});

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"0 24px 60px" }}>
      <div style={{ textAlign:"center", padding:"40px 0 28px" }}>
        <LogoWordmark stacked navSize={26} />
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:12, marginBottom:4 }}>Welcome back</div>
        <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{user.name}</h2>
        <Ornament />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:28 }}>
        {[["To Do",myOpen.length],["Complete",myDone.length],["Total",allMine.length]].map(function(item) {
          return (
            <div key={item[0]} style={{ background:B.white, border:"1px solid " + B.creamBorder, padding:"18px 12px", textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:500, color:B.charcoal, fontFamily:fontSerif }}>{item[1]}</div>
              <div style={{ fontSize:10, color:B.charcoalLight, marginTop:4, fontFamily:fontSans, letterSpacing:"0.1em", textTransform:"uppercase" }}>{item[0]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        <button onClick={function(){setShowEmail(function(v){return !v;});}} style={{ padding:"9px 16px", border:"1px solid " + B.creamBorder, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>📧 Email My List</button>
        <button onClick={function(){printList(myOpen,"My Tasks — " + user.name);}} style={{ padding:"9px 16px", border:"1px solid " + B.creamBorder, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>🖨 Print</button>
        <button onClick={function(){setUser(null);}} style={{ padding:"9px 16px", border:"1px solid " + B.creamBorder, background:"transparent", color:B.charcoalLight, fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", marginLeft:"auto" }}>Sign Out</button>
      </div>

      {showEmail && (
        <div style={{ background:B.creamDark, border:"1px solid " + B.creamBorder, padding:16, marginBottom:20 }}>
          <label style={labelStyle}>Send open tasks to email</label>
          <div style={{ display:"flex", gap:8 }}>
            <input type="email" value={emailAddr} onChange={function(e){setEmailAddr(e.target.value);}} placeholder="you@example.com" style={{ ...inputStyle, flex:1 }} />
            <PrimaryBtn small onClick={function(){emailList(myOpen,"My Tasks — " + user.name,emailAddr);setShowEmail(false);}}>Send</PrimaryBtn>
          </div>
        </div>
      )}

      {myOpen.length===0 && myDone.length===0 && (
        <div style={{ textAlign:"center", padding:"48px 0" }}>
          <Ornament />
          <p style={{ fontFamily:fontSerif, fontSize:18, color:B.charcoalLight, fontStyle:"italic" }}>No tasks assigned to you at present</p>
        </div>
      )}

      {myOpen.length > 0 && (
        <>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:12, paddingBottom:8, borderBottom:"1px solid " + B.creamBorder }}>To Do</div>
          {myOpen.map(function(ticket) {
            return (
              <div key={ticket.id}>
                <TicketCard t={ticket} isManager={false} onUpdate={onUpdate} assignees={assignees} />
                <div style={{ marginTop:-8, marginBottom:12 }}>
                  <button onClick={function(){onUpdate(ticket.id,{status:"done"});}} style={{ width:"100%", padding:"10px", border:"1px solid #2E5E1A", background:"transparent", color:"#2E5E1A", fontFamily:fontSans, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600, cursor:"pointer" }}>✓ Mark as Complete</button>
                </div>
              </div>
            );
          })}
        </>
      )}
      {myDone.length > 0 && (
        <>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:B.charcoalLight, margin:"24px 0 12px", paddingBottom:8, borderBottom:"1px solid " + B.creamBorder }}>Complete</div>
          {myDone.map(function(ticket){ return <TicketCard key={ticket.id} t={ticket} isManager={false} onUpdate={onUpdate} assignees={assignees} />; })}
        </>
      )}
    </div>
  );
}

// ─── Manager Portal ───────────────────────────────────────────────────────────
function ManagerPortal({ tickets, onUpdate, team, setTeam, onSaveSettings, onClearCompleted }) {
  const assignees = ["Unassigned",...team.map(function(m){return m.name;})];
  const [tab, setTab]           = useState("all");
  const [search, setSearch]     = useState("");
  const [assignFilter, setAssignFilter] = useState("all");
  const [subView, setSubView]   = useState("tickets");
  const [emailAddr, setEmailAddr] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const todayStr   = new Date().toLocaleDateString("en-GB");
  const lastExport = localStorage.getItem("hm-last-export");
  const [showBackupPrompt, setShowBackupPrompt] = useState(lastExport !== todayStr);

  const handleExportAndDismiss = function() {
    exportTodoBackupPDF(tickets);
    localStorage.setItem("hm-last-export", todayStr);
    setShowBackupPrompt(false);
  };

  const filtered = tickets.filter(function(t) {
    const matchTab    = tab==="all" || (tab==="todo" ? (t.status==="todo"||t.status==="pending") : t.status===tab);
    const matchSearch = !search || t.message.toLowerCase().includes(search.toLowerCase()) || (t.area||"").toLowerCase().includes(search.toLowerCase()) || (t.submittedBy||"").toLowerCase().includes(search.toLowerCase()) || (t.ticketNo||"").toLowerCase().includes(search.toLowerCase());
    const matchAssign = assignFilter==="all" || (t.assignee||"Unassigned")===assignFilter;
    return matchTab && matchSearch && matchAssign;
  });

  const counts = {
    all:  tickets.length,
    todo: tickets.filter(function(t){return t.status==="todo"||t.status==="pending";}).length,
    done: tickets.filter(function(t){return t.status==="done";}).length,
  };

  const printLabel = tab==="todo" ? "To Do" : tab==="done" ? "Complete" : "All Issues";

  const NavBtn = function({v, label}) {
    return (
      <button onClick={function(){setSubView(v);}} style={{
        padding:"8px 16px", border:"none", background:"transparent",
        fontFamily:fontSans, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
        color: subView===v ? B.charcoal : B.charcoalLight,
        borderBottom: subView===v ? "2px solid " + B.charcoal : "2px solid transparent",
        cursor:"pointer", fontWeight: subView===v ? 700 : 400,
      }}>{label}</button>
    );
  };

  const TabBtn = function({t:tv, label}) {
    return (
      <button onClick={function(){setTab(tv);}} style={{
        padding:"7px 14px",
        border:"1px solid " + (tab===tv ? B.charcoal : B.creamBorder),
        background: tab===tv ? B.charcoal : "transparent",
        color: tab===tv ? B.cream : B.charcoalMid,
        fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
        fontWeight:600, cursor:"pointer",
      }}>{label} <span style={{opacity:0.6}}>({counts[tv]||counts.all})</span></button>
    );
  };

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px 60px" }}>
      <div style={{ textAlign:"center", padding:"40px 0 24px" }}>
        <LogoWordmark stacked navSize={28} />
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:12, marginBottom:4 }}>Estate Maintenance</div>
        <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Manager Portal</h2>
        <Ornament />
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:"1px solid " + B.creamBorder, marginBottom:28 }}>
        <NavBtn v="tickets" label="Tickets" />
        <NavBtn v="settings" label="Settings" />
      </div>

      {subView==="settings" ? (
        <SettingsPanel team={team} setTeam={setTeam} onSave={onSaveSettings} />
      ) : (
        <>
          {showBackupPrompt && counts.todo > 0 && (
            <div style={{ background:"#f0f4e8", border:"1px solid #c5d5a0", padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:fontSans, fontSize:12, fontWeight:700, color:"#2E5E1A", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:3 }}>Daily Backup Reminder</div>
                <div style={{ fontFamily:fontSans, fontSize:12, color:"#3a5a2a", lineHeight:1.5 }}>You have <strong>{counts.todo} open To Do tickets</strong>. Export today's backup PDF to keep a local record.</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={handleExportAndDismiss} style={{ padding:"8px 14px", background:"#2E5E1A", color:"#fff", border:"none", fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700, cursor:"pointer" }}>📋 Export Now</button>
                <button onClick={function(){localStorage.setItem("hm-last-export",todayStr);setShowBackupPrompt(false);}} style={{ padding:"8px 14px", background:"transparent", color:"#2E5E1A", border:"1px solid #2E5E1A", fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>Dismiss</button>
              </div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:24 }}>
            {[["All",counts.all],["To Do",counts.todo],["Complete",counts.done]].map(function(item) {
              return (
                <div key={item[0]} style={{ background:B.white, border:"1px solid " + B.creamBorder, padding:"18px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:28, fontWeight:500, color:B.charcoal, fontFamily:fontSerif }}>{item[1]}</div>
                  <div style={{ fontSize:10, color:B.charcoalLight, marginTop:4, fontFamily:fontSans, letterSpacing:"0.1em", textTransform:"uppercase" }}>{item[0]}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
            <TabBtn t="all"  label="All" />
            <TabBtn t="todo" label="To Do" />
            <TabBtn t="done" label="Complete" />
            <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
              <button onClick={function(){setShowEmail(function(v){return !v;});}} style={{ padding:"7px 12px", border:"1px solid " + B.creamBorder, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>📧</button>
              <button onClick={function(){printList(filtered,printLabel);}} style={{ padding:"7px 12px", border:"1px solid " + B.creamBorder, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>🖨</button>
              <button onClick={function(){exportTodoBackupPDF(tickets);}} style={{ padding:"7px 12px", border:"1px solid #1b5e20", background:"transparent", color:"#1b5e20", fontFamily:fontSans, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>📋 Daily Backup</button>
              <button onClick={function(){setShowClearConfirm(true);}} style={{ padding:"7px 12px", border:"1px solid #b71c1c", background:"transparent", color:"#b71c1c", fontFamily:fontSans, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>🗑 Clear Complete</button>
            </div>
          </div>

          {showEmail && (
            <div style={{ background:B.creamDark, border:"1px solid " + B.creamBorder, padding:14, marginBottom:16 }}>
              <label style={labelStyle}>Email current view to</label>
              <div style={{ display:"flex", gap:8 }}>
                <input type="email" value={emailAddr} onChange={function(e){setEmailAddr(e.target.value);}} placeholder="manager@hamptonmanor.co.uk" style={{ ...inputStyle, flex:1 }} />
                <PrimaryBtn small onClick={function(){emailList(filtered,printLabel,emailAddr);setShowEmail(false);}}>Send</PrimaryBtn>
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search tickets, locations, staff, reference…" style={{ ...inputStyle, flex:1, minWidth:160 }} />
            <select value={assignFilter} onChange={function(e){setAssignFilter(e.target.value);}} style={{ ...inputStyle, width:"auto", minWidth:130, fontFamily:fontSans }}>
              <option value="all">All Assignees</option>
              {assignees.map(function(a){ return <option key={a}>{a}</option>; })}
            </select>
          </div>

          {showClearConfirm && (
            <div style={{ position:"fixed", inset:0, background:"rgba(44,44,44,0.6)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
              <div style={{ background:B.cream, padding:"36px 32px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 12px 48px rgba(0,0,0,0.18)" }}>
                <div style={{ fontFamily:fontSerif, fontSize:20, fontWeight:500, color:B.charcoal, marginBottom:8, letterSpacing:"0.04em" }}>Clear Completed Tickets?</div>
                <Ornament small />
                <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalMid, lineHeight:1.7, margin:"16px 0 24px" }}>
                  This will permanently delete all <strong>{counts.done} completed tickets</strong>.<br/><br/>
                  A CSV export will be automatically downloaded to your device before deletion.
                </p>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={function(){setShowClearConfirm(false);}} style={{ flex:1, padding:"12px", border:"1px solid " + B.creamBorder, background:"transparent", fontFamily:fontSans, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", color:B.charcoalMid }}>Cancel</button>
                  <button onClick={function(){onClearCompleted();setShowClearConfirm(false);}} style={{ flex:1, padding:"12px", border:"1px solid #b71c1c", background:"#b71c1c", color:"#fff", fontFamily:fontSans, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", fontWeight:700 }}>Confirm & Clear</button>
                </div>
              </div>
            </div>
          )}

          {filtered.length===0 ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <Ornament />
              <p style={{ fontFamily:fontSerif, fontSize:18, color:B.charcoalLight, fontStyle:"italic" }}>No issues found</p>
            </div>
          ) : (
            filtered.map(function(ticket){ return <TicketCard key={ticket.id} t={ticket} isManager={true} onUpdate={onUpdate} assignees={assignees} />; })
          )}
        </>
      )}
    </div>
  );
}

// ─── Submitted Tickets (public) ───────────────────────────────────────────────
function EstateLog({ tickets }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = tickets.filter(function(t) {
    const matchFilter = filter==="all" || (filter==="todo" ? (t.status==="todo"||t.status==="pending") : t.status===filter);
    const matchSearch = !search || (t.area||"").toLowerCase().includes(search.toLowerCase()) || t.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all:  tickets.length,
    todo: tickets.filter(function(t){return t.status==="todo"||t.status==="pending";}).length,
    done: tickets.filter(function(t){return t.status==="done";}).length,
  };

  const TabBtn = function({v, label}) {
    return (
      <button onClick={function(){setFilter(v);}} style={{
        padding:"7px 14px", border:"1px solid " + (filter===v ? B.charcoal : B.creamBorder),
        background: filter===v ? B.charcoal : "transparent",
        color: filter===v ? B.cream : B.charcoalMid,
        fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
        fontWeight:600, cursor:"pointer",
      }}>{label} <span style={{opacity:0.6}}>({v==="all"?counts.all:counts[v]||0})</span></button>
    );
  };

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"0 24px 60px" }}>
      <div style={{ textAlign:"center", padding:"40px 0 28px" }}>
        <LogoWordmark stacked navSize={26} />
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:12, marginBottom:4 }}>Hampton Manor</div>
        <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Submitted Tickets</h2>
        <Ornament />
        <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalLight, letterSpacing:"0.03em", lineHeight:1.6, maxWidth:400, margin:"0 auto" }}>Live view of all reported maintenance issues across the estate.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:24 }}>
        {[["All",counts.all],["To Do",counts.todo],["Complete",counts.done]].map(function(item) {
          return (
            <div key={item[0]} style={{ background:B.white, border:"1px solid " + B.creamBorder, padding:"18px 12px", textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:500, color:B.charcoal, fontFamily:fontSerif }}>{item[1]}</div>
              <div style={{ fontSize:10, color:B.charcoalLight, marginTop:4, fontFamily:fontSans, letterSpacing:"0.1em", textTransform:"uppercase" }}>{item[0]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <TabBtn v="all"  label="All" />
        <TabBtn v="todo" label="To Do" />
        <TabBtn v="done" label="Complete" />
      </div>

      <div style={{ marginBottom:20 }}>
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search by area or issue…" style={inputStyle} />
      </div>

      {filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:"48px 0" }}>
          <Ornament />
          <p style={{ fontFamily:fontSerif, fontSize:18, color:B.charcoalLight, fontStyle:"italic" }}>No issues found</p>
        </div>
      ) : (
        filtered.map(function(t) {
          return (
            <div key={t.id} style={{ background:B.white, border:"1px solid " + B.creamBorder, marginBottom:8, padding:"16px 18px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
                    <Badge status={t.status==="pending"?"todo":t.status} />
                    {t.ticketNo && <span style={{ fontFamily:"monospace", fontSize:10, color:B.charcoalLight, background:B.creamDark, padding:"2px 7px" }}>{t.ticketNo}</span>}
                    {t.area && <span style={{ fontSize:11, color:B.charcoalLight, fontFamily:fontSans, letterSpacing:"0.06em", textTransform:"uppercase" }}>{t.area}</span>}
                  </div>
                  <div style={{ fontSize:15, fontFamily:fontSerif, color:B.charcoal, lineHeight:1.5, wordBreak:"break-word" }}>{t.message}</div>
                  <div style={{ fontSize:11, color:B.charcoalLight, fontFamily:fontSans, marginTop:5, letterSpacing:"0.04em" }}>🕐 {formatDate(t.createdAt)}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Manager PIN gate ─────────────────────────────────────────────────────────
function ManagerPinGate({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const check = function() {
    if (pin===MANAGER_PIN) { onSuccess(); }
    else { setErr(true); setPin(""); setTimeout(function(){setErr(false);},2000); }
  };
  return (
    <div style={{ maxWidth:380, margin:"0 auto", padding:"60px 24px 40px", textAlign:"center" }}>
      <LogoWordmark stacked navSize={26} />
      <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:16, marginBottom:4 }}>Restricted Access</div>
      <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Manager</h2>
      <Ornament />
      <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalLight, marginBottom:32, letterSpacing:"0.03em" }}>Enter your PIN to continue</p>
      <input type="password" inputMode="numeric" maxLength={6} value={pin}
        onChange={function(e){setPin(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")check();}}
        placeholder="· · · ·"
        style={{ ...inputStyle, textAlign:"center", fontSize:28, letterSpacing:"0.3em", marginBottom:4, borderBottom:"1px solid " + B.charcoal }} />
      {err && <div style={{ color:B.errorText, fontSize:12, fontFamily:fontSans, letterSpacing:"0.04em", marginTop:8, marginBottom:12 }}>Incorrect PIN</div>}
      {!err && <div style={{ height:28 }}/>}
      <PrimaryBtn onClick={check}>Enter</PrimaryBtn>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ view, setView }) {
  const isManager = view==="manager";
  const isUser    = view==="user";
  const isStaff   = view==="staff";
  const isLog     = view==="log";

  const NavLink = function({v, label}) {
    const active = (isStaff&&v==="staff") || (isLog&&v==="log") || (isUser&&v==="user") || (isManager&&v==="manager-gate");
    return (
      <button onClick={function(){setView(v==="manager-gate"?(isManager?"manager":"manager-gate"):v);}} style={{
        background:"transparent", border:"none",
        borderBottom:"2px solid " + (active ? B.charcoal : "transparent"),
        color: active ? B.charcoal : B.charcoalLight,
        fontFamily:fontSans, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
        padding:"0 12px", height:60, cursor:"pointer", fontWeight: active ? 700 : 400,
      }}>{label}</button>
    );
  };

  return (
    <div style={{ background:B.cream, borderBottom:"1px solid " + B.creamBorder, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", height:60 }}>
        <div style={{ flex:1 }}>
          <LogoWordmark navSize={18} />
        </div>
        <div style={{ display:"flex", gap:0 }}>
          <NavLink v="staff"        label="Report" />
          <NavLink v="log"          label="Submitted" />
          <NavLink v="user"         label="My Tasks" />
          <NavLink v="manager-gate" label="Manager" />
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]       = useState("staff");
  const [tickets, setTickets] = useState([]);
  const [team, setTeam]       = useState(DEFAULT_TEAM);
  const [loading, setLoading] = useState(true);

  useEffect(function(){
    Promise.all([loadData("hm-tickets"),loadData("hm-team")])
      .then(function(results){
        if(results[0]) setTickets(results[0]);
        if(results[1]) setTeam(results[1]);
        setLoading(false);
      });
  },[]);

  useEffect(function(){
    const id = setInterval(function(){
      loadData("hm-tickets").then(function(t){ if(t) setTickets(t); });
    }, 15000);
    return function(){ clearInterval(id); };
  },[]);

  const addTicket = async function(data) {
    const ticket = { id:Date.now().toString(), createdAt:new Date().toISOString(), status:"todo", assignee:"Unassigned", ...data };
    const updated = [ticket,...tickets];
    setTickets(updated);
    await saveData("hm-tickets",updated);
  };

  const updateTicket = async function(id,changes) {
    const updated = tickets.map(function(t){ return t.id===id ? {...t,...changes} : t; });
    setTickets(updated);
    await saveData("hm-tickets",updated);
  };

  const saveSettings = async function() {
    await saveData("hm-team",team);
  };

  const clearCompleted = async function() {
    const completed = tickets.filter(function(t){return t.status==="done";});
    if (completed.length===0) return;
    const csv     = ticketsToCSV(completed);
    const dateStr = new Date().toLocaleDateString("en-GB").split("/").join("-");
    downloadCSV(csv, "HamptonManor-Completed-" + dateStr + ".csv");
    const remaining = tickets.filter(function(t){return t.status!=="done";});
    setTickets(remaining);
    await saveData("hm-tickets",remaining);
  };

  if (loading) return (
    <div style={{ background:B.cream, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <LogoWordmark stacked navSize={26} />
      <Ornament small />
      <div style={{ fontFamily:fontSans, fontSize:11, color:B.charcoalLight, letterSpacing:"0.12em", textTransform:"uppercase" }}>Loading…</div>
    </div>
  );

  const assignees = ["Unassigned",...team.map(function(m){return m.name;})];

  return (
    <div style={{ fontFamily:fontSerif, background:B.cream, minHeight:"100vh" }}>
      <Header view={view} setView={setView} />
      <div>
        {view==="staff"        && <StaffForm onSubmit={addTicket} />}
        {view==="log"          && <EstateLog tickets={tickets} />}
        {view==="user"         && <UserPortal team={team} tickets={tickets} onUpdate={updateTicket} assignees={assignees} />}
        {view==="manager-gate" && <ManagerPinGate onSuccess={function(){setView("manager");}} />}
        {view==="manager"      && <ManagerPortal tickets={tickets} onUpdate={updateTicket} team={team} setTeam={setTeam} onSaveSettings={saveSettings} onClearCompleted={clearCompleted} />}
      </div>
      <div style={{ borderTop:"1px solid " + B.creamBorder, padding:"24px", textAlign:"center", marginTop:40 }}>
        <LogoWordmark navSize={13} />
        <div style={{ fontFamily:fontSans, fontSize:10, color:B.charcoalLight, marginTop:8, letterSpacing:"0.08em" }}>Estate Maintenance System</div>
      </div>
    </div>
  );
}
