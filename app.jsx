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
  cream:      "#F5F2ED",
  creamDark:  "#EDE9E2",
  creamBorder:"#DDD8CF",
  charcoal:   "#2C2C2C",
  charcoalMid:"#555050",
  charcoalLight:"#888180",
  white:      "#FFFFFF",
  successBg:  "#EEF2EB",
  successText:"#3A5A2A",
  errorText:  "#8B2020",
  todoBg:     "#EDEAE4",
  doneBg:     "#EEF2EB",
  todoText:   "#2C2C2C",
  doneText:   "#3A5A2A",
};

const fontSerif  = "'Cormorant Garamond', 'Garamond', 'Georgia', serif";
const fontSans   = "'Gill Sans', 'Optima', 'Trebuchet MS', sans-serif";

// ─── Google Font import (injected once) ──────────────────────────────────────
if (!document.getElementById("hm-fonts")) {
  const link = document.createElement("link");
  link.id   = "hm-fonts";
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap";
  document.head.appendChild(link);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusMeta = (s) => s==="done"
  ? { bg:B.doneBg,  text:B.doneText,  border:"#B8CCA8", label:"Complete" }
  : { bg:B.todoBg,  text:B.charcoal,  border:B.creamBorder, label:"To Do" };

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
    +" · "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
}

function generateTicketNumber() {
  const n=new Date(), yy=String(n.getFullYear()).slice(-2), mm=String(n.getMonth()+1).padStart(2,"0");
  return `HM-${yy}${mm}-${String(Math.floor(Math.random()*9000)+1000)}`;
}

// ─── Supabase config ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://nolzqgcqfwexjmpdrpuh.supabase.co";
const SUPABASE_KEY = "sb_publishable_0s2_DNo7OFtB8USXnurY_g_ZU9krNoy";
const SB_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

async function loadData(key) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tickets?key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
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
    await fetch(
      `${SUPABASE_URL}/rest/v1/tickets`,
      {
        method: "POST",
        headers: { ...SB_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }),
      }
    );
  } catch {}
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle = {
  width:"100%", padding:"12px 14px", borderRadius:0,
  border:"none", borderBottom:`1px solid ${B.creamBorder}`,
  fontSize:15, background:"transparent", boxSizing:"border-box",
  color:B.charcoal, fontFamily:fontSans, outline:"none",
  letterSpacing:"0.02em",
};
const labelStyle = {
  display:"block", fontSize:11, fontWeight:600, color:B.charcoalLight,
  marginBottom:8, letterSpacing:"0.12em", textTransform:"uppercase",
  fontFamily:fontSans,
};

// ─── Divider ornament ─────────────────────────────────────────────────────────
function Ornament({ small }) {
  return (
    <div style={{ textAlign:"center", margin: small?"12px 0":"20px 0", opacity:0.45 }}>
      <svg width={small?60:90} height={small?12:18} viewBox="0 0 90 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="9" x2="32" y2="9" stroke={B.charcoal} strokeWidth="0.75"/>
        <path d="M38 9 C42 3, 48 3, 52 9 C48 15, 42 15, 38 9Z" fill={B.charcoal}/>
        <path d="M52 9 C56 3, 62 3, 66 9" stroke={B.charcoal} strokeWidth="0.75" fill="none"/>
        <path d="M62 6 L66 9 L62 12" stroke={B.charcoal} strokeWidth="0.75" fill="none"/>
        <circle cx="45" cy="9" r="1.5" fill={B.cream}/>
        <line x1="58" y1="9" x2="90" y2="9" stroke={B.charcoal} strokeWidth="0.75"/>
      </svg>
    </div>
  );
}

