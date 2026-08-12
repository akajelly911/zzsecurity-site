const { useState, useEffect, useRef, useCallback } = React;

/* ═══════════════════════════════════════════════════════════════════
   ZZ SECURITY  ·  ULTRA EDITION
   Theme: Deep black + electric violet/purple + hot magenta accents
   Signature: Morphing hero with 3D perspective tilt card grid,
              animated circuit-board SVG bg, glitch text reveal,
              magnetic buttons, cursor glow
═══════════════════════════════════════════════════════════════════ */

// ─── PALETTE ───────────────────────────────────────────────────
const C = {
  bg:       "#050508",
  bg2:      "#08080f",
  bg3:      "#0c0c18",
  panel:    "rgba(14,10,30,0.85)",
  border:   "rgba(139,92,246,0.2)",
  borderHi: "rgba(139,92,246,0.6)",
  violet:   "#8b5cf6",
  violetLt: "#a78bfa",
  magenta:  "#e879f9",
  cyan:     "#22d3ee",
  white:    "#f5f0ff",
  muted:    "rgba(245,240,255,0.4)",
  dimmed:   "rgba(245,240,255,0.15)",
};

// ─── DATA ─────────────────────────────────────────────────────
const COURSES = [
  { id:"c1", icon:"🔰", title:"Ethical Hacking Fundamentals",
    level:"Beginner", duration:"1 Month", color:C.cyan,
    desc:"Hands-on fundamentals: Kali Linux, Nmap, basic exploitation and lab practice.",
    topics:["Kali Linux","Nmap","Basic Exploitation","Linux Fundamentals","Lab Setup"] },
  { id:"c2", icon:"🌐", title:"Web Application Hacking",
    level:"Intermediate", duration:"1 Month", color:C.violet,
    desc:"Web security with Burp Suite, OWASP Top 10, SQLi, XSS, CSRF and API testing.",
    topics:["Burp Suite","OWASP Top10","SQL Injection","XSS","API Security"] },
  { id:"c3", icon:"📱", title:"Android App Hacking",
    level:"Intermediate", duration:"1 Month", color:C.magenta,
    desc:"Mobile app security: reverse engineering, dynamic analysis and common Android attack vectors.",
    topics:["APK Analysis","Frida","APKTool","Dynamic Analysis","Insecure Storage"] },
  { id:"c4", icon:"🔒", title:"Windows & PC Hacking",
    level:"Intermediate", duration:"1 Month", color:C.violetLt,
    desc:"Windows exploitation, privilege escalation, local recon and post-exploitation techniques.",
    topics:["Windows Exploitation","Privilege Escalation","Sysinternals","Credential Harvesting"] },
  { id:"c5", icon:"📢", title:"Social Media Account Hacking",
    level:"Beginner", duration:"1 Month", color:C.cyan,
    desc:"Account security assessment, OSINT, phishing simulations and account hardening practices.",
    topics:["OSINT","Phishing Simulations","Account Recovery","Security Hardening"] },
  { id:"c6", icon:"💻", title:"Network & Infrastructure Hacking",
    level:"Intermediate", duration:"1 Month", color:C.magenta,
    desc:"Network scanning, routing attacks, wireless security and common network misconfigurations.",
    topics:["Nmap","Wireshark","Routing Attacks","Wireless Security"] },
  { id:"c7", icon:"🎯", title:"Bug Bounty Starter",
    level:"Beginner", duration:"1 Month", color:C.violet,
    desc:"Introduction to bug bounty programs, reporting and working with disclosure timelines.",
    topics:["Recon Techniques","Report Writing","Responsible Disclosure","Low-hanging Bugs"] },
  { id:"c8", icon:"🛡️", title:"Blue Team Essentials",
    level:"Beginner", duration:"1 Month", color:C.cyan,
    desc:"Defensive skills: logging, incident response basics and hardening systems.",
    topics:["Logging","SIEM Basics","Response Playbooks","System Hardening"] },
  { id:"c9", icon:"🧪", title:"Malware Analysis Basics",
    level:"Intermediate", duration:"1 Month", color:C.magenta,
    desc:"Static and dynamic malware analysis fundamentals, sandboxing and safe handling.",
    topics:["Static Analysis","Dynamic Analysis","Sandboxing","Indicators of Compromise"] },
  { id:"c10", icon:"🚀", title:"Red Team Foundations",
    level:"Advanced", duration:"2 Months", color:C.violet,
    desc:"Offensive operations, C2 basics, AD attack paths and coordinated exercises.",
    topics:["Red Team Ops","C2 Frameworks","AD Attack Paths","Operational Tradecraft"] },
  { id:"c11", icon:"📜", title:"Cyber Career & Portfolio",
    level:"Beginner", duration:"1 Month", color:C.cyan,
    desc:"Build a portfolio, prepare for interviews, and present your projects professionally.",
    topics:["Portfolio Building","Interview Prep","Report Samples","Career Guidance"] },
  { id:"c12", icon:"🔧", title:"Tools & Automation for Security",
    level:"Intermediate", duration:"1 Month", color:C.magenta,
    desc:"Automation with scripts, toolchains and practical workflows to speed up assessments.",
    topics:["Python Scripting","Automation","Tool Integration","Workflows"] },
];
const SECTIONS = [
  { id:"s1", label:"Morning Batch",   time:"9:00 AM – 12:00 PM", icon:"🌅" },
  { id:"s2", label:"Afternoon Batch", time:"2:00 PM – 5:00 PM",  icon:"☀️" },
  { id:"s3", label:"Evening Batch",   time:"6:00 PM – 9:00 PM",  icon:"🌙" },
];

const supabaseConfig = window.__SUPABASE_CONFIG__ || {};
const supabaseStorageBucket = supabaseConfig.storageBucket || "student-photos";
let supabaseReadyPromise = null;
let supabaseStudentPhotoColumn = null;
const supabaseStudentColumnCache = {};

function initializeSupabase() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return Promise.resolve(null);
  if (!window.supabase || !window.supabase.createClient) return Promise.resolve(null);
  if (!supabaseReadyPromise) {
    supabaseReadyPromise = Promise.resolve({
      client: window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    });
  }
  return supabaseReadyPromise;
}

async function detectStudentPhotoColumn() {
  if (supabaseStudentPhotoColumn !== null) return supabaseStudentPhotoColumn;
  const sb = await initializeSupabase();
  if (!sb || !sb.client) return "photo";
  for (const candidate of ["photo", "photos"]) {
    const { error } = await sb.client.from("students").select(candidate).limit(1);
    if (!error) {
      supabaseStudentPhotoColumn = candidate;
      return candidate;
    }
  }
  supabaseStudentPhotoColumn = "photo";
  return "photo";
}

async function detectStudentCourseColumn() {
  if (supabaseStudentColumnCache.courseColumn !== undefined) return supabaseStudentColumnCache.courseColumn;
  const sb = await initializeSupabase();
  if (!sb || !sb.client) {
    supabaseStudentColumnCache.courseColumn = null;
    return null;
  }
  for (const candidate of ["courseId", "courseName", "course"]) {
    const { error } = await sb.client.from("students").select(candidate).limit(1);
    if (!error) {
      supabaseStudentColumnCache.courseColumn = candidate;
      return candidate;
    }
  }
  supabaseStudentColumnCache.courseColumn = null;
  return null;
}

function buildStudentRow(item) {
  return {
    id: item.id,
    name: item.name || "",
    email: item.email || "",
    phone: item.phone || "",
    password: item.password || item.phone || "",
    section: item.section || "",
    status: item.status || "pending",
    appliedAt: item.appliedAt || new Date().toISOString(),
    photo: item.photo || item.photos || null,
    photos: item.photos || item.photo || null,
    photoName: item.photoName || "",
    cnic: item.cnic || "",
    dob: item.dob || "",
    gender: item.gender || "",
    city: item.city || "",
    fatherName: item.fatherName || "",
    address: item.address || "",
    education: item.education || "",
    institution: item.institution || "",
    passingYear: item.passingYear || "",
    experience: item.experience || "",
    hasLaptop: item.hasLaptop || "",
    hasInternet: item.hasInternet || "",
    currentJob: item.currentJob || "",
    howHeard: item.howHeard || "",
    comments: item.comments || "",
    courseName: item.courseName || item.course || "",
    courseId: item.courseId || "",
  };
}

function buildStudentRowForSupabase(item) {
  const row = buildStudentRow(item);
  return row;
}

async function buildStudentRowForSupabaseAsync(item) {
  const row = buildStudentRow(item);
  if (isDataUrl(row.photo)) {
    row.photo = null;
  }
  if (isDataUrl(row.photos)) {
    row.photos = null;
  }
  const photoColumn = await detectStudentPhotoColumn();
  if (photoColumn === "photos") {
    row.photos = row.photo;
    delete row.photo;
  }
  const courseColumn = await detectStudentCourseColumn();
  if (courseColumn === "courseId") {
    row.courseId = row.courseId || row.courseName || row.course || "";
    delete row.courseName;
    delete row.course;
  } else if (courseColumn === "course") {
    row.course = row.courseName || row.course || "";
    delete row.courseName;
  } else if (courseColumn === "courseName") {
    // preserve courseName for the table column
  } else {
    delete row.courseName;
    delete row.course;
  }
  return row;
}

function parseSupabaseUnknownColumn(error) {
  if (!error || !error.message) return null;
  const msg = error.message;
  const match = msg.match(/column(?: \"?students\"?\.)?\"?([a-zA-Z0-9_]+)\"? does not exist/i);
  return match ? match[1] : null;
}

function stripColumnFromRows(rows, column) {
  return rows.map(row => {
    if (!row || typeof row !== 'object') return row;
    const next = { ...row };
    delete next[column];
    return next;
  });
}

function normalizeStudentRow(item) {
  const row = buildStudentRow(item || {});
  row.courseName = item?.courseName || item?.course || row.courseName || "";
  row.courseId = item?.courseId || row.courseId || "";
  row.fee = {
    paid: Boolean(item?.fee?.paid),
    challan: item?.fee?.challan || null,
    submitted: Boolean(item?.fee?.submitted),
    transactionId: item?.fee?.transactionId || null,
    amount: item?.fee?.amount || 0,
    original: item?.fee?.original || 0,
    dueDays: item?.fee?.dueDays || 3,
    note: item?.fee?.note || "",
    submittedAt: item?.fee?.submittedAt || null,
  };
  return row;
}

function normalizeQuickMessageRow(item) {
  return buildQuickMessageRow(item || {});
}

function firstWord(value, fallback="") {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;
  return text.split(/\s+/)[0] || fallback;
}

function courseLabel(value, fallback="Course") {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;
  return text.split(/\s+/).slice(0, 2).join(" ") || fallback;
}

function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

function compactStudentForLocalStorage(item) {
  const row = item ? { ...item } : {};
  if (isDataUrl(row.photo) && row.photo.length > 200000) {
    row.photo = null;
  }
  if (row.fee && typeof row.fee === "object") {
    const fee = { ...row.fee };
    if (isDataUrl(fee.challan) && fee.challan.length > 200000) {
      fee.challan = null;
    }
    row.fee = fee;
  }
  return row;
}

function compactStudentsForLocalStorage(rows) {
  return Array.isArray(rows) ? rows.map(compactStudentForLocalStorage) : [];
}

function compactQuickMessageForLocalStorage(item) {
  return item ? { ...item } : {};
}

function compactQuickMessagesForLocalStorage(rows) {
  return Array.isArray(rows) ? rows.map(compactQuickMessageForLocalStorage) : [];
}

async function writeSupabaseValue(key, value) {
  const sb = await initializeSupabase();
  if (!sb || !sb.client) return { ok: false, error: new Error("Supabase is not available") };
  try {
    if (key === "students") {
      let rows = Array.isArray(value) ? await Promise.all(value.map(buildStudentRowForSupabaseAsync)) : [];
      if (rows.length) {
        let response = await sb.client.from("students").upsert(rows, { onConflict: "id" });
        if (response.error) {
          const badColumn = parseSupabaseUnknownColumn(response.error);
          if (badColumn) {
            rows = stripColumnFromRows(rows, badColumn);
            response = await sb.client.from("students").upsert(rows, { onConflict: "id" });
          }
          if (response.error) throw response.error;
        }
      }
      return { ok: true };
    }
    if (key === "quickMessages") {
      const rows = Array.isArray(value) ? value.map(buildQuickMessageRow) : [];
      if (rows.length) {
        const { error } = await sb.client.from("quick_messages").upsert(rows, { onConflict: "id" });
        if (error) throw error;
      }
      return { ok: true };
    }
  } catch (err) {
    console.warn("Supabase write failed:", err);
    return { ok: false, error: err };
  }
  return { ok: false, error: new Error(`Unknown Supabase key: ${key}`) };
}

async function readSupabaseValue(key) {
  const sb = await initializeSupabase();
  if (!sb || !sb.client) return null;
  try {
    if (key === "students") {
      const { data, error } = await sb.client.from("students").select("*");
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    }
    if (key === "quickMessages") {
      const { data, error } = await sb.client.from("quick_messages").select("*");
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    }
    return null;
  } catch (err) {
    console.warn("Supabase read failed:", err);
    return null;
  }
}

async function findStudentByEmailAndPassword(email, password) {
  const sb = await initializeSupabase();
  if (sb && sb.client) {
    try {
      const { data, error } = await sb.client.from("students")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        return data;
      }
      if (error) {
        console.warn("Supabase student lookup failed:", error);
      }
    } catch (err) {
      console.warn("Supabase student lookup error:", err);
    }
  }
  const localMatch = (db.get("students") || []).find(s => s.email === email && s.password === password);
  return localMatch || null;
}

async function getStudentById(id) {
  const sb = await initializeSupabase();
  if (!sb || !sb.client) return null;
  try {
    const { data, error } = await sb.client.from("students").select("*").eq("id", id).limit(1).maybeSingle();
    if (error) {
      console.warn("Supabase student fetch failed:", error);
      return null;
    }
    return data || null;
  } catch (err) {
    console.warn("Supabase student fetch error:", err);
    return null;
  }
}

async function ensureStudentAuth(email, password) {
  const sb = await initializeSupabase();
  if (!sb || !sb.client) return false;
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedPassword = password || "";
  if (!normalizedEmail || !normalizedPassword) return false;

  try {
    const signIn = await sb.client.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });
    if (!signIn.error && signIn.data?.session) return true;

    if (signIn.error && /user not found|invalid login|invalid credentials|invalid password|wrong password/i.test(signIn.error.message || "")) {
      const signUp = await sb.client.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
      });
      if (!signUp.error) return true;
      if (signUp.error && /already registered|already exists|duplicate key/i.test(signUp.error.message || "")) {
        const retry = await sb.client.auth.signInWithPassword({
          email: normalizedEmail,
          password: normalizedPassword,
        });
        return !retry.error && !!retry.data?.session;
      }
    }
  } catch (err) {
    console.warn("Student auth retry failed:", err);
  }

  return false;
}

function mergeRecords(localRows, remoteRows) {
  const merged = new Map();
  [...(Array.isArray(localRows) ? localRows : []), ...(Array.isArray(remoteRows) ? remoteRows : [])].forEach(row => {
    if (!row) return;
    const normalized = row.message !== undefined ? normalizeQuickMessageRow(row) : normalizeStudentRow(row);
    const key = normalized.id ?? `${normalized.name || ""}|${normalized.createdAt || normalized.appliedAt || ""}|${normalized.message || ""}`;
    merged.set(key, normalized);
  });
  return Array.from(merged.values()).sort((a, b) => {
    const aTime = new Date(a.appliedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.appliedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

const db = {
  get:(k)=>{ try{ return JSON.parse(localStorage.getItem(k)||"null"); } catch{ return null; } },
  set:(k,v)=>{
    try {
      const nextValue = k === "students"
        ? compactStudentsForLocalStorage(v)
        : k === "quickMessages"
          ? compactQuickMessagesForLocalStorage(v)
          : v;
      localStorage.setItem(k, JSON.stringify(nextValue));
      return true;
    } catch (err) {
      console.warn("Local storage write failed:", err);
      return false;
    }
  },
  init: async () => {
    const keys = ["students","quickMessages"];
    for (const key of keys) {
      const localValue = db.get(key);
      const remoteValue = await readSupabaseValue(key);
      if (remoteValue !== null && remoteValue !== undefined) {
        try {
          const compactRemoteValue = key === "students"
            ? compactStudentsForLocalStorage(remoteValue)
            : compactQuickMessagesForLocalStorage(remoteValue);
          localStorage.setItem(key, JSON.stringify(compactRemoteValue));
        } catch {}
        if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
          try {
            const mergedValue = mergeRecords(localValue, remoteValue);
            const compactMergedValue = key === "students"
              ? compactStudentsForLocalStorage(mergedValue)
              : compactQuickMessagesForLocalStorage(mergedValue);
            localStorage.setItem(key, JSON.stringify(compactMergedValue));
          } catch {}
        }
      }
    }
  },
};
const uid = () => Date.now() + Math.floor(Math.random() * 1000);

// ─── CURSOR GLOW ──────────────────────────────────────────────
function CursorGlow() {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const move = (e) => {
      el.style.left = e.clientX + "px";
      el.style.top  = e.clientY + "px";
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div ref={ref} style={{
      position:"fixed", pointerEvents:"none", zIndex:9999,
      width:400, height:400, borderRadius:"50%",
      background:"radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)",
      transform:"translate(-50%,-50%)", transition:"left .12s ease, top .12s ease",
    }}/>
  );
}

// ─── CIRCUIT BOARD SVG BG ─────────────────────────────────────
function CircuitBg({ opacity=0.15 }) {
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity}}
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M10 60 H50 M50 60 V20 M50 20 H90 M90 20 V60 M90 60 H110"
            stroke="#8b5cf6" strokeWidth="0.6" fill="none"/>
          <path d="M60 10 V50 M60 50 H100 M100 50 V100 M60 50 H20 M20 50 V90"
            stroke="#e879f9" strokeWidth="0.4" fill="none"/>
          <circle cx="50" cy="60" r="3" fill="none" stroke="#8b5cf6" strokeWidth="0.8"/>
          <circle cx="90" cy="20" r="2" fill="#8b5cf6" opacity="0.5"/>
          <circle cx="60" cy="50" r="3" fill="none" stroke="#e879f9" strokeWidth="0.8"/>
          <rect x="8" y="57" width="6" height="6" fill="none" stroke="#22d3ee" strokeWidth="0.6"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)"/>
    </svg>
  );
}

// ─── ANIMATED PARTICLES ───────────────────────────────────────
function Particles({ count=70, color1="rgba(139,92,246,", color2="rgba(232,121,249," }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, raf;
    const pts = Array.from({length: count}, () => ({
      x: Math.random()*1600, y: Math.random()*900,
      vx: (Math.random()-.5)*.5, vy: (Math.random()-.5)*.5,
      r: Math.random()*2+.5, hue: Math.random() > .5 ? 1 : 2,
    }));
    const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const col = p.hue === 1 ? color1 : color2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = col + "0.5)"; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.strokeStyle = color1 + (0.15*(1-d/130)) + ")";
          ctx.lineWidth = 0.7;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
}

// ─── GLITCH TEXT ──────────────────────────────────────────────
function Glitch({ children, as="span", style={} }) {
  const [g, setG] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setG(true); setTimeout(() => setG(false), 200);
    }, 3000 + Math.random()*2000);
    return () => clearInterval(id);
  }, []);
  const Tag = as;
  return (
    <Tag style={{ position:"relative", display:"inline-block", ...style }}>
      {children}
      {g && <>
        <span aria-hidden style={{position:"absolute",inset:0,color:"#e879f9",
          clipPath:"inset(20% 0 55% 0)",transform:"translateX(-4px)",opacity:.9,pointerEvents:"none"}}>{children}</span>
        <span aria-hidden style={{position:"absolute",inset:0,color:"#22d3ee",
          clipPath:"inset(55% 0 15% 0)",transform:"translateX(4px)",opacity:.9,pointerEvents:"none"}}>{children}</span>
      </>}
    </Tag>
  );
}

// ─── WORD CYCLER ──────────────────────────────────────────────
function WordCycle({ words }) {
  const [i, setI] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => { setI(x => (x+1)%words.length); setVis(true); }, 400);
    }, 2600);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span style={{
      background: "linear-gradient(90deg, #8b5cf6, #e879f9)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
      display:"inline-block",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0) scale(1)" : "translateY(-16px) scale(0.96)",
      transition: "opacity .4s cubic-bezier(.4,0,.2,1), transform .4s cubic-bezier(.4,0,.2,1)",
    }}>{words[i]}</span>
  );
}

// ─── COUNT UP ─────────────────────────────────────────────────
function CountUp({ to, suffix="" }) {
  const [n, setN] = useState(0); const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let s = 0;
      const step = () => { s = Math.min(s + Math.ceil(to/60), to); setN(s); if (s < to) requestAnimationFrame(step); };
      requestAnimationFrame(step); obs.disconnect();
    }, {threshold:.3});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// ─── SCROLL REVEAL ────────────────────────────────────────────
function Reveal({ children, delay=0, from="bottom" }) {
  const ref = useRef(); const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setVis(true);obs.disconnect();} }, {threshold:.1});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const hidden = from==="bottom" ? "translateY(36px)" : from==="left" ? "translateX(-36px)" : "translateX(36px)";
  return (
    <div ref={ref} style={{
      opacity: vis?1:0, transform: vis?"none":hidden,
      transition: `opacity .7s ${delay}ms cubic-bezier(.4,0,.2,1), transform .7s ${delay}ms cubic-bezier(.4,0,.2,1)`,
    }}>{children}</div>
  );
}

// ─── MAGNETIC BUTTON ──────────────────────────────────────────
function MagBtn({ children, onClick, style={}, outline=false }) {
  const ref = useRef();
  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 14;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick(e);
  };
  return (
    <button ref={ref} type="button" onClick={handleClick} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{
        transition:"transform .2s ease, box-shadow .2s ease",
        background: outline ? "transparent" : "linear-gradient(135deg,#7c3aed,#a855f7,#e879f9)",
        border: outline ? "1px solid rgba(139,92,246,.5)" : "none",
        color: outline ? C.violetLt : "#fff",
        borderRadius: 14, cursor:"pointer", fontSize:15, fontWeight:700,
        padding:"13px 30px", letterSpacing:.5,
        boxShadow: outline ? "none" : "0 0 30px rgba(139,92,246,.4), 0 4px 20px rgba(0,0,0,.4)",
        ...style,
      }}>
      {children}
    </button>
  );
}

// ─── 3D TILT CARD ─────────────────────────────────────────────
function TiltCard({ children, style={}, glowColor=C.violet }) {
  const ref = useRef();
  const [rx, setRx] = useState(0); const [ry, setRy] = useState(0); const [hov, setHov] = useState(false);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    setRx(-((e.clientY - r.top)  / r.height - .5) * 18);
    setRy( ((e.clientX - r.left) / r.width  - .5) * 18);
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>{setHov(false);setRx(0);setRy(0);}}
      style={{
        perspective: 900,
        transition: hov ? "none" : "transform .5s ease",
      }}>
      <div style={{
        transform: `rotateX(${rx}deg) rotateY(${ry}deg) ${hov?"translateZ(10px)":""}`,
        transition: hov ? "transform .08s linear" : "transform .5s ease",
        transformStyle:"preserve-3d",
        background: C.panel,
        border: `1px solid ${hov ? glowColor+"99" : C.border}`,
        borderRadius: 20, backdropFilter:"blur(16px)",
        boxShadow: hov ? `0 24px 60px rgba(0,0,0,.6), 0 0 40px ${glowColor}22, inset 0 1px 0 rgba(255,255,255,.05)` : "0 8px 32px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.03)",
        position:"relative", overflow:"hidden",
        ...style,
      }}>
        {hov && <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 0%, ${glowColor}12 0%, transparent 60%)`,pointerEvents:"none"}}/>}
        <div style={{position:"relative",zIndex:1}}>{children}</div>
      </div>
    </div>
  );
}

// ─── NEON BADGE ───────────────────────────────────────────────
function NeonBadge({ children, color=C.violet }) {
  return (
    <span style={{
      background: color + "15", border: `1px solid ${color}55`,
      color, borderRadius:30, padding:"4px 14px", fontSize:11, fontWeight:700, letterSpacing:1.5,
      textTransform:"uppercase", display:"inline-block",
      boxShadow: `0 0 12px ${color}33`,
    }}>{children}</span>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────
function SLabel({ children }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <div style={{width:32,height:2,background:`linear-gradient(90deg,${C.violet},${C.magenta})`}}/>
      <span style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",
        background:`linear-gradient(90deg,${C.violet},${C.magenta})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontWeight:700}}>
        {children}
      </span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,rgba(139,92,246,.3),transparent)`}}/>
    </div>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────
function Div() {
  return <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.violet}44,${C.magenta}44,transparent)`,margin:"0 auto",maxWidth:800}}/>;
}

// ─── TOAST ────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <div style={{position:"fixed",bottom:28,right:28,zIndex:99999,
      background: type==="ok" ? "rgba(10,20,10,.97)" : "rgba(20,5,5,.97)",
      border:`1px solid ${type==="ok"?"rgba(139,92,246,.6)":"rgba(239,68,68,.5)"}`,
      borderRadius:14,padding:"14px 22px",color:"#fff",fontSize:14,fontWeight:600,
      backdropFilter:"blur(20px)",boxShadow:"0 8px 40px rgba(0,0,0,.5)",
      animation:"slideUp .3s cubic-bezier(.4,0,.2,1) both",maxWidth:320}}>
      {type==="ok" ? "✅" : "❌"} {msg}
    </div>
  );
}