// ─── Logo wordmark ────────────────────────────────────────────────────────────
function LogoWordmark({ stacked=false, navSize=22, onDark=false }) {
  const col = onDark ? "#F5F2ED" : "#2C2C2C";
  if (stacked) {
    return (
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Cormorant Garamond','Garamond','Georgia',serif", fontSize:navSize*1.8, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:col, lineHeight:1.2 }}>
          Hampton<br/>Manor
        </div>
      </div>
    );
  }
  return (
    <span style={{ fontFamily:"'Cormorant Garamond','Garamond','Georgia',serif", fontSize:navSize, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:col }}>
      Hampton Manor
    </span>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const m = statusMeta(status);
  return (
    <span style={{
      background:m.bg, color:m.text, border:`1px solid ${m.border}`,
      borderRadius:2, padding:"3px 10px", fontSize:10, fontWeight:600,
      letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:fontSans,
    }}>{m.label}</span>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryBtn({ onClick, disabled, children, small, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: outline ? "transparent" : (disabled ? B.creamBorder : B.charcoal),
      color: outline ? B.charcoal : (disabled ? B.charcoalLight : B.cream),
      border: `1px solid ${disabled ? B.creamBorder : B.charcoal}`,
      padding: small ? "8px 18px" : "14px 28px",
      fontSize: small ? 11 : 12,
      fontFamily: fontSans,
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer",
      borderRadius: 0,
      transition: "all 0.2s",
      width: small ? "auto" : "100%",
    }}>{children}</button>
  );
}

// ─── Print ────────────────────────────────────────────────────────────────────
function printList(tickets, title) {
  const rows = tickets.map(t=>`
    <tr>
      <td style="font-family:monospace;font-size:11px;white-space:nowrap">${t.ticketNo||"—"}</td>
      <td style="white-space:nowrap;font-size:12px">${formatDate(t.createdAt)}</td>
      <td><strong>${t.area||"—"}</strong></td>
      <td>${t.message}</td>
      <td>${t.assignee||"—"}</td>
      <td style="font-weight:700;text-transform:uppercase;font-size:11px">${t.status||"todo"}</td>
    </tr>`).join("");
  const w=window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap" rel="stylesheet">
    <style>
      body{font-family:'Gill Sans','Optima',sans-serif;padding:40px;color:#2C2C2C;background:#F5F2ED}
      h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;border-bottom:1px solid #DDD8CF;padding-bottom:12px;margin-bottom:8px}
      .sub{color:#888;font-size:12px;margin-bottom:28px;letter-spacing:0.05em}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#2C2C2C;color:#F5F2ED;padding:10px 12px;text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase}
      td{padding:10px 12px;border-bottom:1px solid #DDD8CF;vertical-align:top}
      tr:nth-child(even) td{background:#EDE9E2}
      @media print{body{padding:0}}
    </style>
  </head><body>
    <h1>Hampton Man&#248;r</h1>
    <div class="sub">${title} &nbsp;·&nbsp; Printed ${new Date().toLocaleString("en-GB")} &nbsp;·&nbsp; ${tickets.length} issue${tickets.length!==1?"s":""}</div>
    <table><thead><tr><th>Ticket #</th><th>Date &amp; Time</th><th>Location</th><th>Issue</th><th>Assigned To</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>
  </body></html>`);
  w.document.close(); w.print();
}

function emailList(tickets, title, toEmail) {
  const lines=tickets.map(t=>`[${t.ticketNo||"—"}] ${formatDate(t.createdAt)}\nLocation: ${t.area||"—"}\nIssue: ${t.message}\nAssigned: ${t.assignee||"—"}\nStatus: ${(t.status||"todo").toUpperCase()}\n`).join("\n---\n\n");
  const subject=encodeURIComponent(`Hampton Manor Maintenance — ${title}`);
  const body=encodeURIComponent(`Hampton Manor Maintenance Log\n${title}\nExported: ${new Date().toLocaleString("en-GB")}\n\n${lines}`);
  window.location.href=`mailto:${toEmail||""}?subject=${subject}&body=${body}`;
}

// ─── Ticket Confirm Modal ─────────────────────────────────────────────────────
function TicketConfirmModal({ ticketNo, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,44,44,0.6)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:B.cream, padding:"44px 36px", maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 12px 48px rgba(0,0,0,0.18)" }}>
        <div style={{ fontFamily:fontSerif, fontSize:13, letterSpacing:"0.15em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:8 }}>Issue Logged</div>
        <Ornament small />
        <div style={{ fontFamily:fontSerif, fontSize:15, color:B.charcoalMid, margin:"16px 0 12px" }}>Your ticket reference</div>
        <div style={{ background:B.creamDark, border:`1px solid ${B.creamBorder}`, padding:"16px 24px", margin:"0 0 20px" }}>
          <span style={{ fontFamily:"monospace", fontSize:20, fontWeight:700, color:B.charcoal, letterSpacing:"0.08em" }}>{ticketNo}</span>
        </div>
        <p style={{ color:B.charcoalLight, fontSize:13, fontFamily:fontSans, lineHeight:1.6, margin:"0 0 24px", letterSpacing:"0.02em" }}>
          Please note this reference. The estate manager will review your report shortly.
        </p>
        <PrimaryBtn onClick={onClose}>Close</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Staff Log Form ───────────────────────────────────────────────────────────
function StaffForm({ onSubmit }) {
  const [msg, setMsg]     = useState("");
  const [area, setArea]   = useState("");
  const [name, setName]   = useState("");
  const [photo, setPhoto] = useState(null);
  const [ticketNo, setTicketNo] = useState(null);
  const cameraRef = useRef();
  const uploadRef = useRef();

  const handlePhoto = e => {
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader(); r.onload=ev=>setPhoto(ev.target.result); r.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!msg.trim()) return;
    const no = generateTicketNumber();
    onSubmit({ message:msg.trim(), area:area.trim(), submittedBy:name.trim()||"Staff", photo, status:"todo", ticketNo:no });
    setMsg(""); setArea(""); setName(""); setPhoto(null);
    setTicketNo(no);
  };

  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:"0 24px 60px" }}>
      {ticketNo && <TicketConfirmModal ticketNo={ticketNo} onClose={()=>setTicketNo(null)} />}

      {/* Hero heading */}
      <div style={{ textAlign:"center", padding:"48px 0 36px" }}>
        <LogoWordmark stacked navSize={28} />
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:16, marginBottom:4 }}>Estate Maintenance</div>
        <h1 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase", lineHeight:1.1 }}>
          Report an Issue
        </h1>
        <Ornament />
        <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalLight, letterSpacing:"0.04em", lineHeight:1.7, maxWidth:340, margin:"0 auto" }}>
          Please describe the issue below. The estate management team will be notified and respond promptly.
        </p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

        {/* Name */}
        <div>
          <label style={labelStyle}>Your Name <span style={{ color:B.charcoalLight, fontWeight:400 }}>(optional)</span></label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sarah" style={inputStyle} />
        </div>

        {/* WHERE — free type */}
        <div>
          <label style={labelStyle}>Where? <span style={{ color:B.charcoalLight, fontWeight:400 }}>*</span></label>
          <input
            value={area}
            onChange={e=>setArea(e.target.value)}
            placeholder="e.g. Manor Bedroom 4, Kitchen, Walled Garden…"
            style={inputStyle}
          />
        </div>

        {/* Issue description */}
        <div>
          <label style={labelStyle}>Describe the Issue <span style={{ color:B.charcoalLight, fontWeight:400 }}>*</span></label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)}
            placeholder="Please describe the problem in as much detail as possible…"
            rows={5} style={{ ...inputStyle, resize:"vertical", lineHeight:1.7, paddingTop:12 }} />
        </div>

        {/* Photo */}
        <div>
          <label style={labelStyle}>Photograph <span style={{ color:B.charcoalLight, fontWeight:400 }}>(optional)</span></label>
          {photo ? (
            <div style={{ position:"relative" }}>
              <img src={photo} alt="Preview" style={{ width:"100%", maxHeight:200, objectFit:"cover", display:"block" }} />
              <button onClick={()=>setPhoto(null)} style={{ position:"absolute", top:8, right:8, background:B.charcoal, color:B.cream, border:"none", borderRadius:0, padding:"4px 10px", fontSize:11, fontFamily:fontSans, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>Remove</button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {/* Take photo tile */}
              <div onClick={()=>cameraRef.current.click()} style={{ border:`1px dashed ${B.creamBorder}`, padding:"28px 16px", textAlign:"center", cursor:"pointer", background:"transparent", transition:"background 0.2s" }}>
                <div style={{ fontSize:26, marginBottom:8, opacity:0.5 }}>📷</div>
                <div style={{ fontSize:11, color:B.charcoalLight, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:fontSans }}>Take Photo</div>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handlePhoto} />
              </div>
              {/* Upload photo tile */}
              <div onClick={()=>uploadRef.current.click()} style={{ border:`1px dashed ${B.creamBorder}`, padding:"28px 16px", textAlign:"center", cursor:"pointer", background:"transparent", transition:"background 0.2s" }}>
                <div style={{ fontSize:26, marginBottom:8, opacity:0.5 }}>⬆</div>
                <div style={{ fontSize:11, color:B.charcoalLight, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:fontSans }}>Upload Photo</div>
                <input ref={uploadRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} />
              </div>
            </div>
          )}
        </div>

        <Ornament small />
        <PrimaryBtn onClick={handleSubmit} disabled={!msg.trim() || !area.trim()}>Submit Report</PrimaryBtn>
        <p style={{ textAlign:"center", fontSize:11, color:B.charcoalLight, fontFamily:fontSans, letterSpacing:"0.05em", marginTop:-12 }}>
          Both location and issue description are required
        </p>
      </div>
    </div>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function TicketCard({ t, isManager, onUpdate, assignees, areas }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:B.white, border:`1px solid ${B.creamBorder}`, marginBottom:10, overflow:"hidden" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:"16px 18px", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
            <Badge status={t.status} />
            {t.ticketNo && <span style={{ fontFamily:"monospace", fontSize:10, color:B.charcoalLight, background:B.creamDark, padding:"2px 7px", letterSpacing:"0.04em" }}>{t.ticketNo}</span>}
            {t.status==="todo" && t.assignee && t.assignee!=="Unassigned" &&
              <span style={{ fontSize:10, color:B.charcoal, background:B.creamDark, padding:"2px 8px", fontFamily:fontSans, letterSpacing:"0.06em", textTransform:"uppercase" }}>→ {t.assignee}</span>}
          </div>
          {t.area && <div style={{ fontSize:11, color:B.charcoalLight, fontFamily:fontSans, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>{t.area}</div>}
          <div style={{ fontSize:15, fontFamily:fontSerif, color:B.charcoal, lineHeight:1.5, wordBreak:"break-word" }}>{t.message}</div>
          <div style={{ fontSize:11, color:B.charcoalLight, fontFamily:fontSans, marginTop:6, letterSpacing:"0.04em" }}>
            🕐 {formatDate(t.createdAt)} &nbsp;·&nbsp; {t.submittedBy||"Staff"}
          </div>
        </div>
        <div style={{ fontSize:12, color:B.charcoalLight, flexShrink:0, marginTop:4, fontFamily:fontSans, letterSpacing:"0.06em" }}>{open?"▲":"▼"}</div>
      </div>

      {open && (
        <div style={{ padding:"0 18px 18px", borderTop:`1px solid ${B.creamBorder}` }}>
          {t.photo && <img src={t.photo} alt="Issue" style={{ width:"100%", maxHeight:260, objectFit:"cover", marginTop:14, marginBottom:14 }} />}
          {isManager && (
            <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:14 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[["To Do","todo","#1a237e"],["Complete","done","#2E5E1A"]].map(([label,val,col])=>(
                  <button key={val} onClick={()=>onUpdate(t.id,{status:val})} style={{
                    padding:"7px 16px", border:`1px solid ${t.status===val?col:B.creamBorder}`,
                    background:t.status===val?col:"transparent", color:t.status===val?B.cream:B.charcoalMid,
                    fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
                    fontWeight:600, cursor:"pointer", borderRadius:0, transition:"all 0.15s"
                  }}>{label}</button>
                ))}
              </div>
              <div>
                <label style={labelStyle}>Edit Location</label>
                <input value={t.area||""} onChange={e=>onUpdate(t.id,{area:e.target.value})} placeholder="e.g. Manor Bedroom 4…" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Assign To</label>
                <select value={t.assignee||"Unassigned"} onChange={e=>onUpdate(t.id,{assignee:e.target.value})} style={{...inputStyle, fontFamily:fontSans}}>
                  {assignees.map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── User Portal ──────────────────────────────────────────────────────────────
function UserPortal({ team, tickets, onUpdate, assignees }) {
  const [pin, setPin]   = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr]   = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const login = () => {
    const found=team.find(m=>m.pin===pin.trim());
    if(found){setUser(found);setErr(false);}
    else{setErr(true);setPin("");setTimeout(()=>setErr(false),2000);}
  };

  if (!user) return (
    <div style={{ maxWidth:380, margin:"0 auto", padding:"60px 24px 40px", textAlign:"center" }}>
      <LogoWordmark stacked navSize={26} />
      <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:16, marginBottom:4 }}>Estate Maintenance</div>
      <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>My Tasks</h2>
      <Ornament />
      <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalLight, marginBottom:32, letterSpacing:"0.03em", lineHeight:1.6 }}>Enter your personal PIN to view your assigned maintenance tasks</p>
      <input type="password" inputMode="numeric" maxLength={6} value={pin}
        onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
        placeholder="· · · ·"
        style={{...inputStyle, textAlign:"center", fontSize:28, letterSpacing:"0.3em", marginBottom:4, borderBottom:`1px solid ${B.charcoal}`}} />
      {err && <div style={{ color:B.errorText, fontSize:12, fontFamily:fontSans, letterSpacing:"0.04em", marginBottom:12, marginTop:8 }}>PIN not recognised</div>}
      {!err && <div style={{ height:28 }}/>}
      <PrimaryBtn onClick={login}>Enter</PrimaryBtn>
      <p style={{ color:B.charcoalLight, fontSize:11, fontFamily:fontSans, marginTop:20, letterSpacing:"0.05em" }}>Your PIN is provided by the manager</p>
    </div>
  );

  const myOpen = tickets.filter(t=>t.assignee===user.name && t.status!=="done");
  const myDone = tickets.filter(t=>t.assignee===user.name && t.status==="done");
  const allMine= tickets.filter(t=>t.assignee===user.name);

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"0 24px 60px" }}>
      <div style={{ textAlign:"center", padding:"40px 0 28px" }}>
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:10 }}>Welcome back</div>
        <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{user.name}</h2>
        <Ornament />
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:28 }}>
        {[["Open Tasks",myOpen.length],["Completed",myDone.length],["Total Assigned",allMine.length]].map(([label,count])=>(
          <div key={label} style={{ background:B.white, border:`1px solid ${B.creamBorder}`, padding:"20px 16px", textAlign:"center" }}>
            <div style={{ fontSize:30, fontWeight:500, color:B.charcoal, fontFamily:fontSerif }}>{count}</div>
            <div style={{ fontSize:10, color:B.charcoalLight, marginTop:4, fontFamily:fontSans, letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        <button onClick={()=>setShowEmail(v=>!v)} style={{ padding:"9px 16px", border:`1px solid ${B.creamBorder}`, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>📧 Email My List</button>
        <button onClick={()=>printList(myOpen,`My Tasks — ${user.name}`)} style={{ padding:"9px 16px", border:`1px solid ${B.creamBorder}`, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>🖨 Print</button>
        <button onClick={()=>setUser(null)} style={{ padding:"9px 16px", border:`1px solid ${B.creamBorder}`, background:"transparent", color:B.charcoalLight, fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", marginLeft:"auto" }}>Sign Out</button>
      </div>

      {showEmail && (
        <div style={{ background:B.creamDark, border:`1px solid ${B.creamBorder}`, padding:16, marginBottom:20 }}>
          <label style={labelStyle}>Send open tasks to email</label>
          <div style={{ display:"flex", gap:8 }}>
            <input type="email" value={emailAddr} onChange={e=>setEmailAddr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(emailList(myOpen,`My Tasks — ${user.name}`,emailAddr),setShowEmail(false))} placeholder="you@example.com" style={{...inputStyle,flex:1}} />
            <PrimaryBtn small onClick={()=>{emailList(myOpen,`My Tasks — ${user.name}`,emailAddr);setShowEmail(false);}}>Send</PrimaryBtn>
          </div>
        </div>
      )}

      {myOpen.length===0&&myDone.length===0 && (
        <div style={{ textAlign:"center", padding:"48px 0" }}>
          <Ornament />
          <p style={{ fontFamily:fontSerif, fontSize:18, color:B.charcoalLight, fontStyle:"italic" }}>No tasks assigned to you at present</p>
        </div>
      )}

      {myOpen.length>0 && (
        <>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${B.creamBorder}` }}>To Do</div>
          {myOpen.map(t=>(
            <div key={t.id}>
              <TicketCard t={t} isManager={false} onUpdate={onUpdate} assignees={assignees} areas={[]} />
              <div style={{ marginTop:-8, marginBottom:12 }}>
                <button onClick={()=>onUpdate(t.id,{status:"done"})} style={{
                  width:"100%", padding:"10px", border:`1px solid #2E5E1A`,
                  background:"transparent", color:"#2E5E1A", fontFamily:fontSans,
                  fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
                  fontWeight:600, cursor:"pointer"
                }}>✓ Mark as Complete</button>
              </div>
            </div>
          ))}
        </>
      )}
      {myDone.length>0 && (
        <>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:B.charcoalLight, margin:"24px 0 12px", paddingBottom:8, borderBottom:`1px solid ${B.creamBorder}` }}>Complete</div>
          {myDone.map(t=><TicketCard key={t.id} t={t} isManager={false} onUpdate={onUpdate} assignees={assignees} areas={[]} />)}
        </>
      )}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ team, setTeam, onSave }) {
  const [newName, setNewName] = useState("");
  const [newPin,  setNewPin]  = useState("");
  const [saved, setSaved]     = useState(false);
  const [showPins, setShowPins] = useState(false);

  const addMember = () => {
    if(!newName.trim()||!newPin.trim()) return;
    if(team.some(m=>m.pin===newPin.trim())){alert("PIN already in use.");return;}
    setTeam([...team,{name:newName.trim(),pin:newPin.trim()}]);
    setNewName(""); setNewPin("");
  };
  const removeMember = name => setTeam(team.filter(m=>m.name!==name));
  const updatePin    = (name,pin) => setTeam(team.map(m=>m.name===name?{...m,pin}:m));
  const handleSave   = async () => { await onSave(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div style={{ maxWidth:600, margin:"0 auto", padding:"0 24px 60px" }}>
      <div style={{ textAlign:"center", padding:"40px 0 28px" }}>
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:10 }}>Manager Portal</div>
        <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Settings</h2>
        <Ornament />
      </div>

      <div style={{ marginBottom:36 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:B.charcoalLight }}>Team & PINs</div>
          <button onClick={()=>setShowPins(v=>!v)} style={{ fontSize:11, color:B.charcoalLight, background:"none", border:`1px solid ${B.creamBorder}`, padding:"5px 12px", cursor:"pointer", fontFamily:fontSans, letterSpacing:"0.06em" }}>{showPins?"Hide PINs":"Show PINs"}</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:16 }}>
          {team.map(m=>(
            <div key={m.name} style={{ display:"flex", alignItems:"center", gap:12, background:B.white, border:`1px solid ${B.creamBorder}`, padding:"12px 16px" }}>
              <div style={{ flex:1, fontFamily:fontSerif, fontSize:16, color:B.charcoal }}>{m.name}</div>
              {showPins
                ? <input value={m.pin} onChange={e=>updatePin(m.name,e.target.value)} maxLength={8} style={{ width:80, padding:"6px 10px", border:`1px solid ${B.creamBorder}`, fontFamily:"monospace", fontSize:14, textAlign:"center", background:B.cream }} />
                : <span style={{ fontFamily:"monospace", fontSize:13, color:B.charcoalLight, letterSpacing:"0.1em" }}>••••</span>
              }
              <span onClick={()=>removeMember(m.name)} style={{ cursor:"pointer", color:B.charcoalLight, fontSize:18, fontWeight:300, lineHeight:1 }}>×</span>
            </div>
          ))}
        </div>

        <div style={{ background:B.creamDark, border:`1px solid ${B.creamBorder}`, padding:16 }}>
          <div style={{ fontFamily:fontSans, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:12 }}>Add Team Member</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Full name" style={{...inputStyle,flex:2,minWidth:100,background:B.white}} />
            <input value={newPin}  onChange={e=>setNewPin(e.target.value)}  placeholder="PIN" maxLength={8} style={{...inputStyle,flex:1,minWidth:80,fontFamily:"monospace",background:B.white}} />
            <PrimaryBtn small onClick={addMember}>Add</PrimaryBtn>
          </div>
        </div>
      </div>

      <Ornament small />
      <div style={{ marginTop:20 }}>
        <PrimaryBtn onClick={handleSave}>{saved?"✓ Saved to All Devices":"Save Changes"}</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Manager Portal ───────────────────────────────────────────────────────────