function AdModal({ onClose }){
  return (
    <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)"}}/>
      <div style={{position:"relative",width:"min(760px,90%)",maxWidth:760,background:C.panel,padding:12,borderRadius:12,boxShadow:"0 30px 80px rgba(0,0,0,.6)"}}>
        <button onClick={onClose} style={{position:"absolute",top:8,right:8,background:"transparent",border:"none",color:C.white,fontSize:26,cursor:"pointer"}}>×</button>
        <div style={{maxHeight:"72vh",overflow:"auto",paddingTop:6}}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 360'%3E%3Crect width='600' height='360' fill='%23131521'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238b5cf6' font-family='Arial' font-size='28'%3EAd Placeholder%3C/text%3E%3C/svg%3E" alt="promo" style={{width:"100%",borderRadius:10,display:"block"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── FORM ATOMS ───────────────────────────────────────────────
const inputSt = {width:"100%",background:"rgba(139,92,246,.06)",border:"1px solid rgba(139,92,246,.2)",borderRadius:12,color:C.white,fontFamily:"inherit",fontSize:14,padding:"12px 16px",transition:"border-color .2s",resize:"none"};
function FI({l,v,s,ph,type="text",wide,ta}) {
  return (
    <div style={{gridColumn:wide?"1/-1":"auto",marginBottom:16}}>
      <label style={{display:"block",color:C.muted,fontSize:12,marginBottom:6,fontWeight:600,letterSpacing:.5}}>{l}</label>
      {ta
        ?<textarea rows={3} value={v} onChange={e=>s(e.target.value)} placeholder={ph} style={inputSt}/>
        :<input type={type} value={v} onChange={e=>s(e.target.value)} placeholder={ph} style={inputSt}/>}
    </div>
  );
}
function FSel({l,v,s,opts}) {
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",color:C.muted,fontSize:12,marginBottom:6,fontWeight:600,letterSpacing:.5}}>{l}</label>
      <select value={v} onChange={e=>s(e.target.value)}
        style={{...inputSt,appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238b5cf6' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}>
        <option value="">— Select —</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function FSec({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"24px 0 18px",
      color:C.violetLt,fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>
      {label}
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,rgba(139,92,246,.3),transparent)`}}/>
    </div>
  );
}
function StepBar({ step }) {
  const labels = ["Personal","Batch","Done"];
  return (
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:0,marginTop:24}}>
      {[1,2,3].map((n,i) => (
        <div key={n} style={{display:"flex",alignItems:"flex-start"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,
              background:n<step?"linear-gradient(135deg,#7c3aed,#e879f9)":n===step?"rgba(139,92,246,.15)":"rgba(20,10,40,.8)",
              border:`2px solid ${n<=step?C.violet:C.border}`,
              color:n<step?"#fff":n===step?C.violet:C.dimmed,
              boxShadow:n===step?`0 0 16px ${C.violet}44`:"none"}}>
              {n<step?"✓":n}
            </div>
            <span style={{fontSize:10,letterSpacing:1,color:n===step?C.muted:C.dimmed,whiteSpace:"nowrap"}}>{labels[n-1]}</span>
          </div>
          {i<2&&<div style={{width:56,height:2,marginTop:15,background:n<step?`linear-gradient(90deg,${C.violet},${C.magenta})`:"rgba(139,92,246,.15)"}}/>}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════ APP ═══════════════════ */
function App() {
  const [page, setPage]   = useState("home");
  const [user, setUser]   = useState(null);
  const [admin, setAdmin] = useState(false);
  const [applyTo, setApplyTo] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAd, setShowAd] = useState(!localStorage.getItem("zz_ad_closed"));

  useEffect(() => {
    if (!db.get("students")) db.set("students",[]);
    db.init().catch(()=>{});
    initializeSupabase().then(async sb => {
      const session = sb?.client ? (await sb.client.auth.getSession()).data.session : null;
      if (session) setAdmin(true);
    }).catch(()=>{});
  }, []);

  const closeAd = () => { localStorage.setItem("zz_ad_closed","1"); setShowAd(false); };

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };
  const nav = (p) => { setPage(p); window.scrollTo(0,0); };

  let View;
  if      (page==="home")               View = <Home nav={nav} setApplyTo={setApplyTo}/>;
  else if (page==="courses")            View = <CoursesPage nav={nav} setApplyTo={setApplyTo}/>;
  else if (page==="apply" && applyTo)   View = <ApplyForm course={applyTo} nav={nav} showToast={showToast}/>;
  else if (page==="login")              View = <StudentLogin nav={nav} setUser={setUser} showToast={showToast}/>;
  else if (page==="portal" && user)     View = <StudentPortal user={user} nav={nav} setUser={setUser}/>;
  else if (page==="admin-login")        View = <AdminLogin nav={nav} setAdmin={setAdmin} showToast={showToast}/>;
  else if (page==="admin" && admin)     View = <AdminPanel nav={nav} setAdmin={setAdmin} showToast={showToast}/>;
  else if (page==="admin")              View = <AdminLogin nav={nav} setAdmin={setAdmin} showToast={showToast}/>;
  else if (page==="contact")            View = <ContactPage showToast={showToast}/>;
  else                                    View = <Home nav={nav} setApplyTo={setApplyTo}/>;

  return (
    <div className="app-shell" style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.bg,color:C.white,minHeight:"100vh",display:"flex",flexDirection:"column",overflowX:"hidden"}}>
      <style>{GLOBAL_CSS}</style>
      <CursorGlow/>
      <Navbar nav={nav} page={page} user={user} admin={admin} setUser={setUser} setAdmin={setAdmin}/>
      {showAd && <AdModal onClose={closeAd}/>} 
      <main style={{flex:1}}>{View}</main>
      <SiteFooter nav={nav}/>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
}
window.App = App;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#050508} ::-webkit-scrollbar-thumb{background:linear-gradient(#7c3aed,#e879f9);border-radius:4px}
  input,select,textarea{outline:none;font-family:inherit;}
  .app-shell{overflow-x:hidden;}
  .nav-shell{padding:0 32px;}
  .nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:72;}
  .nav-actions{display:flex;align-items:center;gap:6px;}
  .hero-grid{max-width:1200px;margin:0 auto;padding:130px 32px 80px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;width:100%;position:relative;z-index:2;}
  .hero-buttons{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:52px;}
  .hero-stats{display:flex;gap:36px;flex-wrap:wrap;}
  .courses-section,.why-section,.stats-section,.testimonial-section,.cta-section{padding:100px 32px;}
  .courses-grid,.why-grid,.stats-grid,.testimonial-grid{max-width:1200px;margin:0 auto;position:relative;z-index:2;}
  .why-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;}
  .stats-grid{max-width:1000px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24;text-align:center;}
  .testimonial-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:24;}
  .form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0 16px;}
  .form-actions{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:28px;}
  .photo-row{display:flex;gap:24px;align-items:center;margin-bottom:8px;flex-wrap:wrap;}
  .batch-card{display:flex;align-items:center;gap:18px;padding:22px;border-radius:16;margin-bottom:14;cursor:pointer;transition:all .2s;}
  @media (max-width:980px){
    .nav-shell{padding:0 20px;}
    .hero-grid,.why-grid{grid-template-columns:1fr !important;gap:36px !important;}
    .hero-section{padding-top:24px;}
    .courses-section,.why-section,.stats-section,.testimonial-section,.cta-section{padding:80px 20px !important;}
    .photo-row{flex-direction:column;align-items:flex-start !important;}
    .form-actions{flex-direction:column-reverse !important;}
    .form-actions > button{width:100% !important;}
  }
  @media (max-width:700px){
    .nav-shell{padding:0 14px;}
    .nav-inner{height:64px;}
    .nav-brand > div:last-child{display:none !important;}
    .hero-grid{padding:110px 16px 60px !important;gap:24px !important;}
    .hero-buttons{flex-direction:column !important;align-items:stretch !important;}
    .hero-buttons button{width:100% !important;}
    .hero-stats{gap:20px !important;}
    .courses-section,.why-section,.stats-section,.testimonial-section,.cta-section{padding:70px 16px !important;}
    .form-grid{grid-template-columns:1fr !important;}
    .batch-card{padding:18px !important;gap:12px !important;}
    .batch-card > div:last-child{font-size:14px !important;}
  }
  /* keep file inputs visually hidden but accessible/clickable via label */
  input[type=file]{position:relative;opacity:0;width:1px;height:1px;overflow:hidden;border:0;margin:0;padding:0}
  input:focus,select:focus,textarea:focus{border-color:rgba(139,92,246,.7)!important;box-shadow:0 0 0 3px rgba(139,92,246,.12);}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spinSlow{to{transform:rotate(360deg)}}
  @keyframes spinSlowR{to{transform:rotate(-360deg)}}
  @keyframes pulseRing{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes scanline{0%{top:-4px}100%{top:100%}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes neonPulse{0%,100%{box-shadow:0 0 20px rgba(139,92,246,.3)}50%{box-shadow:0 0 50px rgba(139,92,246,.7),0 0 80px rgba(232,121,249,.2)}}
  input[type="checkbox"]{appearance:none;-webkit-appearance:none;width:18px;height:18px;min-width:18px;min-height:18px;accent-color:#8b5cf6;border-radius:6px;border:1px solid rgba(139,92,246,.4);background:#000;cursor:pointer;position:relative;display:inline-block;vertical-align:middle;transition:all .2s ease}
  input[type="checkbox"]:checked{background:#000;border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.16)}
  input[type="checkbox"]:checked::after{content:"✓";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:12px;font-weight:900;color:#e879f9;line-height:1}
  input[type="checkbox"]:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(139,92,246,.22)}
  input[type="radio"]{appearance:none;-webkit-appearance:none;width:18px;height:18px;min-width:18px;min-height:18px;border-radius:50%;border:2px solid #8b5cf6;background:#000;cursor:pointer;display:inline-block;position:relative;box-shadow:inset 0 0 0 2px #000}
  input[type="radio"]:checked{background:linear-gradient(135deg,#7c3aed,#e879f9);border-color:#fff;box-shadow:0 0 0 3px rgba(139,92,246,.2)}
`;

/* ═══════════════════════════════════ NAVBAR ════════════════ */
function Navbar({ nav, page, user, admin, setUser, setAdmin }) {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const fn = () => setSc(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleAdminExit = () => {
    initializeSupabase().then(sb => sb?.client?.auth.signOut?.()).catch(()=>{});
    setAdmin(false);
    nav("home");
  };

  return (
    <nav className="nav-shell" style={{
      position:"fixed", top:0, left:0, right:0, zIndex:500,
      background: sc ? "rgba(5,5,8,.97)" : "transparent",
      borderBottom: sc ? "1px solid rgba(139,92,246,.15)" : "1px solid transparent",
      backdropFilter: sc ? "blur(20px)" : "none",
      transition:"all .4s ease", padding:"0 32px",
    }}>
      <div className="nav-inner">
        <button className="nav-brand" onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <div style={{position:"relative",width:40,height:40}}>
            <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
              <rect width="80" height="80" rx="16" fill="url(#lg1)"/>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="80" y2="80">
                  <stop offset="0%" stopColor="#1a0a30"/>
                  <stop offset="100%" stopColor="#2d0a50"/>
                </linearGradient>
              </defs>
              <rect width="80" height="80" rx="16" stroke="url(#lg2)" strokeWidth="1.5" fill="none"/>
              <defs>
                <linearGradient id="lg2" x1="0" y1="0" x2="80" y2="80">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#e879f9"/>
                </linearGradient>
              </defs>
              <path d="M40 11L67 24V44C67 60 40 71 40 71C40 71 13 60 13 44V24Z"
                fill="none" stroke="url(#lg3)" strokeWidth="2.2" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="lg3" x1="13" y1="11" x2="67" y2="71">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#e879f9"/>
                </linearGradient>
              </defs>
              <text x="40" y="51" textAnchor="middle" fill="url(#lg3)"
                style={{fontFamily:"Arial Black,sans-serif",fontWeight:900,fontSize:20,letterSpacing:1}}>ZZ</text>
            </svg>
          </div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,letterSpacing:2,
              background:"linear-gradient(90deg,#fff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1.1}}>
              ZZ SECURITY
            </div>
            <div style={{fontSize:9,letterSpacing:4,color:"rgba(167,139,250,.5)",fontWeight:600}}>INSTITUTE</div>
          </div>
        </button>

        <div className="nav-actions">
          {[["Home","home"],["Courses","courses"],["Contact","contact"]].map(([l,p])=>(
            <button key={p} onClick={()=>nav(p)} style={{background:"none",border:"none",color:"rgba(245,240,255,.5)",cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 16px",borderRadius:10,letterSpacing:.3,transition:"color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(245,240,255,.5)"}>{l}</button>
          ))}
          {user
            ? <button onClick={()=>nav("portal")} style={{background:"linear-gradient(135deg,rgba(124,58,237,.3),rgba(232,121,249,.2))",border:"1px solid rgba(139,92,246,.4)",color:C.violetLt,borderRadius:12,padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:700}}>My Portal</button>
            : <button onClick={()=>nav("login")} style={{background:"linear-gradient(135deg,rgba(124,58,237,.3),rgba(232,121,249,.2))",border:"1px solid rgba(139,92,246,.4)",color:C.violetLt,borderRadius:12,padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:700}}>Student Login</button>
          }
          {admin
            ? page==="admin"
              ? <button onClick={handleAdminExit} style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",color:"#f87171",borderRadius:12,padding:"9px 16px",cursor:"pointer",fontSize:13}}>Exit Admin</button>
              : <button onClick={()=>nav("admin")} style={{background:"linear-gradient(135deg,rgba(124,58,237,.18),rgba(232,121,249,.14))",border:"1px solid rgba(139,92,246,.3)",color:C.violetLt,borderRadius:12,padding:"9px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>Admin Panel</button>
            : <button onClick={()=>nav("admin-login")} style={{background:"linear-gradient(135deg,rgba(124,58,237,.18),rgba(232,121,249,.14))",border:"1px solid rgba(139,92,246,.3)",color:C.violetLt,borderRadius:12,padding:"9px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>Admin</button>
          }
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════ HOME ══════════════════ */
function Home({ nav, setApplyTo }) {
  return (
    <div>
      <HeroSection nav={nav}/>
      <TrustBar/>
      <CoursesSection nav={nav} setApplyTo={setApplyTo}/>
      <WhySection/>
      <StatsSection/>
      <TestimonialsSection/>
      <CtaSection nav={nav}/>
    </div>
  );
}

// ── HERO ──────────────────────────────────────────────────────
function HeroSection({ nav }) {
  return (
    <section className="hero-section" style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",overflow:"hidden",background:`radial-gradient(ellipse 120% 80% at 50% -20%, rgba(124,58,237,.15) 0%, ${C.bg} 60%)`}}>
      <div style={{position:"absolute",top:80,left:0,right:0,display:"flex",justifyContent:"center",zIndex:3}}>
        <div style={{background:"linear-gradient(90deg,#fde68a,#fecaca)",color:"#111",padding:"8px 14px",borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,.4)",display:"flex",gap:12,alignItems:"center"}}>
          <div style={{fontWeight:800}}>
            Azadi Sale — Pakistan: All courses available. Register for free today!
          </div>
          <MagBtn onClick={()=>nav('courses')} style={{padding:"8px 14px",fontSize:13}}>Register</MagBtn>
        </div>
      </div>
      <CircuitBg opacity={0.12}/>
      <Particles count={60}/>

      {/* big rotating rings */}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}>
        {[560,440,320].map((s,i)=>(
          <div key={s} style={{position:"absolute",width:s,height:s,borderRadius:"50%",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            border:`1px solid rgba(139,92,246,${.06+i*.03})`,
            animation:`${i%2===0?"spinSlow":"spinSlowR"} ${30+i*10}s linear infinite`}}/>
        ))}
        <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          background:"radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)",animation:"pulseRing 4s ease-in-out infinite"}}/>
      </div>

      <div className="hero-grid">
        {/* LEFT */}
        <div className="hero-copy" style={{animation:"fadeUp .8s cubic-bezier(.4,0,.2,1) both"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.25)",borderRadius:30,padding:"6px 18px",marginBottom:28}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.violet,boxShadow:`0 0 8px ${C.violet}`,display:"inline-block",animation:"blink 1.5s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.violetLt}}>PAKISTAN'S #1 CYBER INSTITUTE</span>
          </div>

          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(38px,5.5vw,68px)",fontWeight:800,lineHeight:1.05,color:"#fff",marginBottom:20,letterSpacing:-1}}>
            Master the Art<br/>of{" "}
            <WordCycle words={["Ethical Hacking","Penetration Testing","Red Teaming","Cyber Defense","Bug Bounty"]}/>
          </h1>

          <p style={{color:C.muted,fontSize:17,lineHeight:1.85,marginBottom:40,maxWidth:480}}>
            Real-world skills from industry experts. 3 months to career-ready. Join 500+ graduates securing Pakistan's digital future.
          </p>

          <div className="hero-buttons">
            <MagBtn onClick={()=>nav("courses")} style={{fontSize:16,padding:"15px 36px",animation:"neonPulse 3s infinite"}}>
              Explore Courses →
            </MagBtn>
            <MagBtn onClick={()=>nav("contact")} outline style={{fontSize:16,padding:"15px 32px"}}>
              Talk to Us
            </MagBtn>
          </div>

          <div className="hero-stats">
            {[["500+","Students Trained"],["95%","Job Placement"],["3","Expert Courses"]].map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,
                  background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{n}</div>
                <div style={{color:C.dimmed,fontSize:12,letterSpacing:.5,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — floating terminal + shield */}
        <div className="hero-right" style={{animation:"fadeUp .8s .15s cubic-bezier(.4,0,.2,1) both",position:"relative",display:"flex",justifyContent:"center"}}>
          <HeroRight/>
        </div>
      </div>

      {/* scroll hint */}
      <div style={{position:"absolute",bottom:32,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8,opacity:.4,zIndex:2}}>
        <div style={{width:1,height:40,background:`linear-gradient(${C.violet},transparent)`}}/>
        <span style={{fontSize:10,letterSpacing:3,color:C.violet}}>SCROLL</span>
      </div>
    </section>
  );
}

function HeroRight() {
  const [line, setLine] = useState(0);
  const lines = [
    {c:"#4ade80", t:"[+] Target: 192.168.1.105"},
    {c:"#8b5cf6", t:"[*] Running Nmap stealth scan..."},
    {c:"#e879f9", t:"[!] Open ports: 22, 80, 443, 8080"},
    {c:"#22d3ee", t:"[*] Launching Metasploit exploit..."},
    {c:"#fbbf24", t:"[!] CVE-2024-3182 — Vulnerable!"},
    {c:"#4ade80", t:"[+] Shell obtained — root access!"},
    {c:"#8b5cf6", t:"[*] Extracting /etc/shadow..."},
    {c:"#e879f9", t:"[+] Mission complete. Report saved."},
  ];
  useEffect(() => {
    const t = setInterval(() => setLine(l => (l+1) % (lines.length+1)), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{position:"relative",width:"100%",maxWidth:480}}>
      {/* glow blob behind */}
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(139,92,246,.2) 0%,transparent 70%)",filter:"blur(40px)",pointerEvents:"none"}}/>

      {/* shield floating */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:20,animation:"float 4s ease-in-out infinite"}}>
        <svg width="100" height="115" viewBox="0 0 100 115" fill="none">
          <defs>
            <linearGradient id="sh1" x1="0" y1="0" x2="100" y2="115">
              <stop offset="0%" stopColor="#1a0a30"/><stop offset="100%" stopColor="#2d1060"/>
            </linearGradient>
            <linearGradient id="sh2" x1="0" y1="0" x2="100" y2="115">
              <stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#e879f9"/>
            </linearGradient>
            <filter id="gf"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path d="M50 5L92 20V52C92 78 50 110 50 110C50 110 8 78 8 52V20Z" fill="url(#sh1)" stroke="url(#sh2)" strokeWidth="1.5"/>
          <path d="M50 16L82 28V52C82 72 50 98 50 98C50 98 18 72 18 52V28Z" fill="none" stroke="rgba(139,92,246,.2)" strokeWidth="1"/>
          <text x="50" y="65" textAnchor="middle" fill="url(#sh2)" filter="url(#gf)"
            style={{fontFamily:"Arial Black",fontWeight:900,fontSize:28,letterSpacing:2}}>ZZ</text>
          {/* scan line */}
          <line x1="12" y1="52" x2="88" y2="52" stroke="rgba(139,92,246,.4)" strokeWidth="1.5" style={{filter:"blur(1px)"}}/>
        </svg>
      </div>

      {/* terminal */}
      <TiltCard glowColor={C.violet} style={{overflow:"hidden"}}>
        {/* terminal bar */}
        <div style={{background:"rgba(0,0,0,.4)",padding:"12px 18px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid rgba(139,92,246,.15)"}}>
          {["#ef4444","#fbbf24","#4ade80"].map(c=><div key={c} style={{width:11,height:11,borderRadius:"50%",background:c}}/>)}
          <span style={{color:"rgba(139,92,246,.5)",fontSize:11,fontFamily:"monospace",marginLeft:8,letterSpacing:1}}>zz@kali:~# terminal</span>
        </div>
        {/* scanline effect */}
        <div style={{position:"absolute",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(139,92,246,.3),transparent)",animation:"scanline 3s linear infinite",pointerEvents:"none"}}/>
        <div style={{padding:"18px 20px",fontFamily:"'Courier New',monospace",fontSize:13,lineHeight:2,minHeight:200}}>
          {lines.slice(0,Math.min(line,lines.length)).map((l,i)=>(
            <div key={i} style={{color:l.c,animation:"fadeUp .2s both"}}>{l.t}</div>
          ))}
          <span style={{color:C.violet,animation:"blink 1s infinite"}}>▋</span>
        </div>
      </TiltCard>

      {/* floating badges */}
      <div style={{position:"absolute",top:20,right:-20,background:"linear-gradient(135deg,#1a0a30,#2d0a50)",border:"1px solid rgba(139,92,246,.3)",borderRadius:12,padding:"10px 16px",boxShadow:"0 8px 24px rgba(0,0,0,.5)",animation:"float 5s 1s ease-in-out infinite"}}>
        <div style={{color:C.violetLt,fontSize:10,fontWeight:700,letterSpacing:1}}>LIVE LAB</div>
        <div style={{color:"#4ade80",fontSize:16,fontWeight:700}}>● Active</div>
      </div>
      <div style={{position:"absolute",bottom:20,left:-20,background:"linear-gradient(135deg,#0a1a30,#0a2040)",border:"1px solid rgba(34,211,238,.3)",borderRadius:12,padding:"10px 16px",boxShadow:"0 8px 24px rgba(0,0,0,.5)",animation:"float 6s 2s ease-in-out infinite"}}>
        <div style={{color:"#22d3ee",fontSize:10,fontWeight:700,letterSpacing:1}}>CERTIFIED</div>
        <div style={{color:"#fff",fontSize:13,fontWeight:600}}>CEH Aligned ✓</div>
      </div>
    </div>
  );
}

// ── TRUST BAR ─────────────────────────────────────────────────
function TrustBar() {
  return (
    <div style={{background:`linear-gradient(90deg,rgba(124,58,237,.08),rgba(232,121,249,.08),rgba(124,58,237,.08))`,borderTop:"1px solid rgba(139,92,246,.12)",borderBottom:"1px solid rgba(139,92,246,.12)",padding:"20px 32px"}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"center",alignItems:"center",gap:"clamp(20px,4vw,64px)",flexWrap:"wrap"}}>
        {["CEH Aligned","Hands-On Labs","Expert Trainers","Job Assistance","3 Batch Times","Certificate"].map(t=>(
          <div key={t} style={{display:"flex",alignItems:"center",gap:8,color:C.muted,fontSize:13,fontWeight:500,whiteSpace:"nowrap"}}>
            <span style={{background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontSize:16,fontWeight:700}}>✓</span> {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── COURSES SECTION ───────────────────────────────────────────
function CoursesSection({ nav, setApplyTo }) {
  return (
    <section className="courses-section" style={{padding:"100px 32px",background:C.bg2,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"20%",right:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div className="courses-grid">
        <Reveal>
          <div style={{textAlign:"center",marginBottom:64}}>
            <SLabel>Our Programs</SLabel>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:800,color:"#fff",marginBottom:16}}>
              Choose Your <span style={{background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Battle Path</span>
            </h2>
            <p style={{color:C.muted,fontSize:16,maxWidth:500,margin:"0 auto",lineHeight:1.7}}>Three levels. Real labs. Career outcomes. No prices listed — contact us after applying.</p>
          </div>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:28}}>
          {COURSES.map((c,i) => (
            <Reveal key={c.id} delay={i*120}>
              <HomeCourseCard c={c} onApply={()=>{setApplyTo(c);nav("apply");}}/>
            </Reveal>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:48}}>
          <MagBtn onClick={()=>nav("courses")} outline>View Full Course Details →</MagBtn>
        </div>
      </div>
    </section>
  );
}

function HomeCourseCard({ c, onApply }) {
  const [hov, setHov] = useState(false);
  return (
    <TiltCard glowColor={c.color} style={{padding:32}}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
        {/* top row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div style={{width:52,height:52,borderRadius:14,background:`${c.color}18`,border:`1px solid ${c.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
            {c.icon}
          </div>
          <NeonBadge color={c.color}>{c.level}</NeonBadge>
        </div>
        <h3 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:20,fontWeight:700,marginBottom:12,lineHeight:1.3}}>{c.title}</h3>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.75,marginBottom:20}}>{c.desc}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:24}}>
          {c.topics.map(t=>(
            <span key={t} style={{background:`${c.color}0d`,border:`1px solid ${c.color}33`,color:c.color,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:600}}>{t}</span>
          ))}
        </div>
        {/* bottom */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,borderTop:"1px solid rgba(139,92,246,.12)"}}>
          <div>
            <div style={{color:C.dimmed,fontSize:11,letterSpacing:1}}>DURATION</div>
            <div style={{color:"#fff",fontWeight:700,fontSize:15,marginTop:2}}>{c.duration}</div>
          </div>
          <button onClick={onApply} style={{
            background:`linear-gradient(135deg,${c.color}33,${c.color}18)`,
            border:`1px solid ${c.color}66`,color:c.color,borderRadius:12,padding:"10px 22px",
            cursor:"pointer",fontSize:13,fontWeight:700,transition:"all .2s",
            boxShadow:hov?`0 0 20px ${c.color}44`:"none"}}>
            Apply Now →
          </button>
        </div>
      </div>
    </TiltCard>
  );
}

// ── WHY SECTION ───────────────────────────────────────────────
function WhySection() {
  return (
    <section className="why-section" style={{padding:"100px 32px",background:C.bg3,position:"relative",overflow:"hidden"}}>
      <CircuitBg opacity={0.08}/>
      <div style={{position:"absolute",bottom:"-10%",left:"-5%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,121,249,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div className="why-grid">
        <Reveal from="left">
          <SLabel>Why Choose Us</SLabel>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,3.5vw,44px)",fontWeight:800,color:"#fff",marginBottom:16,lineHeight:1.2}}>
            Training Built for<br/>
            <span style={{background:"linear-gradient(135deg,#e879f9,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Real Outcomes</span>
          </h2>
          <p style={{color:C.muted,fontSize:15,lineHeight:1.8,marginBottom:36}}>
            Every session is a live lab. Real attack tools, real vulnerable systems, real defense strategies. We train security professionals — not exam-takers.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {[
              [C.violet,"🛡️","CEH-Aligned Curriculum","Industry-standard content matching global certification syllabi."],
              [C.cyan,"💻","100% Hands-On Labs","Real tools, real targets. No death-by-PowerPoint."],
              [C.magenta,"🏆","10+ Year Expert Trainers","Practitioners who've worked real security roles — not just teachers."],
              [C.violet,"📜","Completion Certificate","Recognized certificate for your CV, LinkedIn, and portfolio."],
              [C.cyan,"🌐","Job Placement Support","We actively connect graduates with Pakistan's top IT security firms."],
              [C.magenta,"🔄","3 Batch Timings","Morning, afternoon & evening — fits any schedule."],
            ].map(([color,ico,t,d]) => (
              <div key={t} style={{display:"flex",gap:14,padding:"14px 18px",borderRadius:14,
                background:"rgba(139,92,246,.04)",border:"1px solid rgba(139,92,246,.1)",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(139,92,246,.3)";e.currentTarget.style.background="rgba(139,92,246,.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(139,92,246,.1)";e.currentTarget.style.background="rgba(139,92,246,.04)";}}>
                <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{ico}</span>
                <div>
                  <div style={{color:"#fff",fontWeight:600,fontSize:14,marginBottom:3}}>{t}</div>
                  <div style={{color:C.muted,fontSize:13}}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal from="right" delay={100}>
          <WhyVisual/>
        </Reveal>
      </div>
    </section>
  );
}

function WhyVisual() {
  return (
    <div style={{position:"relative"}}>
      <TiltCard glowColor={C.magenta} style={{padding:36,textAlign:"center"}}>
        <div style={{fontSize:60,marginBottom:16,animation:"float 4s ease-in-out infinite"}}>🛡️</div>
        <div style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:22,fontWeight:800,marginBottom:6}}>ZZ Security</div>
        <div style={{color:C.muted,fontSize:13,marginBottom:28}}>Trusted by 500+ Students</div>
        {[["Ethical Hacking",92,C.violet],["Web Pentesting",88,C.cyan],["Red Teaming",80,C.magenta]].map(([label,pct,col])=>(
          <div key={label} style={{marginBottom:16,textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:C.muted,fontSize:12}}>{label}</span>
              <span style={{color:col,fontSize:12,fontWeight:700}}>{pct}%</span>
            </div>
            <div style={{height:6,background:"rgba(139,92,246,.1)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:3,
                boxShadow:`0 0 10px ${col}66`}}/>
            </div>
          </div>
        ))}
      </TiltCard>
      {/* floating cards */}
      {[{ico:"🔓",t:"Pentesting",c:C.violet,pos:{top:-20,right:-20}},
        {ico:"🐞",t:"Bug Bounty",c:C.cyan,pos:{bottom:60,left:-24}},
        {ico:"🔥",t:"Red Team",c:C.magenta,pos:{bottom:-20,right:30}}].map(({ico,t,c,pos})=>(
        <div key={t} style={{position:"absolute",...pos,background:C.panel,border:`1px solid ${c}44`,borderRadius:14,padding:"12px 18px",boxShadow:"0 8px 24px rgba(0,0,0,.5)",backdropFilter:"blur(12px)",textAlign:"center",zIndex:10}}>
          <div style={{fontSize:22}}>{ico}</div>
          <div style={{color:c,fontSize:11,fontWeight:700,letterSpacing:.5,marginTop:3}}>{t}</div>
        </div>
      ))}
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────
function StatsSection() {
  return (
    <section className="stats-section" style={{padding:"80px 32px",background:C.bg2,borderTop:"1px solid rgba(139,92,246,.08)",borderBottom:"1px solid rgba(139,92,246,.08)"}}>
      <div className="stats-grid">
        {[[500,"+","Students Trained"],[3,"","Expert Courses"],[95,"%","Job Placement"],[10,"+","Yrs Experience"]].map(([n,s,l],i)=>(
          <Reveal key={l} delay={i*80}>
            <TiltCard glowColor={C.violet} style={{padding:"32px 20px"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:46,fontWeight:800,lineHeight:1,
                background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                <CountUp to={n} suffix={s}/>
              </div>
              <div style={{color:C.muted,fontSize:12,marginTop:8,letterSpacing:.5}}>{l}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="testimonial-section" style={{padding:"100px 32px",background:C.bg,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-20%",right:"-5%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,121,249,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div className="testimonial-grid" style={{maxWidth:1100,margin:"0 auto",position:"relative",zIndex:2}}>
        <Reveal>
          <div style={{textAlign:"center",marginBottom:64}}>
            <SLabel>Student Voices</SLabel>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,4vw,44px)",fontWeight:800,color:"#fff"}}>
              Results That <span style={{background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Speak</span>
            </h2>
          </div>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:24}}>
          {[
            ["Ali Hassan","Lahore","Ethical Hacking","ZZ Security ne meri zindagi badal di. 2 mahine baad Bug Bounty se earning shuru kar di. Best decision of my life!",C.violet],
            ["Fatima Malik","Karachi","Web Pentesting","Female students ke liye mahaul bohot acha. Instructors detail mein samjhate hain. Pehle din se hi real labs mili.",C.cyan],
            ["Usman Tariq","Islamabad","Red Teaming","6 hafton mein cybersecurity job mil gayi course ke baad. Real skills, real results. Highly recommend!",C.magenta],
          ].map(([name,city,course,review,color],i)=>(
            <Reveal key={name} delay={i*100}>
              <TiltCard glowColor={color} style={{padding:28}}>
                <div style={{color:"#fbbf24",fontSize:16,marginBottom:14,letterSpacing:2}}>★★★★★</div>
                <p style={{color:C.muted,fontSize:14,lineHeight:1.8,marginBottom:22,fontStyle:"italic"}}>"{review}"</p>
                <div style={{display:"flex",gap:14,alignItems:"center",paddingTop:18,borderTop:"1px solid rgba(139,92,246,.1)"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${color}33,${color}11)`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:20,fontFamily:"'Syne',sans-serif"}}>{name[0]}</div>
                  <div>
                    <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{name}</div>
                    <div style={{color:C.dimmed,fontSize:12,marginTop:2}}>{city} · {course}</div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────
function CtaSection({ nav }) {
  return (
    <section className="cta-section" style={{position:"relative",padding:"100px 32px",background:`linear-gradient(135deg,#0a0520 0%,#180840 50%,#0a0520 100%)`,overflow:"hidden",textAlign:"center"}}>
      <CircuitBg opacity={0.1}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 80% at 50% 50%,rgba(139,92,246,.1) 0%,transparent 65%)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,maxWidth:700,margin:"0 auto"}}>
        <Reveal>
          <NeonBadge color={C.magenta}>Limited Seats Available</NeonBadge>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,54px)",color:"#fff",fontWeight:800,margin:"20px 0 16px",lineHeight:1.1}}>
            Ready to Become a<br/>
            <span style={{background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Cybersecurity Expert?</span>
          </h2>
          <p style={{color:C.muted,fontSize:16,lineHeight:1.7,marginBottom:40}}>Apply now — it's free to register. Fee details shared after admin confirmation.</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            <MagBtn onClick={()=>nav("courses")} style={{fontSize:17,padding:"16px 44px",animation:"neonPulse 3s infinite"}}>Apply Now →</MagBtn>
            <MagBtn onClick={()=>nav("contact")} outline style={{fontSize:17,padding:"16px 36px"}}>Talk to Us</MagBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════ COURSES PAGE ══════════ */
function CoursesPage({ nav, setApplyTo }) {
  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <section style={{position:"relative",padding:"140px 32px 70px",overflow:"hidden",background:`radial-gradient(ellipse 100% 60% at 50% 0%,rgba(124,58,237,.12) 0%,${C.bg} 60%)`}}>
        <Particles count={40}/>
        <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:620,margin:"0 auto",animation:"fadeUp .6s both"}}>
          <SLabel>All Programs</SLabel>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(32px,5vw,58px)",color:"#fff",fontWeight:800,margin:"14px 0 16px",lineHeight:1.1}}>
            Our <span style={{background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Courses</span>
          </h1>
          <p style={{color:C.muted,fontSize:16,lineHeight:1.7}}>Three programs — beginner to elite. Fees shared privately after your application.</p>
        </div>
      </section>
      <section style={{padding:"40px 32px 100px",maxWidth:1000,margin:"0 auto"}}>
        {COURSES.map((c,i)=>(
          <Reveal key={c.id} delay={i*100}>
            <CourseDetailCard c={c} onApply={()=>{setApplyTo(c);nav("apply");}}/>
          </Reveal>
        ))}
      </section>
    </div>
  );
}

function CourseDetailCard({ c, onApply }) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",gap:28,flexWrap:"wrap",marginBottom:24,padding:32,borderRadius:22,
        background:hov?`rgba(139,92,246,.06)`:C.panel,
        border:`1px solid ${hov?c.color+"66":C.border}`,
        backdropFilter:"blur(16px)",transition:"all .3s ease",
        boxShadow:hov?`0 16px 50px rgba(0,0,0,.5),0 0 30px ${c.color}14`:"0 6px 28px rgba(0,0,0,.35)"}}>
      <div style={{flex:1,minWidth:220}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
          <div style={{width:56,height:56,borderRadius:16,background:`${c.color}18`,border:`1px solid ${c.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{c.icon}</div>
          <NeonBadge color={c.color}>{c.level}</NeonBadge>
        </div>
        <h3 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:22,fontWeight:700,marginBottom:12}}>{c.title}</h3>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.75,marginBottom:18}}>{c.desc}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {c.topics.map(t=>(
            <span key={t} style={{background:`${c.color}0d`,border:`1px solid ${c.color}33`,color:c.color,borderRadius:8,padding:"4px 12px",fontSize:12,fontWeight:600}}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{width:210,display:"flex",flexDirection:"column",gap:12,justifyContent:"center"}}>
        {[["Duration",c.duration,"#fff"],["Fee","Contact Us",c.color],["Seats","Limited","#4ade80"]].map(([k,v,vc])=>(
          <div key={k} style={{background:"rgba(0,0,0,.25)",borderRadius:12,padding:"14px 18px",border:"1px solid rgba(139,92,246,.08)"}}>
            <div style={{color:C.dimmed,fontSize:10,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>{k.toUpperCase()}</div>
            <div style={{color:vc,fontWeight:700,fontSize:17}}>{v}</div>
          </div>
        ))}
        <MagBtn onClick={onApply} style={{width:"100%",marginTop:4}}>Apply Now →</MagBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ APPLY FORM ════════════ */
function ApplyForm({ course, nav, showToast }) {
  const [step, setStep] = useState(1);
  const [imgPrev, setImgPrev] = useState(null);
  const [f, setF] = useState({
    name:"",fatherName:"",cnic:"",dob:"",gender:"",phone:"",email:"",city:"",address:"",
    education:"",institution:"",passingYear:"",experience:"",hasLaptop:"",hasInternet:"",
    currentJob:"",howHeard:"",photo:null,photoName:"",section:"",comments:"",
    courseName:course.title,courseId:course.id,
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const setLocalPhoto = (file) => {
    const r = new FileReader();
    r.onload = ev => { set("photo", ev.target.result); set("photoName", file.name); setImgPrev(ev.target.result); };
    r.readAsDataURL(file);
  };
  const handlePhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const sb = await initializeSupabase();
    if (!sb || !sb.client) {
      setLocalPhoto(file);
      return;
    }
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g,'-')}`;
    const storage = sb.client.storage.from(supabaseStorageBucket);
    const { data, error } = await storage.upload(fileName, file, { upsert: true });
    if (error) {
      console.warn("Photo upload failed, using local preview instead:", error);
      setLocalPhoto(file);
      showToast(`Photo upload failed: ${error.message}. Saved locally instead.`,"err");
      return;
    }
    const { data: publicData, error: publicError } = storage.getPublicUrl(fileName);
    if (publicError || !publicData?.publicUrl) {
      console.warn("Failed to get public URL for uploaded photo:", publicError);
      setLocalPhoto(file);
      showToast("Photo saved locally because public URL could not be resolved","err");
      return;
    }
    set("photo", publicData.publicUrl);
    set("photoName", file.name);
    setImgPrev(publicData.publicUrl);
  };
  const validate = () => {
    if (!f.photo) {
      showToast("Please upload your profile photo","err");
      return false;
    }
    const required = [
      ["name","Full name"],
      ["fatherName","Father's name"],
      ["cnic","CNIC"],
      ["dob","Date of birth"],
      ["gender","Gender"],
      ["phone","Phone number"],
      ["email","Email"],
      ["city","City"],
      ["address","Address"],
      ["education","Education level"],
      ["institution","Institution name"],
      ["passingYear","Passing year"],
      ["experience","Experience"],
      ["hasLaptop","Laptop status"],
      ["hasInternet","Internet access"],
      ["currentJob","Current occupation"],
      ["howHeard","How you found us"],
    ];
    for (const [key,label] of required) {
      if (!f[key]) { showToast(`Fill required: ${label}`,"err"); return false; }
    }
    const phone = (f.phone || "").replace(/\D/g,"");
    const cnic = (f.cnic || "").replace(/\D/g,"");
    if (!/^\d{11}$/.test(phone)) { showToast("Phone must contain exactly 11 digits","err"); return false; }
    if (!/^\d{13}$/.test(cnic)) { showToast("CNIC must contain 13 digits only","err"); return false; }
    if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test((f.email || ""))) { showToast("Please enter a valid email address","err"); return false; }
    return true;
  };
  const submit = async () => {
    const selectedSection = (f.section || "").trim();
    if (!selectedSection) {
      showToast("Please select a batch time before submitting","err");
      return;
    }
    const arr = db.get("students") || [];
    const normalizedPhone = (f.phone || "").replace(/\D/g,"");
    const normalizedCnic = (f.cnic || "").replace(/\D/g,"");
    const payload = {
      ...f,
      section:selectedSection,
      phone:normalizedPhone,
      cnic:normalizedCnic,
      id:uid(),
      appliedAt:new Date().toISOString(),
      status:"pending",
      fee:{paid:false, challan:null, submitted:false, transactionId:null},
      password:normalizedPhone
    };
    arr.push(payload);
    const localSaved = db.set("students", arr);
    let syncResult = await writeSupabaseValue("students", [payload]);
    if (!syncResult?.ok) {
      const authOk = await ensureStudentAuth(payload.email, payload.password);
      if (authOk) {
        syncResult = await writeSupabaseValue("students", [payload]);
      }
    }
    if (!localSaved) {
      showToast("Saved to Supabase, but this browser could not store the local copy", "err");
    }
    if (!syncResult?.ok) {
      const message = syncResult?.error?.message || syncResult?.error?.toString() || "Saved locally, but Supabase sync failed";
      showToast(message, "err");
      console.warn("Student sync issue:", syncResult?.error || syncResult);
      return;
    }
    try{ window.dispatchEvent(new Event('studentsUpdated')); }catch(e){}
    setStep(3);
    showToast("Application submitted successfully","ok");
  };

  const sendWhatsApp = () => {
    const adminPhone = "923262411926";
    const message = `Hello admin, I have submitted my application. Please confirm my details. Name: ${f.name}. Course: ${course.title}. Phone: ${f.phone}.`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const resetForm = () => {
    setStep(1);
    setImgPrev(null);
    setF({
      name:"",fatherName:"",cnic:"",dob:"",gender:"",phone:"",email:"",city:"",address:"",
      education:"",institution:"",passingYear:"",experience:"",hasLaptop:"",hasInternet:"",
      currentJob:"",howHeard:"",photo:null,photoName:"",section:"",comments:"",
      courseName:course.title,courseId:course.id,
    });
  };

  const card = {background:C.panel,border:`1px solid ${C.border}`,borderRadius:22,padding:36,backdropFilter:"blur(20px)"};

  if (step===1) return (
    <div style={{background:C.bg,minHeight:"100vh",padding:"100px 20px 60px"}}>
      <div style={{maxWidth:780,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:36,animation:"fadeUp .5s both"}}>
          <SLabel>Application — Step 1 of 2</SLabel>
          <h2 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:28,fontWeight:800,marginTop:10}}>
            Apply: <span style={{background:`linear-gradient(135deg,${course.color||C.violet},${C.magenta})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{course.title}</span>
          </h2>
          <StepBar step={1}/>
        </div>
        <div style={card}>
          <FSec label="👤 Personal Information"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0 16px"}}>
            <FI l="Full Name *" v={f.name} s={v=>set("name",v)} ph="Muhammad Ali"/>
            <FI l="Father's Name *" v={f.fatherName} s={v=>set("fatherName",v)} ph="Muhammad Ahmed"/>
            <FI l="CNIC / B-Form *" v={f.cnic} s={v=>set("cnic",v)} ph="35201-1234567-1"/>
            <FI l="Date of Birth *" v={f.dob} s={v=>set("dob",v)} type="date"/>
            <FSel l="Gender *" v={f.gender} s={v=>set("gender",v)} opts={["Male","Female","Other"]}/>
            <FI l="Phone / WhatsApp *" type="tel" v={f.phone} s={v=>set("phone",v.replace(/\D/g,"") )} ph="03XXXXXXXXX"/>
            <FI l="Email Address *" v={f.email} s={v=>set("email",v)} ph="you@email.com" type="email"/>
            <FI l="City *" v={f.city} s={v=>set("city",v)} ph="Lahore"/>
          </div>
          <FI l="Full Address *" v={f.address} s={v=>set("address",v)} ph="House #, Street, Area, City" wide/>

          <FI l="Additional Comments" v={f.comments} s={v=>set("comments",v)} ph="Anything you'd like us to know" wide ta/>

          <FSec label="🎓 Education & Background"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0 16px"}}>
            <FSel l="Education Level *" v={f.education} s={v=>set("education",v)} opts={["Matric","Intermediate","Bachelor's","Master's","Other"]}/>
            <FI l="Institution Name *" v={f.institution} s={v=>set("institution",v)} ph="College / University Name"/>
            <FI l="Passing Year *" v={f.passingYear} s={v=>set("passingYear",v)} ph="2024"/>
            <FSel l="IT / Cyber Experience *" v={f.experience} s={v=>set("experience",v)} opts={["No Experience","Basic Computer Use","Some Networking","Some Programming","Prior Cybersecurity"]}/>
          </div>

          <FSec label="💻 Technical Setup"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0 16px"}}>
            <FSel l="Do you have a Laptop? *" v={f.hasLaptop} s={v=>set("hasLaptop",v)} opts={["Yes, I own a laptop","No, but I can arrange one","No laptop access"]}/>
            <FSel l="Home Internet Access? *" v={f.hasInternet} s={v=>set("hasInternet",v)} opts={["Yes, stable broadband","Yes, sometimes slow","Mobile data only","No internet at home"]}/>
            <FI l="Current Occupation" v={f.currentJob} s={v=>set("currentJob",v)} ph="Student / IT Job / etc."/>
            <FSel l="How did you find us?" v={f.howHeard} s={v=>set("howHeard",v)} opts={["Social Media","Friend / Family","Google Search","University / College","Other"]}/>
          </div>

          <FSec label="📷 Profile Photo"/>
          <div className="photo-row">
            {imgPrev
              ? <img src={imgPrev} alt="preview" style={{width:88,height:88,borderRadius:14,objectFit:"cover",border:`2px solid ${C.violet}`,boxShadow:`0 0 20px ${C.violet}44`}}/>
              : <div style={{width:88,height:88,borderRadius:14,background:"rgba(139,92,246,.06)",border:"2px dashed rgba(139,92,246,.25)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:24,color:C.dimmed,gap:4}}>
                  📷<span style={{fontSize:10}}>No photo</span>
                </div>
            }
            <div>
              <label style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(139,92,246,.12)",border:`1px solid ${C.border}`,color:C.violetLt,borderRadius:12,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                📁 Choose Photo (JPG/PNG)
                <input type="file" accept="image/*" onChange={handlePhoto}/>
              </label>
              {f.photoName && <div style={{color:"#4ade80",fontSize:12,marginTop:6}}>✅ {f.photoName}</div>}
              <div style={{color:C.dimmed,fontSize:11,marginTop:4}}>Passport-size photo preferred</div>
            </div>
          </div>

          <div className="form-actions">
            <MagBtn onClick={()=>nav("courses")} outline>← Back to Courses</MagBtn>
            <MagBtn onClick={(e)=>{ e.preventDefault(); if (validate()) setStep(2); }}>Next: Select Batch →</MagBtn>
          </div>
        </div>
      </div>
    </div>
  );

  if (step===2) return (
    <div style={{background:C.bg,minHeight:"100vh",padding:"100px 20px 60px"}}>
      <div style={{maxWidth:580,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <SLabel>Application — Step 2 of 2</SLabel>
          <h2 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:24,fontWeight:800,marginTop:10}}>Select Your <span style={{background:`linear-gradient(135deg,${C.violet},${C.magenta})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Batch Time</span></h2>
          <StepBar step={2}/>
        </div>
        <div style={card}>
          {SECTIONS.map(sec => {
            const active = f.section === sec.id;
            return (
              <label key={sec.id} onClick={() => set("section", sec.id)} className="batch-card" style={{display:"flex",alignItems:"center",gap:18,padding:22,borderRadius:16,marginBottom:14,cursor:"pointer",transition:"all .2s",
                border:`2px solid ${active?C.violet:C.border}`,
                background:active?"rgba(139,92,246,.1)":C.panel,
                boxShadow:active?`0 0 24px rgba(139,92,246,.2)`:"none"}}>
                <input type="radio" name="section" checked={active} onChange={() => set("section", sec.id)} style={{width:18,height:18,accentColor:"#8b5cf6",cursor:"pointer",flexShrink:0,background:"#000"}} />
                <div style={{width:26,height:26,borderRadius:"50%",border:`2px solid ${active?"#ffffff":"#8b5cf6"}`,
                  background:"#000",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:active?"#e879f9":"#fff",fontWeight:900,flexShrink:0,boxShadow:active?"0 0 0 4px rgba(139,92,246,.22)":"0 0 0 2px rgba(139,92,246,.12)"}}>
                  {active?"✓":""}
                </div>
                <span style={{fontSize:26,flexShrink:0}}>{sec.icon}</span>
                <div>
                  <div style={{color:"#fff",fontWeight:700,fontSize:16}}>{sec.label}</div>
                  <div style={{color:C.muted,fontSize:13,marginTop:2}}>{sec.time}</div>
                </div>
              </label>
            );
          })}
          <div style={{background:"rgba(139,92,246,.06)",borderRadius:14,padding:18,margin:"20px 0",fontSize:13,color:C.muted,lineHeight:1.9,border:"1px solid rgba(139,92,246,.12)"}}>
            <strong style={{color:C.violetLt}}>Course:</strong> {course.title}<br/>
            <strong style={{color:C.violetLt}}>Duration:</strong> {course.duration}<br/>
            <strong style={{color:"#fbbf24"}}>Fee:</strong> Shared privately after admin confirmation.
          </div>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <MagBtn onClick={()=>setStep(1)} outline>← Back</MagBtn>
            <MagBtn onClick={(e)=>{ e.preventDefault(); submit(); }}>Submit Application ✅</MagBtn>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"100px 20px 60px"}}>
      <div style={{...card,maxWidth:520,width:"100%",textAlign:"center",animation:"fadeUp .5s both"}}>
        <div style={{fontSize:72,marginBottom:20}}>🎉</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontSize:28,marginBottom:14}}>Application Submitted!</h2>
        <p style={{color:C.muted,fontSize:15,lineHeight:1.8,marginBottom:28}}>
          Thank you, <strong style={{color:"#fff"}}>{f.name.split(" ")[0]}</strong>!<br/>
          Your application for <strong style={{color:C.violetLt}}>{course.title}</strong> is under review.
        </p>
        <div style={{background:"rgba(0,0,0,.3)",borderRadius:14,padding:20,textAlign:"left",marginBottom:24}}>
          {[["Batch",SECTIONS.find(s=>s.id===f.section)?.label||"-"],["Status","⏳ Pending Review"],["Login Email",f.email],["Login Password",f.phone+" (your phone)"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(139,92,246,.1)",flexWrap:"wrap",gap:4,fontSize:13}}>
              <span style={{color:C.muted}}>{k}</span>
              <span style={{color:C.violetLt,fontFamily:"monospace",fontSize:12}}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{color:C.dimmed,fontSize:13,marginBottom:28}}>Your application is under review. You will be notified by email or WhatsApp.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <MagBtn onClick={()=>sendWhatsApp()}>💬 Confirm via WhatsApp</MagBtn>
          <MagBtn onClick={()=>resetForm()} outline>📝 Apply Again</MagBtn>
          <MagBtn onClick={()=>nav("login")}>🔐 Student Login</MagBtn>
          <MagBtn onClick={()=>nav("home")} outline>🏠 Home</MagBtn>
        </div>
          <div style={{marginTop:28,display:"flex",gap:18,justifyContent:"center",flexWrap:"wrap"}}>
            <div style={{maxWidth:420,color:C.muted,fontSize:14,lineHeight:1.7}}>
              <strong style={{color:C.violetLt}}>Professional Certificate:</strong> All completing students receive a verified course certificate to share on LinkedIn and CVs.
            </div>
            <div style={{maxWidth:420,color:C.muted,fontSize:14,lineHeight:1.7}}>
              <strong style={{color:C.violetLt}}>Internship & Placement Support:</strong> Top students are recommended for internship opportunities with partner companies.
            </div>
          </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ AUTH ══════════════════ */
function AuthShell({ title, sub, children }) {
  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <Particles count={40}/>
      <CircuitBg opacity={0.1}/>
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,.1) 0%,transparent 65%)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,background:C.panel,border:`1px solid ${C.border}`,borderRadius:24,padding:44,width:"100%",maxWidth:420,backdropFilter:"blur(24px)",animation:"fadeUp .5s both",boxShadow:"0 24px 64px rgba(0,0,0,.6)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <svg width="52" height="52" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" rx="16" fill="#1a0a30"/><rect width="80" height="80" rx="16" stroke="url(#alg)" strokeWidth="1.5" fill="none"/>
            <defs><linearGradient id="alg" x1="0" y1="0" x2="80" y2="80"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#e879f9"/></linearGradient></defs>
            <path d="M40 11L67 24V44C67 60 40 71 40 71C40 71 13 60 13 44V24Z" fill="none" stroke="url(#alg)" strokeWidth="2.2" strokeLinejoin="round"/>
            <text x="40" y="51" textAnchor="middle" fill="url(#alg)" style={{fontFamily:"Arial Black",fontWeight:900,fontSize:20}}>ZZ</text>
          </svg>
          <h2 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:22,fontWeight:800,marginTop:16,marginBottom:6}}>{title}</h2>
          <p style={{color:C.muted,fontSize:13}}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function StudentLogin({ nav, setUser, showToast }) {
  const [e,setE]=useState(""); const [p,setP]=useState("");
  const [loading, setLoading] = useState(false);
  const login = async () => {
    setLoading(true);
    const s = await findStudentByEmailAndPassword(e, p);
    if (!s) {
      showToast("Wrong email or password","err");
      setLoading(false);
      return;
    }
    setUser(s); nav("portal");
    setLoading(false);
  };
  return (
    <AuthShell title="Student Login" sub="Access your enrollment portal">
      <FI l="Email Address" type="email" v={e} s={setE} ph="you@email.com" wide/>
      <FI l="Password" type="password" v={p} s={setP} ph="Your registered phone number" wide/>
      <MagBtn onClick={login} style={{width:"100%"}}>{loading ? "Checking..." : "Login to Portal →"}</MagBtn>
      <div style={{textAlign:"center",marginTop:16}}>
        <button onClick={()=>nav("courses")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>
          Not registered yet? <span style={{color:C.violetLt,textDecoration:"underline"}}>View Courses</span>
        </button>
      </div>
    </AuthShell>
  );
}

function AdminLogin({ nav, setAdmin, showToast }) {
  const [e,setE]=useState("");
  const [p,setP]=useState("");
  const [loading,setLoading]=useState(false);
  const login = async () => {
    if (!e.trim() || !p) {
      showToast("Enter admin email and password","err");
      return;
    }
    setLoading(true);
    const sb = await initializeSupabase();
    if (!sb || !sb.client) {
      showToast("Supabase is not available","err");
      setLoading(false);
      return;
    }
    const { error } = await sb.client.auth.signInWithPassword({
      email: e.trim().toLowerCase(),
      password: p,
    });
    if (!error) {
      setAdmin(true);
      nav("admin");
      showToast("Admin signed in successfully","ok");
    } else {
      showToast(error.message || "Wrong admin email or password","err");
    }
    setLoading(false);
  };
  return (
    <AuthShell title="Admin Panel" sub="ZZ Security Management Access">
      <FI l="Admin Email" type="email" v={e} s={setE} ph="Put your email" wide/>
      <FI l="Admin Password" type="password" v={p} s={setP} ph="Put your password" wide/>
      <MagBtn onClick={login} style={{width:"100%"}}>{loading ? "Signing in..." : "Access Admin Panel →"}</MagBtn>
    </AuthShell>
  );
}

/* ═══════════════════════════════════ STUDENT PORTAL ════════ */
function StudentPortal({ user:init, nav, setUser }) {
  const [u,setU]=useState(init);
  useEffect(() => {
    const load = async () => {
      const remote = await getStudentById(init.id);
      if (remote) setU(remote);
      else {
        const local = (db.get("students")||[]).find(s=>s.id===init.id);
        if (local) setU(local);
      }
    };
    load();
  }, []);
  const sc={pending:"#fbbf24","payment-requested":"#fbbf24","payment-submitted":"#8b5cf6",paid:"#4ade80",rejected:"#f87171"};
  const si={pending:"⏳","payment-requested":"💳","payment-submitted":"📩",paid:"✅",rejected:"❌"};
  const card={background:C.panel,border:`1px solid ${C.border}`,borderRadius:18,padding:24,backdropFilter:"blur(16px)"};

  return (
    <div style={{background:C.bg,minHeight:"100vh",padding:"100px 24px 60px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        {/* header */}
        <div style={{...card,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            {u.photo
              ?<img src={u.photo} alt="av" style={{width:56,height:56,borderRadius:14,objectFit:"cover",border:`2px solid ${C.violet}`,boxShadow:`0 0 20px ${C.violet}44`}}/>
              :<div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#1a0a30,#2d0a50)",display:"flex",alignItems:"center",justifyContent:"center",color:C.violet,fontWeight:800,fontSize:24,fontFamily:"'Syne',sans-serif",border:`1px solid ${C.border}`}}>{u.name[0]}</div>
            }
            <div>
              <div style={{color:"#fff",fontWeight:700,fontSize:18}}>Welcome, {u.name.split(" ")[0]}!</div>
              <div style={{color:C.muted,fontSize:13}}>ZZ Security Student Portal</div>
            </div>
          </div>
          <MagBtn onClick={()=>{setUser(null);nav("home");}} outline>Logout</MagBtn>
        </div>

        {/* status */}
        <div style={{...card,display:"flex",alignItems:"center",gap:16,marginBottom:22,
          border:`1px solid ${sc[u.status]}44`,background:`rgba(${u.status==="paid"?"0,40,15":u.status==="rejected"?"40,5,5":"40,30,0"},.4)`}}>
          <span style={{fontSize:30}}>{si[u.status]}</span>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:16}}>Application Status: <span style={{color:sc[u.status]}}>{u.status.replace(/-/g,' ').toUpperCase()}</span></div>
            <div style={{color:C.muted,fontSize:13,marginTop:3}}>
              {u.status==="pending"&&"Your application is under review. You will be notified soon."}
              {u.status==="payment-requested"&&"Payment is pending. Upload your receipt and transaction ID below."}
              {u.status==="payment-submitted"&&"Payment receipt received. Awaiting admin verification."}
              {u.status==="paid"&&"Payment confirmed. Your enrollment is complete."}
              {u.status==="rejected"&&"Your request was rejected. Please contact admin at zzsecurityinstitute@gmail.com or 03262411926."}
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
          <div style={card}>
            <div style={{color:C.violetLt,fontWeight:700,fontSize:12,letterSpacing:1.5,marginBottom:18,textTransform:"uppercase"}}>📚 Enrollment Details</div>
            {[["Course",u.courseName],["Batch",SECTIONS.find(s=>s.id===u.section)?.label||u.section],
              ["Applied",new Date(u.appliedAt).toLocaleDateString("en-PK")],
              ["Education",u.education],["Phone",u.phone],["Email",u.email]].map(([k,v])=>v&&(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(139,92,246,.08)",fontSize:13,flexWrap:"wrap",gap:4}}>
                <span style={{color:C.muted}}>{k}</span><span style={{color:"#fff",fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>

          {(u.status === "payment-requested" || u.status === "payment-submitted" || u.status === "paid") && (
            <div style={card}>
              <div style={{color:C.violetLt,fontWeight:700,fontSize:12,letterSpacing:1.5,marginBottom:18,textTransform:"uppercase"}}>💳 Fee Payment</div>
              {u.fee?.paid
                ? <div style={{color:"#4ade80",fontWeight:700,fontSize:16,padding:"12px 0"}}>✅ Fee Paid — Thank you!</div>
                : <>
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                      <div style={{fontSize:13,color:C.muted}}>Amount Due</div>
                      <div style={{display:"flex",alignItems:"baseline",gap:12}}>
                        {u.fee?.original && u.fee.amount < u.fee.original && (
                          <div style={{color:C.muted,textDecoration:"line-through",fontSize:14}}>PKR {u.fee.original.toLocaleString()}</div>
                        )}
                        <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>PKR {u.fee?.amount?.toLocaleString()||"—"}</div>
                        <div style={{color:C.dimmed,fontSize:12}}>/ pay within {u.fee?.dueDays||3} days</div>
                      </div>
                      {u.fee?.note && <div style={{color:C.violetLt,fontSize:13}}>{u.fee.note}</div>}
                    </div>
                    <div style={{color:C.muted,fontSize:13,lineHeight:1.9,background:"rgba(139,92,246,.06)",borderRadius:12,padding:16,marginBottom:16,border:"1px solid rgba(139,92,246,.1)"}}>
                      <div style={{fontWeight:700,color:C.violetLt,marginBottom:8}}>Payment Options & Bank Details</div>
                      <div style={{marginBottom:8}}><strong>Bank (Meezan Bank):</strong> Account No. <span style={{color:"#4ade80",fontWeight:700}}>00300114227600</span></div>
                      <div style={{marginBottom:8}}><strong>Raast Payment:</strong> <span style={{color:"#4ade80",fontWeight:700}}>03262411926</span></div>
                      <div style={{marginBottom:6}}><strong>Account Title:</strong> Muhammad Zargham Talib</div>
                      <div style={{color:C.dimmed,fontSize:12,marginTop:6}}>After payment, upload the receipt and enter the transaction ID for verification.</div>
                    </div>
                    {u.status === "payment-requested" && <ChallanUp id={u.id}/>} 
                    {u.status === "payment-submitted" && u.fee?.challan && (
                      <div style={{display:"grid",gap:12}}>
                        <div style={{fontWeight:700,color:C.violetLt}}>Receipt uploaded. Awaiting verification.</div>
                        <img src={u.fee.challan} alt="uploaded receipt" style={{width:"100%",borderRadius:16,border:`1px solid ${C.border}`}}/>
                        <div style={{color:C.muted,fontSize:13}}>Transaction ID: <strong style={{color:"#fff"}}>{u.fee.transactionId}</strong></div>
                      </div>
                    )}
                  </>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChallanUp({ id }) {
  const [done,setDone]=useState(false);
  const [tx,setTx]=useState("");
  const [img,setImg]=useState(null);
  const submitAll = () => {
    if(!img){alert('Please upload receipt image');return;}
    if(!tx.trim()){alert('Please enter transaction ID');return;}
    const arr=db.get("students")||[]; const i=arr.findIndex(s=>s.id===id);
    if(i!==-1){
      arr[i].fee.challan = img;
      arr[i].fee.transactionId = tx.trim();
      arr[i].fee.submitted = true;
      arr[i].fee.submittedAt = new Date().toISOString();
      arr[i].status = "payment-submitted";
      db.set("students",arr);
      // notify other parts (and other tabs) that students changed
      try{ window.dispatchEvent(new Event('studentsUpdated')); }catch(e){}
      setDone(true);
    }
  };
  if (done) return <div style={{color:"#4ade80",fontSize:13}}>✅ Receipt submitted. Awaiting admin verification.</div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <label style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(139,92,246,.1)",border:`1px solid ${C.border}`,color:C.violetLt,borderRadius:12,padding:"11px 20px",cursor:"pointer",fontSize:13,fontWeight:600}}>
        📎 Upload Payment Receipt
        <input type="file" accept="image/*" onChange={e=>{
          const file=e.target.files[0]; if(!file) return;
          const r=new FileReader(); r.onload=ev=>{ setImg(ev.target.result); };
          r.readAsDataURL(file);
        }}/>
      </label>
      <input placeholder="Transaction ID" value={tx} onChange={e=>setTx(e.target.value)} style={{...inputSt}} />
      {img && <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10}}>
        <img src={img} alt="receipt preview" style={{width:88,height:88,borderRadius:14,objectFit:"cover",border:`2px solid ${C.violet}`}}/>
        <div style={{color:C.violetLt,fontSize:13,fontWeight:700}}>Receipt ready to submit</div>
      </div>}
      <div style={{display:"flex",gap:8}}>
        <MagBtn onClick={submitAll} style={{padding:"10px 16px"}}>Submit Receipt</MagBtn>
        <MagBtn onClick={()=>{setImg(null);setTx("");}} outline>Clear</MagBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ ADMIN PANEL ═══════════ */
function AdminPanel({ nav, setAdmin, showToast }) {
  const [tab,setTab]=useState("all");
  const [list,setList]=useState(db.get("students")||[]);
  const [detail,setDetail]=useState(null);
  const [messages,setMessages]=useState(db.get("quickMessages")||[]);
  const refresh = useCallback(async () => {
    const localStudents = db.get("students") || [];
    const remoteStudents = await readSupabaseValue("students");
    const nextStudents = remoteStudents ? mergeRecords(localStudents, remoteStudents) : localStudents;
    db.set("students", nextStudents);
    setList(nextStudents);

    const localMessages = db.get("quickMessages") || [];
    const remoteMessages = await readSupabaseValue("quickMessages");
    const nextMessages = remoteMessages ? mergeRecords(localMessages, remoteMessages) : localMessages;
    db.set("quickMessages", nextMessages);
    setMessages(nextMessages);
  }, []);
  useEffect(()=>{
    let mounted = true;
    const sync = ()=>{ if (mounted) refresh(); };
    const onStorage = (e)=>{ if(e.key === 'students' || e.key === 'quickMessages') sync(); };
    const onMsg = ()=>sync();
    window.addEventListener('studentsUpdated', sync);
    window.addEventListener('storage', onStorage);
    window.addEventListener('quickMessagesUpdated', onMsg);
    window.addEventListener('focus', sync);
    const timer = window.setInterval(sync, 5000);
    sync();
    return ()=>{ 
      mounted = false;
      window.removeEventListener('studentsUpdated', sync);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('quickMessagesUpdated', onMsg);
      window.removeEventListener('focus', sync);
      window.clearInterval(timer);
    };
  },[refresh]);
  const sc={pending:"#fbbf24","payment-requested":"#fbbf24","payment-submitted":"#8b5cf6",paid:"#4ade80",rejected:"#f87171"};
  const upd=(id,status)=>{
    const a=db.get("students")||[];const i=a.findIndex(s=>s.id===id);
    if(i!==-1){
      a[i].status=status;
      if(status==="payment-requested"){
        a[i].fee = {...(a[i].fee||{}), original:a[i].fee?.original||35000, amount:a[i].fee?.amount||35000, dueDays:a[i].fee?.dueDays||3, submitted:false, paid:false};
      }
      if(status==="payment-submitted"){
        a[i].fee = {...(a[i].fee||{}), original:a[i].fee?.original||35000, amount:a[i].fee?.amount||35000, dueDays:a[i].fee?.dueDays||3, submitted:true, paid:false};
      }
      if(status==="paid"){
        a[i].fee = {...(a[i].fee||{}), paid:true, submitted:true};
      }
      db.set("students",a);refresh();setDetail(d=>d?{...d,status}:d);showToast(`Status updated: ${status}`);
    }
  };
  const markPaid=(id)=>{const a=db.get("students")||[];const i=a.findIndex(s=>s.id===id);if(i!==-1){a[i].status="paid";a[i].fee = {...(a[i].fee||{}), paid:true};db.set("students",a);refresh();showToast("Fee marked as paid!");}};
  const filtered = (()=>{
    if(tab==="all") return list;
    return list.filter(s=>s.status===tab);
  })();
  const card={background:C.panel,border:`1px solid ${C.border}`,borderRadius:18,padding:22,backdropFilter:"blur(16px)"};

  if (detail) return (
    <div style={{background:C.bg,minHeight:"100vh",padding:"100px 24px 60px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <h2 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:22,fontWeight:800}}>Student Detail</h2>
          <MagBtn onClick={()=>setDetail(null)} outline>← Back to List</MagBtn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,marginBottom:24}}>
          <div style={card}>
            {detail.photo&&<img src={detail.photo} alt="ph" onClick={()=>window.open(detail.photo)} style={{width:72,height:72,borderRadius:12,objectFit:"cover",marginBottom:14,border:`2px solid ${C.violet}`,cursor:"pointer"}}/>}
            <div style={{color:C.violetLt,fontWeight:700,fontSize:12,letterSpacing:1.5,marginBottom:16,textTransform:"uppercase"}}>👤 Personal Info</div>
            {[["Name",detail.name],["Father",detail.fatherName],["CNIC",detail.cnic],["Phone",detail.phone],["Email",detail.email],["City",detail.city],["Comments",detail.comments]].map(([k,v])=>v&&( 
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(139,92,246,.08)",fontSize:13,flexWrap:"wrap",gap:4}}>
                <span style={{color:C.muted}}>{k}</span><span style={{color:"#fff",fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{color:C.violetLt,fontWeight:700,fontSize:12,letterSpacing:1.5,marginBottom:16,textTransform:"uppercase"}}>📚 Course & Status</div>
            {[["Course",detail.courseName],["Section",SECTIONS.find(s=>s.id===detail.section)?.label],
              ["Education",detail.education],["Laptop",detail.hasLaptop],["Internet",detail.hasInternet],
              ["Applied",new Date(detail.appliedAt).toLocaleDateString("en-PK")]].map(([k,v])=>v&&(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(139,92,246,.08)",fontSize:13,flexWrap:"wrap",gap:4}}>
                <span style={{color:C.muted}}>{k}</span><span style={{color:"#fff",fontWeight:500}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(139,92,246,.08)",fontSize:13}}>
              <span style={{color:C.muted}}>Status</span><span style={{color:sc[detail.status||"pending"],fontWeight:700}}>{(detail.status||"pending").toUpperCase()}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:13}}>
              <span style={{color:C.muted}}>Fee</span><span style={{color:detail.fee?.paid?"#4ade80":"#fbbf24",fontWeight:600}}>{detail.fee?.paid?"✅ Paid":"⏳ Pending"}</span>
            </div>
            {detail.fee?.challan&&<img src={detail.fee.challan} alt="challan" style={{maxWidth:"100%",borderRadius:10,marginTop:12,border:`1px solid ${C.border}`}}/>}
            <div style={{marginTop:14,borderTop:"1px dashed rgba(139,92,246,.06)",paddingTop:12}}>
              <div style={{color:C.violetLt,fontWeight:700,fontSize:12,marginBottom:8}}>Payment Settings</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <input type="number" defaultValue={detail.fee?.amount||35000} placeholder="Amount to pay" id="fee-amount" style={{...inputSt}} />
                <input type="number" defaultValue={detail.fee?.original||35000} placeholder="Original fee" id="fee-original" style={{...inputSt}} />
                <input type="number" defaultValue={detail.fee?.dueDays||3} placeholder="Due days" id="fee-due" style={{...inputSt}} />
                <input defaultValue={detail.fee?.note||""} placeholder="Note / discount label" id="fee-note" style={{...inputSt}} />
              </div>
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <MagBtn onClick={()=>{
                  const a=db.get("students")||[]; const i=a.findIndex(s=>s.id===detail.id); if(i===-1) return;
                  const amt = parseInt(document.getElementById('fee-amount').value||0,10);
                  const org = parseInt(document.getElementById('fee-original').value||amt,10);
                  const due = parseInt(document.getElementById('fee-due').value||3,10);
                  const note = document.getElementById('fee-note').value||"";
                  a[i].fee = {...(a[i].fee||{}), amount:amt, original:org, dueDays:due, note, submitted:a[i].fee?.submitted||false, paid:a[i].fee?.paid||false};
                  db.set("students",a); refresh(); setDetail(a[i]); showToast('Fee settings saved and student notified');
                }}>Save Fee & Notify</MagBtn>
                <MagBtn onClick={()=>{ /* placeholder for send notification */ }} outline>Send Notification</MagBtn>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {detail.status==="pending" && <>
            <MagBtn onClick={()=>upd(detail.id,"payment-requested")} style={{background:"linear-gradient(135deg,#065f46,#059669)"}}>💳 Confirm & Send Payment Request</MagBtn>
            <MagBtn onClick={()=>upd(detail.id,"rejected")} style={{background:"linear-gradient(135deg,#7f1d1d,#dc2626)"}}>❌ Reject Application</MagBtn>
          </>}
          {detail.status==="payment-requested" && <>
            <MagBtn onClick={()=>upd(detail.id,"rejected")} style={{background:"linear-gradient(135deg,#7f1d1d,#dc2626)"}}>❌ Reject Application</MagBtn>
          </>}
          {detail.status==="payment-submitted" && <>
            <MagBtn onClick={()=>markPaid(detail.id)} style={{background:"linear-gradient(135deg,#065f46,#059669)"}}>✅ Accept Payment</MagBtn>
            <MagBtn onClick={()=>{upd(detail.id,"payment-requested"); showToast('Payment receipt rejected. User may resubmit or contact admin.','err');}} style={{background:"linear-gradient(135deg,#7f1d1d,#dc2626)"}}>Reject Payment</MagBtn>
          </>}
          {detail.status==="paid" && <MagBtn onClick={()=>upd(detail.id,"payment-requested")} outline>↩ Revert to Payment Request</MagBtn>}
          {detail.status==="rejected" && <div style={{color:C.muted,fontSize:13}}>No actions available. Rejected applications are final.</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:C.bg,minHeight:"100vh",padding:"100px 24px 60px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:14}}>
          <h2 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:24,fontWeight:800}}>⚙️ Admin Panel — ZZ Security</h2>
          <div style={{display:"flex",gap:10}}>
            <MagBtn onClick={refresh} outline>🔄 Refresh</MagBtn>
            <MagBtn onClick={()=>{setAdmin(false);nav("home");}} style={{background:"rgba(239,68,68,.2)",border:"1px solid rgba(239,68,68,.4)",boxShadow:"none",color:"#f87171"}}>Logout</MagBtn>
          </div>
        </div>
        <div style={{...card,marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
            <div style={{color:C.violetLt,fontWeight:700,fontSize:12,letterSpacing:1.5,textTransform:"uppercase"}}>💬 Quick Messages</div>
            <div style={{color:C.muted,fontSize:12}}>{messages.length} total</div>
          </div>
          {messages.length===0
            ? <div style={{color:C.muted,fontSize:13}}>No quick messages yet.</div>
            : <div style={{display:"grid",gap:10}}>
                {messages.slice(0,6).map(m=>(
                  <div key={m.id} style={{background:"rgba(139,92,246,.06)",border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:6}}>
                      <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{m.name}</div>
                      <div style={{color:C.violetLt,fontSize:12}}>{m.number ? m.number : "No number provided"}</div>
                    </div>
                    <div style={{color:C.muted,fontSize:13,lineHeight:1.6}}>{m.message}</div>
                    <div style={{color:C.dimmed,fontSize:11,marginTop:6}}>{new Date(m.createdAt).toLocaleString("en-PK")}</div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
          {['all','pending','payment-requested','payment-submitted','paid','rejected'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              background:tab===t?"linear-gradient(135deg,rgba(124,58,237,.3),rgba(232,121,249,.2))":"rgba(139,92,246,.05)",
              border:`1px solid ${tab===t?C.violet:C.border}`,color:tab===t?C.violetLt:C.muted,
              borderRadius:12,padding:"9px 22px",cursor:"pointer",fontSize:13,fontWeight:700,
              boxShadow:tab===t?`0 0 16px rgba(139,92,246,.2)`:"none"}}>
              {(t==='all'? 'All' : t==='payment-requested'? 'Pending Payment' : t==='payment-submitted'? 'Payment Submitted' : t==='paid'? 'Paid' : t.charAt(0).toUpperCase()+t.slice(1))} ({t==='all'?list.length:list.filter(s=>s.status===t).length})
            </button>
          ))}
        </div>
        {filtered.length===0
          ? <div style={{color:C.muted,textAlign:"center",padding:80}}>No students found.</div>
          : <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:580}}>
                <thead>
                  <tr style={{background:"rgba(10,5,20,.9)"}}>
                    {["Name","Phone","Course","Section","Status","Fee","Actions"].map(h=>(
                      <th key={h} style={{padding:"13px 16px",color:C.muted,textAlign:"left",borderBottom:`1px solid ${C.border}`,fontWeight:700,letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s=>(
                    <tr key={s.id} style={{borderBottom:"1px solid rgba(139,92,246,.06)",transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"12px 16px"}}>
                        <button onClick={()=>setDetail(s)} style={{background:"none",border:"none",color:C.violetLt,cursor:"pointer",fontSize:13,fontWeight:600,textDecoration:"underline"}}>{s.name || "Unknown"}</button>
                      </td>
                      <td style={{padding:"12px 16px",color:C.muted}}>{s.phone}</td>
                      <td style={{padding:"12px 16px",color:C.muted,maxWidth:130}} title={s.courseName||""}>{courseLabel(s.courseName)}…</td>
                      <td style={{padding:"12px 16px",color:C.muted}}>{SECTIONS.find(sec=>sec.id===s.section)?.icon||"-"} {firstWord(SECTIONS.find(sec=>sec.id===s.section)?.label, "-")}</td>
                      <td style={{padding:"12px 16px"}}><span style={{color:sc[s.status||"pending"],fontWeight:700,fontSize:11,letterSpacing:.5}}>{(s.status||"pending").toUpperCase()}</span></td>
                      <td style={{padding:"12px 16px"}}><span style={{color:s.fee?.paid?"#4ade80":"#fbbf24",fontSize:11,fontWeight:700}}>{s.fee?.paid?"PAID":"PENDING"}</span></td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>upd(s.id,"payment-requested")} title="Send Payment Request" style={{background:"rgba(0,80,30,.6)",border:"1px solid rgba(74,222,128,.2)",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13}}>💳</button>
                          <button onClick={()=>upd(s.id,"rejected")} title="Reject" style={{background:"rgba(80,0,0,.6)",border:"1px solid rgba(248,113,113,.2)",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13}}>❌</button>
                          <button onClick={()=>setDetail(s)} title="View" style={{background:"rgba(139,92,246,.15)",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13}}>👁️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ CONTACT ═══════════════ */
function ContactPage({ showToast }) {
  const [form,setForm]=useState({name:"",number:"",message:""});
  const [submitted,setSubmitted]=useState(false);
  const update=(k,v)=>setForm(p=>({...p,[k]:v}));
  const submitQuick = () => {
    const name=(form.name||"").trim();
    const msg=(form.message||"").trim();
    if(!name||!msg){
      if(showToast) showToast("Please enter your name and message","err");
      else window.alert("Please enter your name and message");
      return;
    }
    const arr=db.get("quickMessages")||[];
    arr.unshift({id:uid(),name,number:(form.number||"").trim(),message:msg,createdAt:new Date().toISOString()});
    db.set("quickMessages", arr.slice(0,50));
    try{ window.dispatchEvent(new Event('quickMessagesUpdated')); }catch(e){}
    setForm({name:"",number:"",message:""});
    setSubmitted(true);
    if(showToast) showToast("Thank you for your feedback. Admin will contact you soon.","ok");
  };
  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <section style={{position:"relative",padding:"140px 32px 70px",textAlign:"center",overflow:"hidden",background:`radial-gradient(ellipse 100% 50% at 50% 0%,rgba(124,58,237,.12) 0%,${C.bg} 60%)`}}>
        <Particles count={40}/>
        <div style={{position:"relative",zIndex:2,animation:"fadeUp .6s both"}}>
          <SLabel>Get In Touch</SLabel>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(32px,5vw,58px)",color:"#fff",fontWeight:800,margin:"14px 0 16px",lineHeight:1.1}}>
            Contact <span style={{background:"linear-gradient(135deg,#8b5cf6,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>ZZ Security</span>
          </h1>
          <p style={{color:C.muted,fontSize:16,lineHeight:1.7}}>Have questions? We're here to help.</p>
        </div>
      </section>
      <section style={{padding:"0 32px 100px",maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:18,marginBottom:52}}>
          {[["📧","Email","zzsecurityinstitute@gmail.com","mailto:zzsecurityinstitute@gmail.com",C.violet],
            ["📱","WhatsApp","03262411926","https://wa.me/923262411926",C.cyan],
            ["📍","Location","Lahore, Pakistan","#",C.magenta],
            ["🕐","Office Hours","Mon–Sat: 9AM–9PM","#",C.violet]].map(([ico,l,v,h,color])=>(
            <Reveal key={l}>
              <TiltCard glowColor={color} style={{padding:28,textAlign:"center"}}>
                <a href={h} style={{display:"block",textDecoration:"none"}}>
                  <div style={{fontSize:28,marginBottom:12}}>{ico}</div>
                  <div style={{color:C.dimmed,fontSize:10,letterSpacing:2,fontWeight:700,marginBottom:6}}>{l.toUpperCase()}</div>
                  <div style={{color:color,fontWeight:700,fontSize:14,lineHeight:1.4}}>{v}</div>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <TiltCard glowColor={C.violet} style={{padding:40,maxWidth:520,margin:"0 auto"}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",color:C.violetLt,marginBottom:24,textAlign:"center",fontSize:18,fontWeight:700}}>Quick Message</h3>
            <FI l="Your Name" v={form.name} s={v=>update("name",v)} ph="Your full name" wide/>
            <FI l="Phone Number" type="tel" v={form.number} s={v=>update("number",v)} ph="03xxxxxxxxx" wide/>
            <FI l="Your Message" v={form.message} s={v=>update("message",v)} ph="Write your message here..." wide ta/>
            {submitted && <div style={{marginTop:10,padding:"10px 12px",borderRadius:10,background:"rgba(74,222,128,.12)",border:"1px solid rgba(74,222,128,.25)",color:"#4ade80",fontSize:13,fontWeight:600}}>Thank you for your feedback. Admin will contact you soon.</div>}
            <MagBtn onClick={submitQuick} style={{width:"100%",marginTop:12}}>Send Message 📨</MagBtn>
          </TiltCard>
        </Reveal>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════ FOOTER ════════════════ */
function SiteFooter({ nav }) {
  return (
    <footer style={{background:"#030306",borderTop:"1px solid rgba(139,92,246,.1)",padding:"56px 32px 24px"}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:40,marginBottom:40}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
              <rect width="80" height="80" rx="14" fill="#1a0a30"/><rect width="80" height="80" rx="14" stroke="url(#flg)" strokeWidth="1.5" fill="none"/>
              <defs><linearGradient id="flg" x1="0" y1="0" x2="80" y2="80"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#e879f9"/></linearGradient></defs>
              <path d="M40 11L67 24V44C67 60 40 71 40 71C40 71 13 60 13 44V24Z" fill="none" stroke="url(#flg)" strokeWidth="2.2" strokeLinejoin="round"/>
              <text x="40" y="51" textAnchor="middle" fill="url(#flg)" style={{fontFamily:"Arial Black",fontWeight:900,fontSize:20}}>ZZ</text>
            </svg>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,background:"linear-gradient(90deg,#fff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:1}}>ZZ SECURITY</div>
              <div style={{fontSize:9,letterSpacing:3,color:"rgba(167,139,250,.4)",fontWeight:600}}>INSTITUTE</div>
            </div>
          </div>
          <p style={{color:C.dimmed,fontSize:13,lineHeight:1.9,maxWidth:230}}>Pakistan's premier cybersecurity institute. Real skills. Real careers. Real results.</p>
        </div>
        <div>
          <div style={{color:C.violetLt,fontSize:10,letterSpacing:3,fontWeight:700,marginBottom:18,textTransform:"uppercase"}}>Quick Links</div>
          {[["Home","home"],["Courses","courses"],["Contact","contact"],["Student Login","login"]].map(([l,p])=>(
            <button key={p} onClick={()=>nav(p)} style={{display:"block",background:"none",border:"none",color:C.dimmed,cursor:"pointer",fontSize:13,padding:"4px 0",textAlign:"left",transition:"color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.color=C.violetLt}
              onMouseLeave={e=>e.currentTarget.style.color=C.dimmed}>{l}</button>
          ))}
        </div>
        <div>
          <div style={{color:C.violetLt,fontSize:10,letterSpacing:3,fontWeight:700,marginBottom:18,textTransform:"uppercase"}}>Contact</div>
          {["📧 zzsecurityinstitute@gmail.com","📱 03262411926","📍 Lahore, Pakistan"].map(v=>(
            <div key={v} style={{color:C.dimmed,fontSize:13,marginBottom:8}}>{v}</div>
          ))}
        </div>
        <div>
          <div style={{color:C.violetLt,fontSize:10,letterSpacing:3,fontWeight:700,marginBottom:18,textTransform:"uppercase"}}>Programs</div>
          {COURSES.map(c=>(
            <div key={c.id} style={{color:C.dimmed,fontSize:13,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>{c.icon}</span>{c.title.split(" ").slice(0,2).join(" ")}
            </div>
          ))}
        </div>
      </div>
      <Div/>
      <div style={{textAlign:"center",color:"rgba(245,240,255,.12)",fontSize:11,paddingTop:24,letterSpacing:.5}}>
        © 2024 ZZ Security Institute — All Rights Reserved
      </div>
    </footer>
  );
}