function ManagerPortal({ tickets, onUpdate, areas, team, setTeam, onSaveSettings }) {
  const assignees = ["Unassigned",...team.map(m=>m.name)];
  const [tab, setTab]               = useState("all");
  const [search, setSearch]         = useState("");
  const [assignFilter, setAssignFilter] = useState("all");
  const [subView, setSubView]       = useState("tickets");
  const [emailAddr, setEmailAddr]   = useState("");
  const [showEmail, setShowEmail]   = useState(false);

  const filtered = tickets.filter(t => {
    const matchTab    = tab==="all"||t.status===tab;
    const matchSearch = !search
      ||t.message.toLowerCase().includes(search.toLowerCase())
      ||(t.area||"").toLowerCase().includes(search.toLowerCase())
      ||(t.submittedBy||"").toLowerCase().includes(search.toLowerCase())
      ||(t.ticketNo||"").toLowerCase().includes(search.toLowerCase());
    const matchAssign = assignFilter==="all"||(t.assignee||"Unassigned")===assignFilter;
    return matchTab&&matchSearch&&matchAssign;
  });

  const counts = { all:tickets.length, todo:tickets.filter(t=>t.status==="todo").length, done:tickets.filter(t=>t.status==="done").length };
  const printLabel = tab==="todo"?"To Do":tab==="done"?"Complete":"All Issues";

  const NavBtn = ({v, label}) => (
    <button onClick={()=>setSubView(v)} style={{
      padding:"8px 16px", border:"none", background:"transparent",
      fontFamily:fontSans, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
      color: subView===v ? B.charcoal : B.charcoalLight,
      borderBottom: subView===v ? `2px solid ${B.charcoal}` : "2px solid transparent",
      cursor:"pointer", fontWeight: subView===v ? 700 : 400, transition:"all 0.15s"
    }}>{label}</button>
  );

  const TabBtn = ({t:tv, label}) => (
    <button onClick={()=>setTab(tv)} style={{
      padding:"7px 14px", border:`1px solid ${tab===tv?B.charcoal:B.creamBorder}`,
      background: tab===tv ? B.charcoal : "transparent",
      color: tab===tv ? B.cream : B.charcoalMid,
      fontFamily:fontSans, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
      fontWeight:600, cursor:"pointer", transition:"all 0.15s"
    }}>{label} <span style={{opacity:0.6}}>({counts[tv]})</span></button>
  );

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px 60px" }}>
      <div style={{ textAlign:"center", padding:"40px 0 24px" }}>
        <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginBottom:10 }}>Estate Maintenance</div>
        <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Manager Portal</h2>
        <Ornament />
      </div>

      {/* Sub-nav */}
      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${B.creamBorder}`, marginBottom:28 }}>
        <NavBtn v="tickets" label="Tickets" />
        <NavBtn v="settings" label="Settings" />
      </div>

      {subView==="settings" ? (
        <SettingsPanel team={team} setTeam={setTeam} onSave={onSaveSettings} />
      ) : (
        <>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:24 }}>
            {[["All",counts.all],["To Do",counts.todo],["Complete",counts.done]].map(([label,count])=>(
              <div key={label} style={{ background:B.white, border:`1px solid ${B.creamBorder}`, padding:"18px 12px", textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:500, color:B.charcoal, fontFamily:fontSerif }}>{count}</div>
                <div style={{ fontSize:10, color:B.charcoalLight, marginTop:4, fontFamily:fontSans, letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs + actions */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
            <TabBtn t="all"  label="All" />
            <TabBtn t="todo" label="To Do" />
            <TabBtn t="done" label="Complete" />
            <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
              <button onClick={()=>setShowEmail(v=>!v)} style={{ padding:"7px 12px", border:`1px solid ${B.creamBorder}`, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>📧</button>
              <button onClick={()=>printList(filtered,printLabel)} style={{ padding:"7px 12px", border:`1px solid ${B.creamBorder}`, background:"transparent", color:B.charcoalMid, fontFamily:fontSans, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>🖨</button>
            </div>
          </div>

          {showEmail && (
            <div style={{ background:B.creamDark, border:`1px solid ${B.creamBorder}`, padding:14, marginBottom:16 }}>
              <label style={labelStyle}>Email current view to</label>
              <div style={{ display:"flex", gap:8 }}>
                <input type="email" value={emailAddr} onChange={e=>setEmailAddr(e.target.value)} placeholder="manager@hamptonmanor.co.uk" style={{...inputStyle,flex:1}} />
                <PrimaryBtn small onClick={()=>{emailList(filtered,printLabel,emailAddr);setShowEmail(false);}}>Send</PrimaryBtn>
              </div>
            </div>
          )}

          {/* Search + filter */}
          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets, locations, staff, reference…" style={{...inputStyle,flex:1,minWidth:160}} />
            <select value={assignFilter} onChange={e=>setAssignFilter(e.target.value)} style={{...inputStyle,width:"auto",minWidth:130,fontFamily:fontSans}}>
              <option value="all">All Assignees</option>
              {assignees.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>

          {filtered.length===0 ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <Ornament />
              <p style={{ fontFamily:fontSerif, fontSize:18, color:B.charcoalLight, fontStyle:"italic" }}>No issues found</p>
            </div>
          ) : (
            filtered.map(t=><TicketCard key={t.id} t={t} isManager={true} onUpdate={onUpdate} assignees={assignees} areas={areas} />)
          )}
        </>
      )}
    </div>
  );
}

// ─── Manager PIN Gate ─────────────────────────────────────────────────────────
function ManagerPinGate({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const check = () => { if(pin===MANAGER_PIN){onSuccess();} else{setErr(true);setPin("");setTimeout(()=>setErr(false),2000);} };
  return (
    <div style={{ maxWidth:380, margin:"0 auto", padding:"60px 24px 40px", textAlign:"center" }}>
      <LogoWordmark stacked navSize={26} />
      <div style={{ fontFamily:fontSerif, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:B.charcoalLight, marginTop:16, marginBottom:4 }}>Restricted Access</div>
      <h2 style={{ fontFamily:fontSerif, fontSize:32, fontWeight:400, color:B.charcoal, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Manager</h2>
      <Ornament />
      <p style={{ fontFamily:fontSans, fontSize:13, color:B.charcoalLight, marginBottom:32, letterSpacing:"0.03em" }}>Enter your PIN to continue</p>
      <input type="password" inputMode="numeric" maxLength={6} value={pin}
        onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()}
        placeholder="· · · ·"
        style={{...inputStyle,textAlign:"center",fontSize:28,letterSpacing:"0.3em",marginBottom:4,borderBottom:`1px solid ${B.charcoal}`}} />
      {err && <div style={{ color:B.errorText, fontSize:12, fontFamily:fontSans, letterSpacing:"0.04em", marginTop:8, marginBottom:12 }}>Incorrect PIN</div>}
      {!err && <div style={{ height:28 }} />}
      <PrimaryBtn onClick={check}>Enter</PrimaryBtn>
    </div>
  );
}

// ─── Nav Header ───────────────────────────────────────────────────────────────
function Header({ view, setView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isManager = view==="manager";
  const isUser    = view==="user";
  const isStaff   = view==="staff";

  return (
    <div style={{ background:B.cream, borderBottom:`1px solid ${B.creamBorder}`, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", height:60 }}>
        {/* Logo */}
        <div style={{ flex:1 }}>
          <LogoWordmark navSize={18} onDark />
        </div>
        {/* Desktop nav */}
        <div style={{ display:"flex", gap:0 }}>
          {[["Report an Issue","staff"],["My Tasks","user"],["Manager",isManager?"manager":"manager-gate"]].map(([label,v])=>(
            <button key={v} onClick={()=>setView(v==="manager-gate"?(isManager?"manager":"manager-gate"):v)} style={{
              background:"transparent", border:"none",
              borderBottom:`2px solid ${(isStaff&&v==="staff")||(isUser&&v==="user")||(isManager&&v==="manager-gate")?B.charcoal:"transparent"}`,
              color: (isStaff&&v==="staff")||(isUser&&v==="user")||(isManager&&v==="manager-gate") ? B.charcoal : B.charcoalLight,
              fontFamily:fontSans, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
              padding:"0 14px", height:60, cursor:"pointer", fontWeight:600, transition:"all 0.15s"
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]       = useState("staff");
  const [tickets, setTickets] = useState([]);
  const [areas, setAreas]     = useState(DEFAULT_AREAS);
  const [team, setTeam]       = useState(DEFAULT_TEAM);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([loadData("hm-tickets"),loadData("hm-areas"),loadData("hm-team")])
      .then(([t,a,tm])=>{ if(t)setTickets(t); if(a)setAreas(a); if(tm)setTeam(tm); setLoading(false); });
  },[]);

  useEffect(()=>{
    const id=setInterval(()=>loadData("hm-tickets").then(t=>{if(t)setTickets(t);}),15000);
    return ()=>clearInterval(id);
  },[]);

  const addTicket = async data => {
    const t={id:Date.now().toString(),createdAt:new Date().toISOString(),status:"todo",assignee:"Unassigned",...data};
    const updated=[t,...tickets]; setTickets(updated); await saveData("hm-tickets",updated);
  };

  const updateTicket = async (id,changes) => {
    const updated=tickets.map(t=>t.id===id?{...t,...changes}:t);
    setTickets(updated); await saveData("hm-tickets",updated);
  };

  const saveSettings = async () => {
    await saveData("hm-areas",areas);
    await saveData("hm-team",team);
  };

  if (loading) return (
    <div style={{ background:B.cream, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <LogoWordmark stacked navSize={26} />
      <Ornament small />
      <div style={{ fontFamily:fontSans, fontSize:11, color:B.charcoalLight, letterSpacing:"0.12em", textTransform:"uppercase" }}>Loading…</div>
    </div>
  );

  const assignees = ["Unassigned",...team.map(m=>m.name)];

  return (
    <div style={{ fontFamily:fontSerif, background:B.cream, minHeight:"100vh" }}>
      <Header view={view} setView={setView} />
      <div>
        {view==="staff"        && <StaffForm onSubmit={addTicket} />}
        {view==="user"         && <UserPortal team={team} tickets={tickets} onUpdate={updateTicket} assignees={assignees} />}
        {view==="manager-gate" && <ManagerPinGate onSuccess={()=>setView("manager")} />}
        {view==="manager"      && <ManagerPortal tickets={tickets} onUpdate={updateTicket} areas={areas} team={team} setTeam={setTeam} onSaveSettings={saveSettings} />}
      </div>
      {/* Footer */}
      <div style={{ borderTop:`1px solid ${B.creamBorder}`, padding:"24px", textAlign:"center", marginTop:40 }}>
        <LogoWordmark navSize={16} />
        <div style={{ fontFamily:fontSans, fontSize:10, color:B.charcoalLight, marginTop:8, letterSpacing:"0.08em" }}>Estate Maintenance System</div>
      </div>
    </div>
  );
}
