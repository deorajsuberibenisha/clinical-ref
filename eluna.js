/* Eluna — notes for clinicians. Loaded on demand by index.html (#eluna, #eluna/<bookId>).
   Notebooks and imported PDFs, tabs, page outline, Pencil/S Pen ink with palm rejection, highlighter, three erasers,
   lasso, laser, ruler, text boxes, photos, medical stickers, PDF text selection with word lookup, OCR, PDF export.
   Everything is stored on this device (IndexedDB "eluna"). Uses helpers from index.html (store, esc, $, $$, go, nbToast …). */
(function () {
"use strict";
const E = window.Eluna = {};
const PW = 1240, A4H = 1754, XR = 1.6;
const ic = (p, soft) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision" aria-hidden="true">${soft ? `<path d="${soft}" fill="currentColor" stroke="none" opacity=".16"/>` : ""}${p}</svg>`;
/* duotone line icons: a soft tinted body under a fine outline */
const I = {
  pen: ic('<path d="M4.2 19.8l1-4.1L15.6 5.3a2.3 2.3 0 0 1 3.2 3.2L8.4 18.9z"/><path d="M13.9 7l3.2 3.2M5.2 15.7l3.2 3.2"/>', "M4.2 19.8l1-4.1L15.6 5.3a2.3 2.3 0 0 1 3.2 3.2L8.4 18.9z"),
  hl: ic('<path d="m9.4 11.4-5.9 5.9v2.9h8.8l3-3"/><path d="m21.6 12.2-4.4 4.4a2 2 0 0 1-2.8 0l-5-5a2 2 0 0 1 0-2.8l4.4-4.4"/><path d="m14.8 3.4 7 7"/>', "m14 4.2 7.6 7.6-4.4 4.4a2 2 0 0 1-2.8 0l-5-5a2 2 0 0 1 0-2.8z"),
  eraser: ic('<path d="m7.4 20.5-4-4a1.4 1.4 0 0 1 0-2l9.8-9.8a1.4 1.4 0 0 1 2 0l5.2 5.2a1.4 1.4 0 0 1 0 2l-8.6 8.6"/><path d="M21 20.5H7.4M6.6 11.3l6.1 6.1"/>', "M6.6 11.3l6.6-6.6a1.4 1.4 0 0 1 2 0l5.2 5.2a1.4 1.4 0 0 1 0 2l-6.6 6.6z"),
  lasso: ic('<path d="M3.6 13.6A6.4 6.4 0 0 1 2.6 10c0-4.1 4.2-7.4 9.4-7.4s9.4 3.3 9.4 7.4-4.2 7.4-9.4 7.4c-1.6 0-3.1-.3-4.4-.8" stroke-dasharray="0.1 3.4"/><circle cx="5.3" cy="16.6" r="2"/><path d="M5.6 18.6c.2 1.4-.4 2.4-1.6 2.9"/>', "M12 2.6c5.2 0 9.4 3.3 9.4 7.4s-4.2 7.4-9.4 7.4S2.6 14.1 2.6 10 6.8 2.6 12 2.6z"),
  lassoRect: ic('<rect x="3.5" y="4.5" width="15" height="12" rx="2.5" stroke-dasharray="3 2.6"/><path d="M14.5 14.5l6 2.3-2.6 1.1-1.1 2.6z" fill="currentColor"/>', "M6 4.5h10a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 14V7A2.5 2.5 0 0 1 6 4.5z"),
  laser: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="elLz"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ff5a4f"/><stop offset="1" stop-color="#e11d48"/></radialGradient></defs><circle cx="12" cy="12" r="9" fill="#ff3b30" opacity=".12"/><circle cx="12" cy="12" r="6.2" fill="#ff3b30" opacity=".2"/><circle cx="12" cy="12" r="3.8" fill="url(#elLz)"/></svg>',
  text: ic('<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.5"/><path d="M8 8.2h8M12 8.2v8.3"/>', "M7.7 3.2h8.6a4.5 4.5 0 0 1 4.5 4.5v8.6a4.5 4.5 0 0 1-4.5 4.5H7.7a4.5 4.5 0 0 1-4.5-4.5V7.7a4.5 4.5 0 0 1 4.5-4.5z"),
  select: ic('<path d="M4.5 4h4M6.5 4v16M4.5 20h4"/><path d="M12.5 8h7.5M12.5 12h7.5M12.5 16h5"/>', "M11 5.5h10.5v13H11z"),
  fold: ic('<path d="m14.5 6.5-5.5 5.5 5.5 5.5"/>'),
  copy: ic('<rect x="8.5" y="8.5" width="12" height="12" rx="3"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>', "M11.5 8.5h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z"),
  more: ic('<circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/>'),
  undo: ic('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'), redo: ic('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>'),
  back: ic('<path d="M15 18l-6-6 6-6"/>'), x: ic('<path d="M18 6 6 18M6 6l12 12"/>'), plus: ic('<path d="M12 5v14M5 12h14"/>'),
  grip: ic('<circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/>'),
  side: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>'), read: ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  gear: ic('<path d="M10.3 2.9a1.8 1.8 0 0 1 3.4 0l.3.9a1.8 1.8 0 0 0 2.5 1l.9-.4a1.8 1.8 0 0 1 2.4 2.4l-.4.9a1.8 1.8 0 0 0 1 2.5l.9.3a1.8 1.8 0 0 1 0 3.4l-.9.3a1.8 1.8 0 0 0-1 2.5l.4.9a1.8 1.8 0 0 1-2.4 2.4l-.9-.4a1.8 1.8 0 0 0-2.5 1l-.3.9a1.8 1.8 0 0 1-3.4 0l-.3-.9a1.8 1.8 0 0 0-2.5-1l-.9.4a1.8 1.8 0 0 1-2.4-2.4l.4-.9a1.8 1.8 0 0 0-1-2.5l-.9-.3a1.8 1.8 0 0 1 0-3.4l.9-.3a1.8 1.8 0 0 0 1-2.5l-.4-.9a1.8 1.8 0 0 1 2.4-2.4l.9.4a1.8 1.8 0 0 0 2.5-1z"/><circle cx="12" cy="12" r="3"/>'),
  pdf: ic('<path d="M14 2.8H7a2.5 2.5 0 0 0-2.5 2.5v13.4A2.5 2.5 0 0 0 7 21.2h10a2.5 2.5 0 0 0 2.5-2.5V8.3z"/><path d="M14 2.8v3.5a2 2 0 0 0 2 2h3.5M12 11.5v5.6m-2.4-2.4 2.4 2.4 2.4-2.4"/>', "M14 2.8H7a2.5 2.5 0 0 0-2.5 2.5v13.4A2.5 2.5 0 0 0 7 21.2h10a2.5 2.5 0 0 0 2.5-2.5V8.3z"),
  folder: ic('<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6a2 2 0 0 1 1.4.6l1.3 1.3a2 2 0 0 0 1.4.6h5.3A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><path d="M3 10.5h18"/>', "M3 10.5h18v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"),
  book: ic('<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5A2.5 2.5 0 0 0 7.5 23H19v-5M9 7.5h6"/>', "M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"),
  scan: ic('<path d="M3.8 8.2V6.3a2.5 2.5 0 0 1 2.5-2.5h1.9M15.8 3.8h1.9a2.5 2.5 0 0 1 2.5 2.5v1.9M20.2 15.8v1.9a2.5 2.5 0 0 1-2.5 2.5h-1.9M8.2 20.2H6.3a2.5 2.5 0 0 1-2.5-2.5v-1.9"/><path d="M8.5 9h7M8.5 12h7M8.5 15h4.5"/>', "M7.5 6.5h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"),
  emoji: ic('<circle cx="12" cy="12" r="9"/><path d="M8.6 14.3a4.3 4.3 0 0 0 6.8 0"/><circle cx="9.2" cy="9.8" r=".9" fill="currentColor"/><circle cx="14.8" cy="9.8" r=".9" fill="currentColor"/>', "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z"),
  image: ic('<rect x="3" y="4.5" width="18" height="15" rx="3.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.6 15.6-4.2-4.2a1.5 1.5 0 0 0-2.1 0L6 19.5"/>', "M6.5 4.5h11A3.5 3.5 0 0 1 21 8v8a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 16V8a3.5 3.5 0 0 1 3.5-3.5z"),
  palm: ic('<path d="M7.2 12.6V6.2a1.5 1.5 0 0 1 3 0v5M10.2 10.6V4.4a1.5 1.5 0 0 1 3 0v6.2M13.2 10.6V5.8a1.5 1.5 0 0 1 3 0v5.6M16.2 11.4V8.6a1.5 1.5 0 0 1 3 0v5.2a7.2 7.2 0 0 1-7.2 7.2h-.7a6.4 6.4 0 0 1-5.1-2.6l-2.6-3.5a1.6 1.6 0 0 1 2.4-2.1l1.2 1.3"/>', "M7.2 12.6V6.2a1.5 1.5 0 0 1 3 0V4.4a1.5 1.5 0 0 1 3 0v1.4a1.5 1.5 0 0 1 3 0v2.8a1.5 1.5 0 0 1 3 0v5.2a7.2 7.2 0 0 1-7.2 7.2h-.7a6.4 6.4 0 0 1-5.1-2.6l-2.6-3.5a1.6 1.6 0 0 1 2.4-2.1l1.2 1.3z"),
  stylus: ic('<path d="M14.6 4.4a2.2 2.2 0 0 1 3.1 0l1.9 1.9a2.2 2.2 0 0 1 0 3.1L9.2 19.8 4 21l1.2-5.2z"/><path d="M12.6 6.4l5 5"/><path d="M19.5 15v4.5M17.3 17.3h4.4"/>', "M14.6 4.4a2.2 2.2 0 0 1 3.1 0l1.9 1.9a2.2 2.2 0 0 1 0 3.1L9.2 19.8 4 21l1.2-5.2z"),
  ruler: ic('<path d="M21 9.2 9.2 21a1.4 1.4 0 0 1-2 0L3 16.8a1.4 1.4 0 0 1 0-2L14.8 3a1.4 1.4 0 0 1 2 0L21 7.2a1.4 1.4 0 0 1 0 2z"/><path d="m7.6 10.6 1.8 1.8M10.6 7.6l1.8 1.8M13.6 4.6l1.8 1.8"/>', "M21 9.2 9.2 21a1.4 1.4 0 0 1-2 0L3 16.8a1.4 1.4 0 0 1 0-2L14.8 3a1.4 1.4 0 0 1 2 0L21 7.2a1.4 1.4 0 0 1 0 2z")
};
const TPL = [["blank", "Blank"], ["lined", "Lined"], ["narrow", "Narrow lined"], ["grid", "Grid"], ["dots", "Dotted"], ["cornell", "Cornell"], ["soap", "SOAP note"], ["ward", "Ward round"], ["todo", "To-do"], ["hx", "History & exam"], ["lecture", "Lecture notes"], ["daily", "Daily planner"], ["week", "Weekly planner"], ["drug", "Drug chart"], ["proc", "Procedure log"], ["split", "Two columns"], ["graph", "Graph paper"]];
const PAPERS = {white: "#ffffff", cream: "#fbf6e8", night: "#1d2230"};
const COVERS = [["#2563eb", "#7c3aed"], ["#0ea5e9", "#2563eb"], ["#10b981", "#0f766e"], ["#f59e0b", "#ea580c"], ["#f43f5e", "#be185d"], ["#8b5cf6", "#6d28d9"], ["#64748b", "#334155"], ["#14b8a6", "#0891b2"], ["#6366f1", "#ec4899"], ["#fb7185", "#f59e0b"], ["#22c55e", "#0ea5e9"], ["#1e293b", "#0f172a"], ["#a16207", "#78350f"], ["#e879f9", "#7c3aed"]];
const FOLDER_ICONS = ["📁", "🫀", "🫁", "🧠", "👶", "🤰", "💊", "🩺", "🚑", "🦴", "🦠", "🧪", "🩻", "📚", "📝", "🎓", "⭐", "🏥"];
const PENS = ["#111827", "#2563eb", "#dc2626", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#be185d"];
const HLS = ["#fde047", "#86efac", "#f9a8d4", "#93c5fd", "#fdba74"];
const STICKERS = "🫀 🫁 🧠 🦷 🦴 👁️ 👂 👃 👅 🩸 🦠 🧬 💊 💉 🩺 🩹 🌡️ 🧪 🔬 🩻 🏥 🚑 ⚕️ 👶 🤰 ✅ ❌ ⚠️ ❗ ❓ ⭐ 📌 ➡️ ⬆️ ⬇️ 🔁 💡 🎯".split(" ");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const PEN = () => Object.assign({palm: true, btn: "eraser", pressure: true, hover: true}, store.get("eluPen2", {}));
const SET = () => Object.assign({tpl: "lined", paper: "white", scroll: "v", smooth: 0.38, outline: true, desk: "grey", tbs: "m", gap: "m", pnum: true, hlsnap: true, hold: true}, store.get("eluSet", {}));

/* ---------- storage ---------- */
const DB = (() => {
  let connection;
  const open = () => connection || (connection = new Promise((resolve, reject) => {
    const request = indexedDB.open("eluna", 1);
    request.onupgradeneeded = () => { const db = request.result; for (const name of ["books", "files"]) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, {keyPath: "id"}); };
    request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); connection = null; }; resolve(db); };
    request.onerror = () => { connection = null; reject(request.error); };
    request.onblocked = () => nbToast("Close other Eluna tabs to finish opening notebook storage.");
  }));
  const tx = async (name, mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(name, mode);
      let request;
      transaction.oncomplete = () => resolve(request && request.result);
      transaction.onabort = transaction.onerror = () => reject(transaction.error || new Error("Notebook storage could not finish. Please retry."));
      try { request = fn(transaction.objectStore(name)); } catch (error) { transaction.abort(); reject(error); }
    });
  };
  return {
    all: s => tx(s, "readonly", o => o.getAll()), get: (s, id) => tx(s, "readonly", o => o.get(id)),
    put: (s, v) => tx(s, "readwrite", o => o.put(v)), del: (s, id) => tx(s, "readwrite", o => o.delete(id)),
    update: (s, id, change) => tx(s, "readwrite", o => { const request = o.get(id); request.onsuccess = () => { if (request.result) { const next = change(request.result); if (next) o.put(next); } }; return request; })
  };
})();
/* A route change waits for this notebook's final write before opening it again. */
const pendingSaves = new Map(), unsavedBooks = new Map();
const newPage = (tpl, paper, extra) => Object.assign({id: uid(), type: "paper", tpl: tpl || SET().tpl, paper: paper || SET().paper, w: PW, h: A4H, strokes: [], imgs: [], texts: []}, extra || {});
/* bring over anything made in the earlier "PDF notes" */
async function migrate() {
  if (store.get("eluMig", false)) return;
  try {
    const old = await nbDB.all();
    for (const b of old || []) {
      if (await DB.get("books", b.id)) continue;
      await DB.put("books", {id: b.id, title: b.title, tags: ["from app"], cover: 1, created: b.created || Date.now(), updated: b.updated || Date.now(), thumb: b.thumb || "", pages: (b.pages || []).map(p => Object.assign(newPage(p.tpl === "blank" ? "blank" : p.tpl, "white"), {id: p.id, bg: p.bg || null, strokes: p.strokes || [], imgs: p.imgs || [], texts: p.texts || []}))});
    }
    store.set("eluMig", true);
  } catch (error) { console.warn("Eluna migration will retry on next open", error); }
}

/* ---------- libraries loaded only when needed (cached for offline use by the service worker) ---------- */
const loadScript = src => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("Could not load " + src.split("/").pop() + " — check the internet connection once; it is then kept offline.")); document.head.appendChild(s); });
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
let pdfP = null; const pdfjs = () => pdfP || (pdfP = loadScript(PDFJS + "pdf.min.js").then(() => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js"; return window.pdfjsLib; }).catch(e => { pdfP = null; throw e; }));
const docs = new Map();
const pdfDoc = fid => { if (!docs.has(fid)) docs.set(fid, (async () => { const lib = await pdfjs(), f = await DB.get("files", fid); if (!f) throw new Error("The PDF file is missing from this device."); return lib.getDocument({data: new Uint8Array(f.bytes)}).promise; })().catch(e => { docs.delete(fid); throw e; })); return docs.get(fid); };
let tessP = null; const tess = () => tessP || (tessP = loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js").then(() => window.Tesseract.createWorker("eng")).catch(e => { tessP = null; throw e; }));

/* ---------- paper ---------- */
function drawPaper(x, pg, s) {
  const night = pg.paper === "night", ln = night ? "rgba(255,255,255,.13)" : "#cfdcec", txt = night ? "rgba(255,255,255,.55)" : "#7b8a99";
  x.save(); x.fillStyle = PAPERS[pg.paper] || "#fff"; x.fillRect(0, 0, pg.w * s, pg.h * s); x.scale(s, s); x.lineWidth = Math.max(1.6, 0.75 / s); x.strokeStyle = ln;
  const H = pg.h, W = pg.w, rule = (y0, gap, x0) => { for (let y = y0; y < H - 60; y += gap) { x.beginPath(); x.moveTo(x0 || 60, y); x.lineTo(W - 60, y); x.stroke(); } };
  const label = (t, X, Y, sz) => { x.fillStyle = txt; x.font = `700 ${sz || 22}px "Source Sans 3",system-ui,sans-serif`; x.textBaseline = "top"; x.fillText(t, X, Y); };
  if (pg.type === "paper") switch (pg.tpl) {
    case "lined": rule(200, 54); x.strokeStyle = night ? "rgba(255,120,120,.35)" : "#f3b4b4"; x.beginPath(); x.moveTo(150, 60); x.lineTo(150, H - 60); x.stroke(); break;
    case "narrow": rule(160, 40); break;
    case "grid": x.strokeStyle = night ? "rgba(255,255,255,.08)" : "#e3e9f1"; for (let g = 40; g < W; g += 40) { x.beginPath(); x.moveTo(g, 0); x.lineTo(g, H); x.stroke(); } for (let g = 40; g < H; g += 40) { x.beginPath(); x.moveTo(0, g); x.lineTo(W, g); x.stroke(); } break;
    case "dots": x.fillStyle = night ? "rgba(255,255,255,.22)" : "#c3cddb"; for (let a = 40; a < W; a += 40) for (let b = 40; b < H; b += 40) { x.beginPath(); x.arc(a, b, 2.2, 0, 7); x.fill(); } break;
    case "cornell": label("Topic / date", 70, 70); x.beginPath(); x.moveTo(60, 170); x.lineTo(W - 60, 170); x.stroke(); x.beginPath(); x.moveTo(340, 170); x.lineTo(340, H - 330); x.stroke(); label("Cues & questions", 72, 190, 18); label("Notes", 360, 190, 18); rule(240, 54, 340); x.beginPath(); x.moveTo(60, H - 320); x.lineTo(W - 60, H - 320); x.stroke(); label("Summary", 72, H - 300, 18); break;
    case "soap": { label("Age · sex · bed / OPD no. · date   (no names or CID)", 70, 60, 20); const sec = [["S", "Subjective — complaint, history"], ["O", "Objective — vitals, exam, results"], ["A", "Assessment — diagnosis, differentials"], ["P", "Plan — treatment, investigations, follow-up"]], h = (H - 140) / 4;
      sec.forEach(([k, t], i) => { const y = 120 + i * h; x.beginPath(); x.moveTo(60, y); x.lineTo(W - 60, y); x.stroke(); x.fillStyle = night ? "rgba(120,170,255,.25)" : "#e8f0fe"; x.beginPath(); x.arc(100, y + 44, 28, 0, 7); x.fill(); label(k, 90, y + 30, 28); label(t, 145, y + 32, 20); for (let yy = y + 110; yy < y + h - 20; yy += 50) { x.strokeStyle = night ? "rgba(255,255,255,.07)" : "#edf1f6"; x.beginPath(); x.moveTo(145, yy); x.lineTo(W - 60, yy); x.stroke(); } x.strokeStyle = ln; }); break; }
    case "ward": { label("Ward round · date ____  · consultant ____", 70, 60, 22); const cols = [70, 200, 640, 1050, W - 60], heads = ["Bed", "Problems / findings", "Plan", "Done"], top = 120, rh = 118;
      x.fillStyle = night ? "rgba(255,255,255,.06)" : "#f1f5fa"; x.fillRect(70, top, W - 130, 50); heads.forEach((h, i) => label(h, cols[i] + 12, top + 14, 20));
      for (let y = top; y <= H - 60; y += (y === top ? 50 : rh)) { x.beginPath(); x.moveTo(70, y); x.lineTo(W - 60, y); x.stroke(); } cols.forEach(c => { x.beginPath(); x.moveTo(c, top); x.lineTo(c, H - 60); x.stroke(); }); break; }
    case "hx": { label("History & examination   (age · sex · bed — no names or CID)", 70, 56, 20); const box = (t, y, h) => { x.fillStyle = night ? "rgba(120,170,255,.12)" : "#eef4fd"; x.fillRect(60, y, W - 120, 40); label(t, 74, y + 10, 19); x.strokeStyle = night ? "rgba(255,255,255,.07)" : "#e6ecf3"; for (let yy = y + 88; yy < y + h - 10; yy += 46) { x.beginPath(); x.moveTo(74, yy); x.lineTo(W - 74, yy); x.stroke(); } x.strokeStyle = ln; };
      [["Presenting complaint", 0.08], ["History of presenting illness", 0.2], ["Past history · drugs · allergies · family / social", 0.13], ["Examination — general · vitals · CVS · RS · abdomen · CNS", 0.24], ["Investigations", 0.1], ["Impression / differentials", 0.1], ["Plan", 0.15]].reduce((y, [t, f]) => { const h = (H - 170) * f; box(t, y, h); return y + h; }, 110); break; }
    case "lecture": { x.fillStyle = night ? "rgba(167,139,250,.16)" : "#f3effe"; x.fillRect(0, 0, W, 150); label("Lecture / topic", 70, 44, 30); label("Date · speaker · source", 70, 92, 18); x.strokeStyle = night ? "rgba(167,139,250,.5)" : "#c4b5fd"; x.lineWidth = 3; x.beginPath(); x.moveTo(300, 190); x.lineTo(300, H - 260); x.stroke(); x.lineWidth = 1.6; x.strokeStyle = ln; label("Key points", 72, 196, 18); rule(240, 50, 320); x.fillStyle = night ? "rgba(255,255,255,.05)" : "#fafaf7"; x.fillRect(60, H - 240, W - 120, 180); label("Summary in three lines", 76, H - 226, 18); break; }
    case "daily": { label(new Date().toLocaleDateString([], {weekday: "long"}) + " · ______", 70, 56, 30); label("Top 3 priorities", 70, 118, 18); for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(92, 172 + i * 50, 11, 0, 7); x.stroke(); x.beginPath(); x.moveTo(118, 182 + i * 50); x.lineTo(W / 2 - 30, 182 + i * 50); x.stroke(); } label("Notes", W / 2 + 10, 118, 18); x.beginPath(); x.moveTo(W / 2, 118); x.lineTo(W / 2, 300); x.stroke();
      for (let h = 7, y = 340; h <= 20; h++, y += (H - 400) / 14) { label(`${h > 12 ? h - 12 : h} ${h >= 12 ? "pm" : "am"}`, 70, y + 6, 17); x.beginPath(); x.moveTo(150, y); x.lineTo(W - 60, y); x.stroke(); } break; }
    case "week": { label("Week of ______", 70, 52, 30); const d = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Notes"], bw = (W - 140) / 2, bh = (H - 160) / 4; d.forEach((n, i) => { const bx = 60 + (i % 2) * (bw + 20), by = 120 + Math.floor(i / 2) * bh; x.beginPath(); x.roundRect ? x.roundRect(bx, by, bw, bh - 18, 18) : x.rect(bx, by, bw, bh - 18); x.stroke(); x.fillStyle = night ? "rgba(255,255,255,.06)" : "#f1f5fa"; x.fillRect(bx + 1, by + 1, 110, 40); label(n, bx + 18, by + 10, 20); }); break; }
    case "drug": case "proc": { const dr = pg.tpl === "drug", heads = dr ? ["Drug", "Dose", "Route", "Freq.", "Start", "Stop / notes"] : ["Date", "Procedure", "Indication", "Supervised?", "Outcome / notes"], cols = dr ? [60, 400, 600, 720, 860, 990, W - 60] : [60, 220, 560, 820, 980, W - 60], top = 120;
      label(dr ? "Drug chart   (check doses against the formulary)" : "Procedure log", 70, 56, 24); x.fillStyle = night ? "rgba(255,255,255,.07)" : "#eef4fd"; x.fillRect(60, top, W - 120, 52); heads.forEach((h, i) => label(h, cols[i] + 12, top + 15, 18));
      for (let y = top; y <= H - 60; y += (y === top ? 52 : 72)) { x.beginPath(); x.moveTo(60, y); x.lineTo(W - 60, y); x.stroke(); } cols.forEach(c => { x.beginPath(); x.moveTo(c, top); x.lineTo(c, H - 60); x.stroke(); }); break; }
    case "split": rule(150, 50); x.beginPath(); x.moveTo(W / 2, 100); x.lineTo(W / 2, H - 60); x.stroke(); break;
    case "graph": x.strokeStyle = night ? "rgba(120,200,255,.08)" : "#e2eef6"; x.lineWidth = 1; for (let g = 20; g < W; g += 20) { x.beginPath(); x.moveTo(g, 0); x.lineTo(g, H); x.stroke(); } for (let g = 20; g < H; g += 20) { x.beginPath(); x.moveTo(0, g); x.lineTo(W, g); x.stroke(); }
      x.strokeStyle = night ? "rgba(120,200,255,.2)" : "#bcd6ea"; x.lineWidth = 1.8; for (let g = 100; g < W; g += 100) { x.beginPath(); x.moveTo(g, 0); x.lineTo(g, H); x.stroke(); } for (let g = 100; g < H; g += 100) { x.beginPath(); x.moveTo(0, g); x.lineTo(W, g); x.stroke(); } break;
    case "todo": label("To-do", 70, 70, 34); for (let y = 170; y < H - 60; y += 64) { x.beginPath(); x.roundRect ? x.roundRect(80, y - 34, 30, 30, 7) : x.rect(80, y - 34, 30, 30); x.stroke(); x.beginPath(); x.moveTo(130, y); x.lineTo(W - 60, y); x.stroke(); } break;
  }
  x.restore();
}

/* ---------- ink (shared by screen and export) ---------- */
function stroke(x, st, s, from) {
  const p = st.p, n = p.length / 3; if (!n) return;
  x.save(); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  if (st.t === "hl" || st.t === "px") {
    if (st.t === "px") { x.globalCompositeOperation = "destination-out"; x.strokeStyle = "#000"; } else { x.globalAlpha = 0.5; x.strokeStyle = st.c; }
    x.lineWidth = st.w; x.beginPath(); x.moveTo(p[0], p[1]);
    for (let i = 1; i < n - 1; i++) x.quadraticCurveTo(p[i * 3], p[i * 3 + 1], (p[i * 3] + p[i * 3 + 3]) / 2, (p[i * 3 + 1] + p[i * 3 + 4]) / 2);
    if (n > 1) x.lineTo(p[(n - 1) * 3], p[(n - 1) * 3 + 1]); else x.lineTo(p[0] + .1, p[1]); x.stroke();
  } else {
    /* pressure, a soft nib-like start and — once the stroke is finished — a matching taper at the end */
    x.strokeStyle = st.c; const W = i => st.w * (0.42 + 0.95 * p[i * 3 + 2]) * Math.min(1, 0.4 + i * 0.15) * (st.e ? Math.min(1, 0.35 + (n - 1 - i) * 0.16) : 1);
    if (n === 1 && !from) { x.fillStyle = st.c; x.beginPath(); x.arc(p[0], p[1], W(0) / 2, 0, 7); x.fill(); }
    for (let i = Math.max(2, from || 2); i < n; i++) { x.lineWidth = (W(i - 1) + W(i)) / 2; x.beginPath(); x.moveTo(i === 2 ? p[0] : (p[i * 3 - 6] + p[i * 3 - 3]) / 2, i === 2 ? p[1] : (p[i * 3 - 5] + p[i * 3 - 2]) / 2); x.quadraticCurveTo(p[i * 3 - 3], p[i * 3 - 2], (p[i * 3 - 3] + p[i * 3]) / 2, (p[i * 3 - 2] + p[i * 3 + 1]) / 2); x.stroke(); }
    if (!from && n === 2) { x.lineWidth = (W(0) + W(1)) / 2; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[3], p[4]); x.stroke(); }
    if (!from && n >= 3) { x.lineWidth = W(n - 1); x.beginPath(); x.moveTo((p[(n - 2) * 3] + p[(n - 1) * 3]) / 2, (p[(n - 2) * 3 + 1] + p[(n - 1) * 3 + 1]) / 2); x.lineTo(p[(n - 1) * 3], p[(n - 1) * 3 + 1]); x.stroke(); }
  }
  x.restore();
}
const IMGS = new Map(); const img = src => { let i = IMGS.get(src); if (!i) { i = new Image(); i.src = src; IMGS.set(src, i); } return i; };
const ready = srcs => Promise.all(srcs.filter(Boolean).map(s => { const i = img(s); return i.complete ? 0 : new Promise(r => { const done = () => { i.removeEventListener("load", done); i.removeEventListener("error", done); r(); }; i.addEventListener("load", done, {once:true}); i.addEventListener("error", done, {once:true}); }); }));
function drawInk(x, pg, s) { x.clearRect(0, 0, x.canvas.width, x.canvas.height); pg.imgs.forEach(o => { const i = img(o.src); if (i.complete && i.naturalWidth) x.drawImage(i, o.x * s, o.y * s, o.w * s, o.h * s); }); pg.strokes.forEach(st => stroke(x, st, s)); }
const FONT = '"Source Sans 3","Segoe UI",system-ui,-apple-system,Arial,sans-serif';
function wrapText(x, t, w) { const out = []; String(t).split("\n").forEach(par => { let l = ""; par.split(/\s+/).forEach(wd => { const tl = l ? l + " " + wd : wd; if (x.measureText(tl).width > w && l) { out.push(l); l = wd; } else l = tl; }); out.push(l); }); return out; }
function drawTexts(x, pg, s) { pg.texts.forEach(t => { x.save(); x.scale(s, s); x.font = `${t.b ? 700 : 400} ${t.size || 30}px ${t.emoji ? "system-ui" : FONT}`; x.fillStyle = t.c || "#111827"; x.textBaseline = "top"; wrapText(x, t.t || "", t.w).forEach((l, i) => x.fillText(l, t.x + 8, t.y + 8 + i * (t.size || 30) * 1.3)); x.restore(); }); }
/* base layer: paper, an app page image, or a PDF page */
async function drawBase(x, pg, s, task) {
  drawPaper(x, pg, s);
  if (pg.bg) { await ready([pg.bg]); const i = img(pg.bg); x.imageSmoothingQuality = "high"; if (i.naturalWidth) x.drawImage(i, 0, 0, pg.w * s, pg.h * s); }
  if (pg.type === "pdf") { const d = await pdfDoc(pg.fid), page = await d.getPage(pg.pi + 1), vp1 = page.getViewport({scale: 1}), vp = page.getViewport({scale: pg.w * s / vp1.width});
    const t = page.render({canvasContext: x, viewport: vp}); if (task) task.t = t; await t.promise; }
}
/* a whole page as one image (for export and thumbnails) */
async function pageImage(pg, s) {
  const cv = document.createElement("canvas"); cv.width = Math.round(pg.w * s); cv.height = Math.round(pg.h * s); const x = cv.getContext("2d");
  await drawBase(x, pg, s); await ready(pg.imgs.map(i => i.src));
  const ink = document.createElement("canvas"); ink.width = cv.width; ink.height = cv.height; drawInk(ink.getContext("2d"), pg, s);
  x.globalCompositeOperation = pg.paper === "night" ? "source-over" : "multiply"; x.drawImage(ink, 0, 0); x.globalCompositeOperation = "source-over"; drawTexts(x, pg, s);
  return cv;
}

/* ---------- library ---------- */
E.mount = async (v, arg) => {
  await Promise.allSettled([...pendingSaves.values()]);
  await migrate();
  if (arg) return editor(v, arg);
  return library(v);
};
const coverHTML = b => { const c = COVERS[(b.cover || 0) % COVERS.length], isPdf = b.pages.some(p => p.type === "pdf");
  return `<div class="elcov" style="--a:${c[0]};--b:${c[1]}">${b.thumb ? `<img src="${b.thumb}" alt="">` : `<span class="elcovic">${isPdf ? I.pdf : I.book}</span>`}<i class="elspine"></i>${isPdf ? `<em>PDF</em>` : ""}</div>`; };
/* folders live in local storage: [{id, name, c}]; a book keeps the id of its folder in b.folder */
const FOLD = () => store.get("eluFolders", []), saveFold = f => store.set("eluFolders", f);
let curF = "", CLIP = null;   /* CLIP: what was copied with the lasso — pastes into any page of any notebook */
const folderSheet = (fo, done) => { const sh = sheet(`<h3>${fo ? "Folder" : "New folder"}</h3><input class="psname" id="fo_n" maxlength="60" placeholder="Folder name (e.g. Paediatrics, Exam PDFs)" value="${fo ? esc(fo.name) : ""}">
    <div class="elcovs">${COVERS.map((c, i) => `<button class="elcv${i === (fo ? fo.c : 0) ? " on" : ""}" data-cov="${i}" style="--a:${c[0]};--b:${c[1]}" aria-label="Folder colour"></button>`).join("")}</div>
    <div class="small muted">Icon</div><div class="elfics">${FOLDER_ICONS.map(e => `<button class="${e === ((fo && fo.e) || "📁") ? "on" : ""}" data-fe="${e}">${e}</button>`).join("")}</div>
    <div class="btnrow"><button class="btn" id="fo_go">${fo ? "Save" : "Create folder"}</button>${fo ? `<button class="btn btn-danger" id="fo_del">Delete folder</button>` : ""}</div>${fo ? `<div class="small muted">Deleting a folder keeps its notebooks and PDFs — they move back to the main shelf.</div>` : ""}`);
  let c = fo ? fo.c : 0; $$("[data-cov]", sh).forEach(x => x.onclick = () => { c = +x.dataset.cov; $$("[data-cov]", sh).forEach(y => y.classList.toggle("on", y === x)); });
  let em = (fo && fo.e) || "📁"; $$("[data-fe]", sh).forEach(x => x.onclick = () => { em = x.dataset.fe; $$("[data-fe]", sh).forEach(y => y.classList.toggle("on", y === x)); });
  const nm = $("#fo_n", sh); setTimeout(() => nm.focus(), 50);
  $("#fo_go", sh).onclick = () => { const name = nm.value.trim(); if (!name) return nm.focus(); const all = FOLD(); if (fo) Object.assign(all.find(x => x.id === fo.id) || {}, {name, c, e: em}); else all.push({id: uid(), name, c, e: em}); saveFold(all); sh.remove(); done(); };
  const del = $("#fo_del", sh); if (del) del.onclick = async () => { if (!del.dataset.arm) { del.dataset.arm = 1; del.textContent = "Tap again to delete"; return; }
    for (const b of await DB.all("books")) if (b.folder === fo.id) { delete b.folder; await DB.put("books", b); }
    saveFold(FOLD().filter(x => x.id !== fo.id)); if (curF === fo.id) curF = ""; sh.remove(); done(); }; };
async function library(v) {
  const stored = (await DB.all("books")) || [], books = [...new Map([...stored, ...unsavedBooks.values()].map(book => [book.id, book])).values()], folders = FOLD(); let q = "", tag = "";
  if (curF && !folders.some(f => f.id === curF)) curF = "";
  const fo = folders.find(f => f.id === curF), inF = b => curF ? b.folder === curF : !folders.some(f => f.id === b.folder);
  const tags = [...new Set(books.filter(inF).flatMap(b => b.tags || []))].sort();
  v.innerHTML = `<div class="elib"><div class="elhead"><a class="iconbtn elhome" href="#home" aria-label="Home" title="Home">${ICON.home}</a><div class="ellogo">${I.book}</div><div><h1 class="vt">Eluna</h1><p>Notebooks and PDFs — write, highlight and read together. Saved on this device.</p></div><button class="iconbtn" id="el_set" aria-label="Eluna settings">${I.gear}</button></div>
    <button class="elfab" id="el_plus" aria-label="New notebook, folder or PDF">${I.plus}<span>New</span></button><div class="elacts" hidden><button class="btn" id="el_new">${I.plus} New notebook</button><button class="btn btn-ghost" id="el_imp">${I.pdf} Import PDFs</button><button class="btn btn-ghost" id="el_app">📚 From the app</button><input type="file" id="el_file" accept="application/pdf,.pdf" multiple hidden></div>
    ${(() => { const open = store.get("eluTabs", []).map(t => books.find(b => b.id === t)).filter(Boolean).slice(0, 6); return open.length ? `<div class="elcont"><span>Continue</span>${open.map(b => `<a href="#eluna/${b.id}" class="elchip"><i>${b.pages.some(p => p.type === "pdf") ? I.pdf : I.book}</i>${esc(b.title)}</a>`).join("")}</div>` : ""; })()}
    ${fo ? `<div class="elfhead" style="--a:${COVERS[fo.c % COVERS.length][0]};--b:${COVERS[fo.c % COVERS.length][1]}"><button class="iconbtn" id="el_up" aria-label="Back to all folders">${I.back}</button><i class="elfic">${fo.e && fo.e !== "📁" ? `<span class="elfe">${fo.e}</span>` : I.folder}</i><div><b>${esc(fo.name)}</b><small>${books.filter(inF).length} item${books.filter(inF).length === 1 ? "" : "s"}</small></div><button class="iconbtn" id="el_fedit" aria-label="Rename or delete folder">${I.more}</button></div>`
      : !folders.length ? "" : `<div class="elsec"><b>Folders</b></div><div class="elfolds">${folders.map((f, i) => { const n = books.filter(b => b.folder === f.id).length, c = COVERS[f.c % COVERS.length]; return `<button class="elfold" data-f="${f.id}" style="--a:${c[0]};--b:${c[1]};--d:${i * 30}ms"><i class="elfic">${f.e && f.e !== "📁" ? `<span class="elfe">${f.e}</span>` : I.folder}</i><b>${esc(f.name)}</b><small>${n} item${n === 1 ? "" : "s"}</small></button>`; }).join("")}</div>`}
    <div class="pssearch">${ICON.search}<input id="el_q" type="search" placeholder="${fo ? "Search in " + esc(fo.name) : "Search all notebooks and PDFs"}" autocomplete="off"></div>
    ${fo ? "" : `<div class="elsec"><b>On the shelf</b></div>`}
    ${tags.length ? `<div class="eltags" id="el_tags"><button class="chip on" data-t="">All</button>${tags.map(t => `<button class="chip" data-t="${esc(t)}">#${esc(t)}</button>`).join("")}</div>` : ""}
    <div class="elgrid" id="el_grid"></div><div id="el_msg" class="small"></div></div>`;
  const grid = $("#el_grid");
  const draw = () => { const bs = books.filter(b => (q ? true : inF(b)) && (!q || b.title.toLowerCase().includes(q)) && (!q || !curF || b.folder === curF) && (!tag || (b.tags || []).includes(tag))).sort((a, b) => b.updated - a.updated);
    grid.innerHTML = bs.length ? bs.map((b, i) => `<div class="elcard" style="--d:${Math.min(i, 12) * 35}ms"><a href="#eluna/${b.id}">${coverHTML(b)}<b>${esc(b.title)}</b><small>${b.pages.length} page${b.pages.length > 1 ? "s" : ""}${(b.tags || []).length ? " · " + b.tags.map(t => "#" + esc(t)).join(" ") : ""}</small></a><button class="iconbtn elcm" data-m="${b.id}" aria-label="Options">${I.more}</button></div>`).join("")
      : `<div class="cempty"><b>${q || tag ? "Nothing matches" : fo ? "This folder is empty" : "Your shelf is empty"}</b><span>${fo ? "Import PDFs or create a notebook here — or move one in from its ⋮ menu." : "Create a notebook, import PDFs, or open a topic from the app."}</span></div>`;
    $$("[data-m]", grid).forEach(bt => bt.onclick = () => bookMenu(books.find(b => b.id === bt.dataset.m), () => library(v))); };
  draw();
  $("#el_q").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); draw(); });
  $$("#el_tags .chip").forEach(c => c.onclick = () => { tag = c.dataset.t; $$("#el_tags .chip").forEach(x => x.classList.toggle("on", x === c)); draw(); });
  $$("[data-f]").forEach(x => x.onclick = () => { curF = x.dataset.f; library(v); scrollTo(0, 0); });
  if ($("#el_fnew")) $("#el_fnew").onclick = () => folderSheet(null, () => library(v));
  if ($("#el_up")) $("#el_up").onclick = () => { curF = ""; library(v); };
  if ($("#el_fedit")) $("#el_fedit").onclick = () => folderSheet(fo, () => library(v));
  $("#el_new").onclick = () => newBookSheet(curF);
  $("#el_plus").onclick = () => { const sh = sheet(`<h3>Create</h3><div class="elnewm">
      <button data-n="nb"><i style="--a:#6366f1;--b:#a855f7">${I.book}</i><b>New notebook</b><small>Blank, lined, SOAP, ward round, planners…</small></button>
      <button data-n="fo"><i style="--a:#f59e0b;--b:#ea580c">${I.folder}</i><b>New folder</b><small>Keep PDFs and notes together</small></button>
      <button data-n="pdf"><i style="--a:#f43f5e;--b:#be185d">${I.pdf}</i><b>Import PDFs</b><small>One or many, from Files or Downloads</small></button>
      <button data-n="app"><i style="--a:#10b981;--b:#0f766e">${I.scan}</i><b>From the app</b><small>A topic or guideline as a notebook</small></button></div>${fo ? `<div class="small muted">New items go into “${esc(fo.name)}”.</div>` : ""}`);
    $$("[data-n]", sh).forEach(b => b.onclick = () => { sh.remove(); ({nb: () => newBookSheet(curF), fo: () => folderSheet(null, () => library(v)), pdf: () => $("#el_file").click(), app: () => $("#el_app").click()})[b.dataset.n](); }); };
  $("#el_imp").onclick = () => $("#el_file").click();
  $("#el_file").onchange = async e => { const fs = [...e.target.files]; e.target.value = ""; if (!fs.length) return; const ids = await importPdfs(fs, null, t => $("#el_msg").textContent = t, curF); if (ids.length) { const tabs = [...new Set([...ids, ...store.get("eluTabs", [])])].slice(0, 8); store.set("eluTabs", tabs); go("#eluna/" + ids[0]); } };
  $("#el_app").onclick = () => appShareSheet(async h => { try { if (h[2].startsWith("#topic/")) { const t = TOPIC_BY[h[2].slice(7)]; return E.fromBlocks(topicBlocks(t), t.n); }
    const m = h[2].match(/^#gl\/([^/]+)(?:\/(\d+))?$/); if (m) { const b = GL_BY[m[1]], i = +(m[2] || 0), d = document.createElement("div"); d.innerHTML = glRender(glSecs(m[1])[i] || [], b.u, 0); const ti = (b.toc[i] || [b.s])[0]; return E.fromBlocks(domBlocks(d, ti), ti, b.s); }
    nbToast("Choose a topic, guideline or criteria page."); } catch (er) { nbToast(er.message || String(er)); } });
  $("#el_set").onclick = () => settingsSheet();
}
async function importPdfs(files, intoBook, msg, folder) {
  const ids = []; let lib;
  try { lib = await pdfjs(); } catch (e) { nbToast(e.message); return ids; }
  for (const f of files) {
    try { msg && msg(`Opening “${f.name}”…`); const bytes = await f.arrayBuffer(), fid = uid(); await DB.put("files", {id: fid, name: f.name, bytes, ocr: {}});
      const d = await lib.getDocument({data: new Uint8Array(bytes.slice(0))}).promise, pages = [];
      for (let i = 0; i < d.numPages; i++) { const vp = (await d.getPage(i + 1)).getViewport({scale: 1}); pages.push(newPage("blank", "white", {type: "pdf", fid, pi: i, w: PW, h: Math.round(PW * vp.height / vp.width)})); }
      if (intoBook) { intoBook.pages.push(...pages); continue; }
      const b = {id: uid(), title: f.name.replace(/\.pdf$/i, "").slice(0, 80), tags: ["pdf"], cover: ids.length + 1, created: Date.now(), updated: Date.now(), pages}; if (folder) b.folder = folder;
      await DB.put("books", b); ids.push(b.id); thumbFor(b);
    } catch (e) { nbToast(`Could not open “${f.name}”: ${e.message || e}`); }
  }
  msg && msg(""); return ids;
}
async function thumbFor(b) {
  try {
    const revision = b.updated, first = b.pages[0]; if (!first) return;
    const cv = await pageImage(first, 0.2), thumb = cv.toDataURL("image/jpeg", 0.75);
    await DB.update("books", b.id, latest => latest.updated === revision && latest.pages[0] && latest.pages[0].id === first.id ? Object.assign(latest, {thumb}) : null);
  } catch (e) { /* Thumbnails are optional; a failed preview never overwrites notebook contents. */ }
}
E.fromBlocks = async (blocks, title, label) => { nbToast("Preparing pages…"); const imgs = await nbRenderDoc(blocks, label || title);
  const b = {id: uid(), title, tags: ["from app"], cover: 2, created: Date.now(), updated: Date.now(), pages: imgs.map(src => newPage("blank", "white", {bg: src}))};
  await DB.put("books", b); thumbFor(b); store.set("eluTabs", [b.id, ...store.get("eluTabs", []).filter(x => x !== b.id)].slice(0, 8)); go("#eluna/" + b.id); };
function tplPicker(cur, paper) { return `<div class="eltpls">${TPL.map(([k, l]) => `<button class="eltpl${k === cur ? " on" : ""}" data-tpl="${k}"><canvas width="168" height="238" data-cv="${k}"></canvas><b>${l}</b></button>`).join("")}</div>
  <div class="elpapers">${Object.keys(PAPERS).map(p => `<button class="elpap${p === paper ? " on" : ""}" data-pap="${p}" style="--p:${PAPERS[p]}" aria-label="${p} paper"></button>`).join("")}</div>`; }
function paintTpls(root, paper) { $$("[data-cv]", root).forEach(c => drawPaper(c.getContext("2d"), {type: "paper", tpl: c.dataset.cv, paper, w: PW, h: A4H}, 168 / PW)); }
function newBookSheet(folder) {
  const st = SET(); let tpl = st.tpl, paper = st.paper, cover = 0;
  const sh = sheet(`<h3>New notebook</h3><input class="psname" id="nb_t" maxlength="80" placeholder="Title" value="Notes ${new Date().toLocaleDateString([], {day: "numeric", month: "short"})}">
    <div class="elcovs">${COVERS.map((c, i) => `<button class="elcv${i ? "" : " on"}" data-cov="${i}" style="--a:${c[0]};--b:${c[1]}" aria-label="Cover colour"></button>`).join("")}</div>
    ${FOLD().length ? `<div class="small muted">Folder</div><select class="psname" id="nb_f"><option value="">— Main shelf —</option>${FOLD().map(x => `<option value="${x.id}"${x.id === folder ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select>` : ""}
    <div class="small muted">Paper</div>${tplPicker(tpl, paper)}<input class="psname" id="nb_tags" placeholder="Tags (e.g. paeds, exam) — separate with commas"><div class="btnrow"><button class="btn" id="nb_go">Create</button></div>`);
  paintTpls(sh, paper);
  $$("[data-cov]", sh).forEach(b => b.onclick = () => { cover = +b.dataset.cov; $$("[data-cov]", sh).forEach(x => x.classList.toggle("on", x === b)); });
  $$("[data-tpl]", sh).forEach(b => b.onclick = () => { tpl = b.dataset.tpl; $$("[data-tpl]", sh).forEach(x => x.classList.toggle("on", x === b)); });
  $$("[data-pap]", sh).forEach(b => b.onclick = () => { paper = b.dataset.pap; $$("[data-pap]", sh).forEach(x => x.classList.toggle("on", x === b)); paintTpls(sh, paper); });
  $("#nb_go", sh).onclick = async () => { const b = {id: uid(), title: $("#nb_t", sh).value.trim() || "Notes", tags: $("#nb_tags", sh).value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 8), cover, created: Date.now(), updated: Date.now(), pages: [newPage(tpl, paper)]}; const fsel = $("#nb_f", sh), fid = fsel ? fsel.value : folder; if (fid) b.folder = fid;
    await DB.put("books", b); sh.remove(); store.set("eluTabs", [b.id, ...store.get("eluTabs", [])].slice(0, 8)); go("#eluna/" + b.id); };
}
function sheet(html) { const sh = document.createElement("div"); sh.className = "sheet elsheet"; sh.innerHTML = `<div class="sheetin"><button class="iconbtn elsx" aria-label="Close">${I.x}</button>${html}</div>`; document.body.appendChild(sh); sh.querySelector(".elsx").onclick = () => sh.remove(); sh.addEventListener("click", e => { if (e.target === sh) sh.remove(); }); return sh; }
function bookMenu(b, reload) {
  const sh = sheet(`<h3>${esc(b.title)}</h3><input class="psname" id="bm_t" maxlength="80" value="${esc(b.title)}"><input class="psname" id="bm_tags" value="${esc((b.tags || []).join(", "))}" placeholder="Tags, separated by commas">
    <div class="elcovs">${COVERS.map((c, i) => `<button class="elcv${i === (b.cover || 0) % COVERS.length ? " on" : ""}" data-cov="${i}" style="--a:${c[0]};--b:${c[1]}"></button>`).join("")}</div>
    <div class="small muted">Folder</div><select class="psname" id="bm_f"><option value="">— Main shelf —</option>${FOLD().map(x => `<option value="${x.id}"${x.id === b.folder ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select>
    <div class="btnrow" style="flex-wrap:wrap"><button class="btn" id="bm_save">Save</button><button class="btn btn-ghost" id="bm_pdf">${I.pdf} Export PDF</button><button class="btn btn-ghost" id="bm_dup">Duplicate</button><button class="btn btn-danger" id="bm_del">Delete</button></div><div class="small" id="bm_m"></div>`);
  let cover = b.cover || 0; $$("[data-cov]", sh).forEach(x => x.onclick = () => { cover = +x.dataset.cov; $$("[data-cov]", sh).forEach(y => y.classList.toggle("on", y === x)); });
  $("#bm_save", sh).onclick = async () => { b.title = $("#bm_t", sh).value.trim() || b.title; b.tags = $("#bm_tags", sh).value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 8); b.cover = cover; const nf = $("#bm_f", sh).value; if (nf) b.folder = nf; else delete b.folder; b.updated = Date.now(); await DB.put("books", b); sh.remove(); reload(); };
  $("#bm_pdf", sh).onclick = () => exportPdf(b, t => $("#bm_m", sh).textContent = t);
  $("#bm_dup", sh).onclick = async () => { const c = JSON.parse(JSON.stringify(b)); c.id = uid(); c.title += " (copy)"; c.created = c.updated = Date.now(); await DB.put("books", c); sh.remove(); reload(); };
  const del = $("#bm_del", sh); del.onclick = async () => { if (!del.dataset.arm) { del.dataset.arm = 1; del.textContent = "Tap again to delete"; return; } await DB.del("books", b.id); store.set("eluTabs", store.get("eluTabs", []).filter(x => x !== b.id)); sh.remove(); reload(); };
}
async function exportPdf(b, msg) {
  try { const out = []; for (let i = 0; i < b.pages.length; i++) { msg && msg(`Making the PDF… ${i + 1} of ${b.pages.length}`); const cv = await pageImage(b.pages[i], XR); out.push({w: cv.width, h: cv.height, bytes: await nbJpeg(cv)}); }
    const blob = nbPdf(out), r = await nbSharePdf(blob, b.title); msg && msg(r === "saved" ? "PDF saved — check Downloads / Files." : r === "shared" ? "PDF ready." : ""); }
  catch (e) { msg && msg("PDF failed: " + (e.message || e)); }
}
function settingsSheet(onChange) {
  const s = SET();
  const sh = sheet(`<h3>${I.gear} Eluna settings</h3>
    <div class="setrow"><div><b>New page paper</b><span>Template and colour for new notebooks and pages</span></div></div>${tplPicker(s.tpl, s.paper)}
    <div class="setrow"><div><b>Page scrolling</b><span>Read top to bottom, or left to right like a book</span></div><div class="setctl">${segCtl("es_scroll", [["v", "Vertical"], ["h", "Left–right"]], s.scroll)}</div></div>
    <div class="setrow"><div><b>Pen smoothing</b><span>More smoothing steadies shaky lines</span></div><div class="setctl">${segCtl("es_sm", [["0.2", "Light"], ["0.38", "Medium"], ["0.55", "Strong"]], String(s.smooth))}</div></div>
    <div class="setrow"><div><b>Page outline</b><span>Show page thumbnails at the side</span></div><div class="setctl">${segCtl("es_ol", [["1", "Show"], ["0", "Hide"]], s.outline ? "1" : "0")}</div></div>
    <div class="setrow"><div><b>Palm rejection</b><span>On: only the Apple Pencil / S Pen writes, so your hand can rest on the screen. Off: fingers write too.</span></div><div class="setctl">${segCtl("es_palm", [["1", "On"], ["0", "Off"]], store.get("nbPencil", false) ? "1" : "0")}</div></div>
    <div class="setrow"><div><b>Desk colour</b><span>The background around the pages</span></div><div class="setctl">${segCtl("es_desk", [["grey", "Grey"], ["warm", "Warm"], ["lav", "Lilac"], ["dark", "Dark"]], s.desk)}</div></div>
    <div class="setrow"><div><b>Toolbar size</b><span>Bigger buttons are easier with a finger</span></div><div class="setctl">${segCtl("es_tbs", [["s", "Compact"], ["m", "Normal"], ["l", "Large"]], s.tbs)}</div></div>
    <div class="setrow"><div><b>Space between pages</b><span></span></div><div class="setctl">${segCtl("es_gap", [["s", "Tight"], ["m", "Normal"], ["l", "Roomy"]], s.gap)}</div></div>
    <div class="setrow"><div><b>Page numbers</b><span>Small numbers under each page</span></div><div class="setctl">${segCtl("es_pn", [["1", "Show"], ["0", "Hide"]], s.pnum ? "1" : "0")}</div></div>
    <div class="setrow"><div><b>Straighten highlighter</b><span>Straight strokes snap neatly onto the line of text</span></div><div class="setctl">${segCtl("es_hs", [["1", "On"], ["0", "Off"]], s.hlsnap ? "1" : "0")}</div></div>
    <div class="setrow"><div><b>Hold to select words</b><span>Press and hold on PDF text with any tool, then slide to select more</span></div><div class="setctl">${segCtl("es_hold", [["1", "On"], ["0", "Off"]], s.hold ? "1" : "0")}</div></div>
    <div class="setrow"><div><b>Toolbar position</b><span>Put the floating toolbar back at the top</span></div><div class="setctl"><button class="btn btn-ghost" id="es_tb">Reset</button></div></div>`);
  const put = (k, val) => { const n = SET(); n[k] = val; store.set("eluSet", n); onChange && onChange(); };
  paintTpls(sh, s.paper);
  $$("[data-tpl]", sh).forEach(b => b.onclick = () => { put("tpl", b.dataset.tpl); $$("[data-tpl]", sh).forEach(x => x.classList.toggle("on", x === b)); });
  $$("[data-pap]", sh).forEach(b => b.onclick = () => { put("paper", b.dataset.pap); $$("[data-pap]", sh).forEach(x => x.classList.toggle("on", x === b)); paintTpls(sh, b.dataset.pap); });
  const seg2 = (id, k, conv) => $$("#" + id + " button", sh).forEach(b => b.onclick = () => { $$("#" + id + " button", sh).forEach(x => x.setAttribute("aria-pressed", x === b)); put(k, conv(b.dataset.v)); });
  seg2("es_scroll", "scroll", v => v); seg2("es_sm", "smooth", v => +v); seg2("es_ol", "outline", v => v === "1");
  $$("#es_palm button", sh).forEach(b => b.onclick = () => { $$("#es_palm button", sh).forEach(x => x.setAttribute("aria-pressed", x === b)); const on = b.dataset.v === "1", n = PEN(); store.set("nbPencil", on); n.palm = on; store.set("eluPen2", n); onChange && onChange(); });
  seg2("es_desk", "desk", v => v); seg2("es_tbs", "tbs", v => v); seg2("es_gap", "gap", v => v); seg2("es_pn", "pnum", v => v === "1"); seg2("es_hs", "hlsnap", v => v === "1"); seg2("es_hold", "hold", v => v === "1");
  $("#es_tb", sh).onclick = () => { store.set("eluTb", null); onChange && onChange(); nbToast("Toolbar moved back to the top."); };
}

/* ---------- editor ---------- */
async function editor(v, id) {
  const book = unsavedBooks.get(id) || await DB.get("books", id);
  if (!book) { v.innerHTML = `<div class="card">This notebook is not on this device. <a href="#eluna">Back to Eluna</a></div>`; return; }
  let tabs = store.get("eluTabs", []); if (!tabs.includes(id)) tabs = [id, ...tabs].slice(0, 8); store.set("eluTabs", tabs);
  const allB = await DB.all("books"), metas = allB.reduce((m, b) => (m[b.id] = b.title, m), {}), kinds = allB.reduce((m, b) => (m[b.id] = b.pages.some(p => p.type === "pdf"), m), {});
  tabs = tabs.filter(t => metas[t]); store.set("eluTabs", tabs);
  const st = SET(), S = {tool: store.get("eluTool", "pen"), sub: Object.assign({eraser: "stroke", lasso: "free", laser: "line"}, store.get("eluSub", {})), pen: store.get("eluPen", PENS[0]), hl: store.get("eluHl", HLS[0]), size: store.get("eluSize", 3), zoom: 1, ro: false, pencil: store.get("nbPencil", false), penDown: false, ruler: null, sel: null, emoji: null};
  const tool = (k, l) => `<button class="eltb-b" data-tool="${k}" aria-label="${l}" title="${l}">${I[k]}</button>`;
  v.innerHTML = `<div class="elw" id="elw">
    <div class="eltop"><button class="iconbtn chb" onclick="goBack()" aria-label="Back to previous screen" title="Back to previous screen">${I.back}</button><a class="iconbtn chb" href="#eluna" aria-label="Eluna library" title="All notebooks">${I.book}</a><a class="iconbtn chb elhm" href="#home" aria-label="Home" title="Home">${ICON.home}</a><div class="eltabs" id="el_tabs">${tabs.map(t => `<div class="eltab${t === id ? " on" : ""}"><a href="#eluna/${t}"><i class="eltabi">${kinds[t] ? I.pdf : I.book}</i>${esc(metas[t])}</a><button data-close="${t}" aria-label="Close tab">${I.x}</button></div>`).join("")}<button class="eltabadd" id="el_tabadd" aria-label="Open another notebook">${I.plus}</button></div>
      <button class="iconbtn chb" id="el_ro" aria-label="Read-only mode" title="Read-only mode">${I.read}</button><button class="iconbtn chb" id="el_side" aria-label="Page outline" title="Page outline">${I.side}</button><button class="iconbtn chb" id="el_more" aria-label="More">${I.more}</button></div>
    <div class="elbody"><aside class="elol" id="el_ol"${st.outline ? "" : " hidden"}><div class="elolh"><b>Pages</b><button class="iconbtn" id="el_addp2" aria-label="Add page">${I.plus}</button></div><div class="elolist" id="el_olist"></div></aside>
      <div class="elscroll${st.scroll === "h" ? " horiz" : ""}" id="el_scroll"><div class="elpages" id="el_pages"></div></div>
      <canvas class="elfx" id="el_fx"></canvas><div class="elruler" id="el_ruler" hidden><div class="elrn">${Array.from({length: 13}, (_, k) => `<b style="left:${k * 50}px">${k}</b>`).join("")}</div><em class="elrdeg" id="el_rdeg">0°</em><i></i><span>drag · two fingers or the handle to turn</span></div><div class="elselbox" id="el_sel" hidden><i class="h" data-c="br"></i><i class="h" data-c="bl"></i><i class="h" data-c="tr"></i><i class="h" data-c="tl"></i><div class="elselbar"><button data-a="shot" class="elshotb">📸 Screenshot</button><button data-a="copy">Copy</button><button data-a="cut">Cut</button><button data-a="dup">Duplicate</button><button data-a="crop">Crop</button><button data-a="rot">Rotate</button><button data-a="col">Colour</button><button data-a="del">Delete</button></div></div>
      <div class="eltb" id="el_tb"><span class="eltb-grip" id="el_grip">${I.grip}</span>${tool("pen", "Pen")}${tool("hl", "Highlighter")}${tool("eraser", "Eraser")}${tool("lasso", "Lasso")}${tool("laser", "Laser pointer")}${tool("text", "Text box")}${tool("select", "Select text in PDFs")}<span class="eltb-sep"></span><button class="eltb-b" id="el_emo" aria-label="Medical stickers" title="Medical stickers">${I.emoji}</button><button class="eltb-b" id="el_img" aria-label="Insert photo" title="Insert photo">${I.image}</button><button class="eltb-b" id="el_rul" aria-label="Ruler" title="Ruler">${I.ruler}</button><button class="eltb-b" id="el_palm" aria-label="Palm rejection" title="Palm rejection — only the pen writes">${I.palm}</button><button class="eltb-b" id="el_sty" aria-label="Apple Pencil and S Pen" title="Apple Pencil & S Pen">${I.stylus}</button><span class="eltb-sep"></span><button class="eltb-c" id="el_col" aria-label="Colour and size"><i></i></button><button class="eltb-b" id="el_undo" aria-label="Undo">${I.undo}</button><button class="eltb-b" id="el_redo" aria-label="Redo">${I.redo}</button><button class="eltb-b eltb-mini" id="el_mini" aria-label="Fold toolbar" title="Fold toolbar">${I.fold}</button><input type="file" id="el_imgf" accept="image/*" hidden><input type="file" id="el_pdff" accept="application/pdf,.pdf" multiple hidden></div>
      <div class="elpop" id="el_pop" hidden></div><button class="elpaste" id="el_paste" hidden></button><button class="ellzc" id="el_lzc" hidden>✕ Clear laser</button>
      <button class="elsavestatus" id="el_save" type="button" aria-live="polite" title="Notes are stored on this device">Saved on device</button><div class="elnav"><button id="el_zo" aria-label="Zoom out">−</button><span id="el_zv">100%</span><button id="el_zi" aria-label="Zoom in">+</button><span class="elnsep"></span><input id="el_pg" inputmode="numeric" aria-label="Go to page"><span id="el_pn">/ 1</span></div>
      <div class="elro" id="el_robadge" hidden>${I.read} Read-only · <button class="lnk" id="el_edit">Edit</button></div></div></div>`;
  const W = $("#elw"), scroll = $("#el_scroll"), wrap = $("#el_pages"), fx = $("#el_fx"), dpr = () => Math.min(window.devicePixelRatio || 1, 2.5);
  let pages = [], undo = [], redo = [], saveT = 0, cur = null;
  const horiz = () => SET().scroll === "h";
  const baseW = () => horiz() ? Math.max(260, (scroll.clientHeight - 48) * PW / A4H) : Math.min(scroll.clientWidth - 28, 1000);
  const pw = () => Math.round(baseW() * S.zoom), sc = () => pw() / PW;
  /* ---- save ---- */
  let revision = unsavedBooks.has(id) ? 1 : 0, writtenRevision = 0, saving = null, closed = false, firstDirtyAt = 0;
  const saveStatus = (label, state = "saved") => { const status = W.querySelector("#el_save"); if (status) { status.textContent = label; status.dataset.state = state; } };
  const flushSave = () => {
    clearTimeout(saveT); saveT = 0;
    if (saving) return saving;
    if (writtenRevision === revision) return Promise.resolve(true);
    saveStatus("Saving…", "saving");
    saving = (async () => {
      try {
        while (writtenRevision < revision) {
          const target = revision;
          book.updated = Date.now();
          await DB.put("books", book);
          writtenRevision = target;
        }
        firstDirtyAt = 0; if (unsavedBooks.get(id) === book) unsavedBooks.delete(id); saveStatus("Saved on device"); return true;
      } catch (error) {
        saveStatus("Save failed · retry", "error");
        nbToast("Changes are kept in this session. Reopen this notebook to retry saving. " + (error.message || error)); return false;
      } finally { saving = null; }
    })();
    const job = saving; pendingSaves.set(id, job);
    job.finally(() => { if (pendingSaves.get(id) === job) pendingSaves.delete(id); });
    return job;
  };
  const save = () => {
    revision++; unsavedBooks.set(id, book); if (!firstDirtyAt) firstDirtyAt = Date.now();
    saveStatus("Unsaved changes", "pending"); clearTimeout(saveT);
    if (closed) { flushSave(); return; }
    saveT = setTimeout(flushSave, Math.max(0, Math.min(350, 1500 - (Date.now() - firstDirtyAt))));
  };
  W.querySelector("#el_save").onclick = flushSave;
  const onHidden = () => { if (document.visibilityState === "hidden") flushSave(); };
  const onPageHide = () => flushSave();
  const onBeforeUnload = event => { if (writtenRevision < revision) { flushSave(); event.preventDefault(); event.returnValue = ""; } };
  document.addEventListener("visibilitychange", onHidden); addEventListener("pagehide", onPageHide); addEventListener("beforeunload", onBeforeUnload);
  const snap = pg => JSON.stringify({strokes: pg.strokes, imgs: pg.imgs, texts: pg.texts, tpl: pg.tpl, paper: pg.paper});
  const historyChanged = () => { if (window.__eluUd) __eluUd(); };
  const pushU = (pg, joinPrevious = false) => {
    const entry = [pg.id, snap(pg)];
    if (joinPrevious && undo.length) { const prior = undo[undo.length - 1]; undo[undo.length - 1] = prior[0] === "$group" ? ["$group", [...prior[1], entry]] : ["$group", [prior, entry]]; }
    else undo.push(entry);
    if (undo.length > 100) undo.shift(); redo = []; historyChanged();
  };
  const pushPagesU = () => { undo.push(["$pages", JSON.stringify(book.pages), book.pages[curPage()]?.id]); if (undo.length > 100) undo.shift(); redo = []; historyChanged(); };
  const restore = (from, to) => {
    if (S.ro || cur) return;
    if (document.activeElement && W.contains(document.activeElement) && document.activeElement.isContentEditable) document.activeElement.blur();
    const entry = from.pop(); if (!entry) return;
    clearSel();
    if (entry[0] === "$pages") {
      to.push(["$pages", JSON.stringify(book.pages), book.pages[curPage()]?.id]);
      book.pages = JSON.parse(entry[1]); build();
      const at = book.pages.findIndex(pg => pg.id === entry[2]); if (at >= 0) goPage(at);
    } else {
      const entries = entry[0] === "$group" ? entry[1] : [entry], inverse = [];
      entries.forEach(item => { const P = pages.find(p => p.pg.id === item[0]); if (!P) return; inverse.push([P.pg.id, snap(P.pg)]); Object.assign(P.pg, JSON.parse(item[1])); ink(P); texts(P); });
      if (inverse.length) to.push(inverse.length === 1 ? inverse[0] : ["$group", inverse]);
    }
    historyChanged(); save();
  };

  /* ---- pages (canvases only near the screen) ---- */
  const mk = pg => { const el = document.createElement("div"); el.className = "elp" + (pg.paper === "night" ? " night" : ""); el.innerHTML = `<div class="eltl"></div><div class="elx"></div><span class="elpn">${book.pages.indexOf(pg) + 1}</span>`; const P = {pg, el}; el.__P = P; return P; };
  const size = P => { const w = Math.round(pw()), h = Math.round(w * P.pg.h / P.pg.w); P.el.style.width = w + "px"; P.el.style.height = h + "px"; };
  const cvSize = (c, P) => { const d = Math.min(dpr(), 4096 / Math.max(1, pw(), pw() * P.pg.h / P.pg.w)); c.width = Math.round(pw() * d); c.height = Math.round(pw() * d * P.pg.h / P.pg.w); return d; };
  const base = async P => { if (!P.b) return; if (P.task && P.task.t) try { P.task.t.cancel(); } catch (e) {} const task = P.task = {}, c = document.createElement("canvas"), d = cvSize(c, P);
    try { await drawBase(c.getContext("2d"), P.pg, sc() * d, task); } catch (e) { if (e && e.name === "RenderingCancelledException") return; }
    if (P.task !== task || !P.b) return; P.b.width = c.width; P.b.height = c.height; P.b.getContext("2d").drawImage(c, 0, 0); P.el.classList.add("ready"); };
  const ink = P => { if (!P.i) return; const d = cvSize(P.i, P); drawInk(P.i.getContext("2d"), P.pg, sc() * d); };
  const attach = P => { if (P.b) return; P.b = document.createElement("canvas"); P.b.className = "elb"; P.i = document.createElement("canvas"); P.i.className = "eli"; P.el.prepend(P.b, P.i); base(P); ink(P); if (S.ro || S.tool === "select") textLayer(P); };
  const detach = P => { if (!P.b) return; [P.b, P.i].forEach(c => { c.width = c.height = 0; c.remove(); }); P.b = P.i = null; P.el.querySelector(".eltl").innerHTML = ""; P.tl = 0; P.el.classList.remove("ready"); };
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? attach(e.target.__P) : detach(e.target.__P)), {root: scroll, rootMargin: "150% 150%"});
  const relayout = () => { pages.forEach(P => { size(P); if (P.b) { base(P); ink(P); texts(P); if (P.tl) { P.tl = 0; textLayer(P); } } }); $("#el_zv").textContent = Math.round(S.zoom * 100) + "%"; };
  const build = () => { io.disconnect(); wrap.innerHTML = ""; pages = book.pages.map(mk); pages.forEach(P => { wrap.appendChild(P.el); size(P); io.observe(P.el); texts(P); }); outline(); $("#el_pn").textContent = "/ " + pages.length; };
  const pageAt = (cx, cy) => { for (const P of pages) { const r = P.el.getBoundingClientRect(); if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return [P, r]; } return [null, null]; };
  const toPage = (P, r, cx, cy) => [(cx - r.left) / r.width * P.pg.w, (cy - r.top) / r.height * P.pg.h];
  /* ---- text boxes and stickers ---- */
  const texts = P => { const L = P.el.querySelector(".elx"); L.innerHTML = ""; P.pg.texts.forEach(t => L.appendChild(textEl(P, t))); };
  const textEl = (P, t) => { const d = document.createElement("div"); d.className = "elt" + (t.emoji ? " emo" : ""); if (!t.emoji) { d.contentEditable = !S.ro; d.spellcheck = true; } d.textContent = t.t || "";
    Object.assign(d.style, {left: t.x / P.pg.w * 100 + "%", top: t.y / P.pg.h * 100 + "%", width: t.emoji ? "auto" : t.w / P.pg.w * 100 + "%", fontSize: (t.size || 30) * sc() + "px", color: t.c || "#111827", fontWeight: t.b ? 700 : 400});
    let lastEdit = 0;
    d.addEventListener("beforeinput", event => {
      if (S.ro) { event.preventDefault(); return; }
      const now = performance.now(); if (!lastEdit || now - lastEdit > 800) pushU(P.pg); lastEdit = now;
    });
    d.addEventListener("focus", () => { lastEdit = 0; });
    d.addEventListener("input", () => { t.t = d.innerText; save(); });
    d.addEventListener("blur", () => { if (!t.emoji && !(t.t || "").trim()) { P.pg.texts = P.pg.texts.filter(x => x !== t); d.remove(); save(); } });
    return d; };
  /* ---- PDF text layer (pdf.js) or recognised OCR words, so words can be selected ---- */
  const textLayer = async P => { if (P.tl || !P.b) return; P.tl = 1; const L = P.el.querySelector(".eltl"); L.innerHTML = ""; const pg = P.pg;
    try {
      if (pg.type === "pdf") { const f = await DB.get("files", pg.fid), oc = f && f.ocr && f.ocr[pg.pi];
        if (oc && oc.words && oc.words.length) { ocrLayer(L, oc, pg); return; }
        const d = await pdfDoc(pg.fid), page = await d.getPage(pg.pi + 1), vp1 = page.getViewport({scale: 1}), vp = page.getViewport({scale: pw() / vp1.width}), tc = await page.getTextContent();
        if (!tc.items.length) { L.dataset.empty = 1; return; } L.style.setProperty("--scale-factor", vp.scale);
        await window.pdfjsLib.renderTextLayer({textContentSource: tc, container: L, viewport: vp, textDivs: []}).promise; eoc(L);
      } else if (pg.ocr) ocrLayer(L, pg.ocr, pg);
    } catch (e) {}
  };
  const ocrLayer = (L, oc, pg) => { L.innerHTML = oc.words.map(w => `<span style="left:${w.x0 / oc.W * 100}%;top:${w.y0 / oc.H * 100}%;width:${(w.x1 - w.x0) / oc.W * 100}%;height:${(w.y1 - w.y0) / oc.H * 100}%;font-size:${(w.y1 - w.y0) / oc.H * pg.h * sc() * 0.92}px">${esc(w.t)} </span>`).join(""); L.classList.add("ocr"); eoc(L); };
  const eoc = L => { const d = document.createElement("div"); d.className = "eleoc"; L.appendChild(d); };
  /* while a selection is being made, the guard covers the gaps between words; if a selection still jumps to the whole page, go back to the last good one */
  let goodSel = null;
  const onSelDown = e => { const L = e.target.closest && e.target.closest(".eltl"); if (L) L.classList.add("selecting"); };
  const onSelUp = () => $$(".eltl.selecting").forEach(L => L.classList.remove("selecting"));
  const onSelChange = () => { const s = getSelection(); if (!s.rangeCount) { goodSel = null; return; } const r = s.getRangeAt(0), ca = r.commonAncestorContainer, el = ca.nodeType === 1 ? ca : ca.parentElement, L = el && el.closest(".eltl"); if (!L && !(el && el.querySelector && el.querySelector(".eltl") && W.contains(el))) { goodSel = null; return; }
    const bad = n => n.nodeType === 1 && (n.classList.contains("eltl") || n.classList.contains("eleoc") || n.classList.contains("elp") || n.classList.contains("elpages") || n.classList.contains("elscroll"));
    const words = String(s).trim().split(/\s+/).length;
    if (bad(r.startContainer) || bad(r.endContainer) || !L || (goodSel && words > goodSel.words * 3 + 40)) { if (goodSel) try { s.setBaseAndExtent(goodSel.an, goodSel.ao, goodSel.fn, goodSel.fo); } catch (e) {} else s.removeAllRanges(); return; }
    goodSel = {an: s.anchorNode, ao: s.anchorOffset, fn: s.focusNode, fo: s.focusOffset, words}; };
  W.addEventListener("pointerdown", onSelDown, true); addEventListener("pointerup", onSelUp); addEventListener("pointercancel", onSelUp); document.addEventListener("selectionchange", onSelChange);
  COMM.unsub.push(() => { removeEventListener("pointerup", onSelUp); removeEventListener("pointercancel", onSelUp); document.removeEventListener("selectionchange", onSelChange); });
  const textLayers = on => pages.forEach(P => { if (on) textLayer(P); });
  /* ---- outline ---- */
  const outline = () => { const L = $("#el_olist"); L.innerHTML = book.pages.map((p, i) => `<button class="elth" data-go="${i}"><canvas data-th="${i}"></canvas><span>${i + 1}</span></button>`).join("");
    const io2 = new IntersectionObserver(es => es.forEach(async e => { if (!e.isIntersecting) return; io2.unobserve(e.target); const c = e.target.querySelector("canvas"), pg = book.pages[+e.target.dataset.go]; if (!pg) return;
      try { const im = await pageImage(pg, 110 / pg.w); c.width = im.width; c.height = im.height; c.getContext("2d").drawImage(im, 0, 0); } catch (er) {} }), {root: L});
    $$(".elth", L).forEach(b => { io2.observe(b); b.onclick = () => goPage(+b.dataset.go); b.oncontextmenu = e => { e.preventDefault(); pageMenu(+b.dataset.go); }; }); };
  const curPage = () => { const sr = scroll.getBoundingClientRect(); let best = 0, bd = 1e9; pages.forEach((P, i) => { const r = P.el.getBoundingClientRect(), d = horiz() ? Math.abs(r.left + r.width / 2 - (sr.left + sr.width / 2)) : Math.abs(r.top - sr.top - 60); if (d < bd) { bd = d; best = i; } }); return best; };
  const goPage = i => { const P = pages[Math.max(0, Math.min(pages.length - 1, i))]; if (P) P.el.scrollIntoView({behavior: "smooth", block: "start", inline: "center"}); };
  const navUpd = () => { const i = curPage(); const g = $("#el_pg"); if (document.activeElement !== g) g.value = i + 1; $$(".elth").forEach((b, k) => b.classList.toggle("on", k === i)); };
  scroll.addEventListener("scroll", () => { clearTimeout(navUpd.t); navUpd.t = setTimeout(navUpd, 80); if (S.sel) showSel(); }, {passive: true});
  $("#el_pg").addEventListener("change", e => goPage((+e.target.value || 1) - 1));
  /* ---- add, delete and change pages ---- */
  const addPage = (at, tpl, paper) => { if (S.ro) return; pushPagesU(); const pg = newPage(tpl, paper); book.pages.splice(at, 0, pg); build(); save(); setTimeout(() => goPage(at), 60); };
  const addSheet = at => { if (S.ro) return; const s = SET(); let tpl = s.tpl, paper = s.paper; const sh = sheet(`<h3>Add a page</h3>${tplPicker(tpl, paper)}<div class="btnrow" style="flex-wrap:wrap"><button class="btn" id="ap_go">Add page</button><button class="btn btn-ghost" id="ap_pdf">${I.pdf} Add a PDF</button><button class="btn btn-ghost" id="ap_img">${I.image} Photo as page</button></div>`);
    paintTpls(sh, paper); $$("[data-tpl]", sh).forEach(b => b.onclick = () => { tpl = b.dataset.tpl; $$("[data-tpl]", sh).forEach(x => x.classList.toggle("on", x === b)); });
    $$("[data-pap]", sh).forEach(b => b.onclick = () => { paper = b.dataset.pap; $$("[data-pap]", sh).forEach(x => x.classList.toggle("on", x === b)); paintTpls(sh, paper); });
    $("#ap_go", sh).onclick = () => { sh.remove(); addPage(at, tpl, paper); };
    $("#ap_pdf", sh).onclick = () => { sh.remove(); S.pdfAt = at; $("#el_pdff").click(); };
    $("#ap_img", sh).onclick = () => { sh.remove(); S.imgAsPage = at; $("#el_imgf").click(); }; };
  $("#el_addp2").onclick = () => addSheet(curPage() + 1);
  $("#el_pdff").onchange = async e => {
    const fs = [...e.target.files]; e.target.value = ""; if (!fs.length) return;
    const at = S.pdfAt == null ? book.pages.length : S.pdfAt; S.pdfAt = null;
    const imported = {pages: []}; await importPdfs(fs, imported, t => t && nbToast(t));
    if (!imported.pages.length || closed) return; pushPagesU(); book.pages.splice(at, 0, ...imported.pages); build(); save(); goPage(at);
  };
  const pageMenu = i => { if (S.ro) return; const pg = book.pages[i]; const sh = sheet(`<h3>Page ${i + 1}</h3>${pg.type === "paper" ? tplPicker(pg.tpl, pg.paper) : ""}<div class="btnrow" style="flex-wrap:wrap"><button class="btn btn-ghost" id="pm_up">Move up</button><button class="btn btn-ghost" id="pm_dn">Move down</button><button class="btn btn-ghost" id="pm_dup">Duplicate</button><button class="btn btn-ghost" id="pm_add">Add page after</button>${pg.type === "pdf" ? `<button class="btn btn-ghost" id="pm_ocr">${I.scan} Recognise text</button>` : ""}<button class="btn btn-danger" id="pm_del"${book.pages.length < 2 ? " disabled" : ""}>Delete</button></div>`);
    if (pg.type === "paper") { paintTpls(sh, pg.paper); $$("[data-tpl]", sh).forEach(b => b.onclick = () => { pushPagesU(); pg.tpl = b.dataset.tpl; build(); save(); sh.remove(); }); $$("[data-pap]", sh).forEach(b => b.onclick = () => { pushPagesU(); pg.paper = b.dataset.pap; build(); save(); sh.remove(); }); }
    const mv = d => { const j = i + d; if (j < 0 || j >= book.pages.length) return; pushPagesU(); [book.pages[i], book.pages[j]] = [book.pages[j], book.pages[i]]; build(); save(); sh.remove(); };
    $("#pm_up", sh).onclick = () => mv(-1); $("#pm_dn", sh).onclick = () => mv(1);
    $("#pm_dup", sh).onclick = () => { pushPagesU(); const c = JSON.parse(JSON.stringify(pg)); c.id = uid(); book.pages.splice(i + 1, 0, c); build(); save(); sh.remove(); };
    $("#pm_add", sh).onclick = () => { sh.remove(); addSheet(i + 1); };
    const oc = $("#pm_ocr", sh); if (oc) oc.onclick = () => { sh.remove(); runOcr([i]); };
    const del = $("#pm_del", sh); del.onclick = () => { if (!del.dataset.arm) { del.dataset.arm = 1; del.textContent = "Tap again to delete"; return; } pushPagesU(); book.pages.splice(i, 1); build(); save(); sh.remove(); }; };
  /* ---- OCR: one page or all ---- */
  const runOcr = async idxs => { const todo = idxs.filter(i => book.pages[i] && (book.pages[i].type === "pdf" || book.pages[i].type === "image")); if (!todo.length) { nbToast("OCR works on imported PDF pages and photos."); return; }
    nbToast("Loading text recognition…"); let w; try { w = await tess(); } catch (e) { nbToast(e.message); return; }
    for (let k = 0; k < todo.length; k++) { const i = todo[k], pg = book.pages[i]; nbToast(`Reading page ${i + 1}… (${k + 1} of ${todo.length})`);
      try { const cv = await pageImage(Object.assign({}, pg, {strokes: [], imgs: [], texts: []}), 2), r = await w.recognize(cv), words = (r.data.words || []).filter(x => x.text.trim()).map(x => ({t: x.text, x0: x.bbox.x0, y0: x.bbox.y0, x1: x.bbox.x1, y1: x.bbox.y1})), oc = {W: cv.width, H: cv.height, words, text: r.data.text};
        if (pg.type === "pdf") { const f = await DB.get("files", pg.fid); f.ocr = f.ocr || {}; f.ocr[pg.pi] = oc; await DB.put("files", f); } else { pg.ocr = oc; save(); }
        const P = pages[i]; if (P) { P.tl = 0; if (S.ro || S.tool === "select") textLayer(P); } } catch (e) { nbToast(`Page ${i + 1}: ${e.message || e}`); } }
    nbToast(`Text recognised on ${todo.length} page${todo.length > 1 ? "s" : ""}. Use the select tool (I) to pick words.`); };
  /* ---- tabs ---- */
  $$("[data-close]").forEach(b => b.onclick = e => { e.preventDefault(); const t = b.dataset.close, list = store.get("eluTabs", []).filter(x => x !== t); store.set("eluTabs", list); if (t === id) go(list.length ? "#eluna/" + list[0] : "#eluna"); else b.parentElement.remove(); });
  $("#el_tabadd").onclick = async () => { const bs = (await DB.all("books")).sort((a, b) => b.updated - a.updated); const sh = sheet(`<h3>Open in a new tab</h3><div class="elpick">${bs.map(b => `<a href="#eluna/${b.id}" class="elpk">${coverHTML(b)}<span>${esc(b.title)}</span></a>`).join("")}</div><div class="btnrow"><button class="btn btn-ghost" id="tb_imp">${I.pdf} Import PDFs</button><button class="btn btn-ghost" id="tb_new">${I.plus} New notebook</button></div>`);
    $$(".elpk", sh).forEach(a => a.onclick = () => sh.remove()); $("#tb_new", sh).onclick = () => { sh.remove(); newBookSheet(); };
    $("#tb_imp", sh).onclick = () => { sh.remove(); const f = document.createElement("input"); f.type = "file"; f.accept = "application/pdf,.pdf"; f.multiple = true; f.onchange = async () => { const ids = await importPdfs([...f.files], null, t => t && nbToast(t)); if (ids.length) { store.set("eluTabs", [...new Set([...ids, ...store.get("eluTabs", [])])].slice(0, 8)); go("#eluna/" + ids[0]); } }; f.click(); }; };
  /* ---- read-only mode, outline, more ---- */
  const setRO = on => { S.ro = on; W.classList.toggle("ro", on); $("#el_robadge").hidden = !on; $("#el_ro").classList.toggle("on", on); $$(".elt").forEach(d => { if (!d.classList.contains("emo")) d.contentEditable = !on; }); textLayers(on || S.tool === "select"); };
  $("#el_ro").onclick = () => setRO(!S.ro); $("#el_edit").onclick = () => setRO(false);
  $("#el_side").onclick = () => { const o = $("#el_ol"); o.hidden = !o.hidden; const n = SET(); n.outline = !o.hidden; store.set("eluSet", n); setTimeout(relayout, 60); };
  $("#el_more").onclick = () => { const i = curPage(), isPdf = book.pages.some(p => p.type === "pdf");
    const sh = sheet(`<h3>${esc(book.title)}</h3><div class="elmenu"><button id="mo_pdf">${I.pdf}<span>Export PDF</span></button><button id="mo_add">${I.plus}<span>Add page</span></button><button id="mo_page">${I.book}<span>This page…</span></button>${isPdf ? `<button id="mo_ocr1">${I.scan}<span>Recognise text: this page</span></button><button id="mo_ocra">${I.scan}<span>Recognise text: all pages</span></button>` : ""}<button id="mo_set">${I.gear}<span>Settings</span></button></div><div class="small" id="mo_m"></div>`);
    $("#mo_pdf", sh).onclick = () => exportPdf(book, t => $("#mo_m", sh).textContent = t);
    $("#mo_add", sh).onclick = () => { sh.remove(); addSheet(i + 1); }; $("#mo_page", sh).onclick = () => { sh.remove(); pageMenu(i); };
    const o1 = $("#mo_ocr1", sh); if (o1) o1.onclick = () => { sh.remove(); runOcr([i]); }; const oa = $("#mo_ocra", sh); if (oa) oa.onclick = () => { sh.remove(); runOcr(book.pages.map((_, k) => k)); };
    $("#mo_set", sh).onclick = () => { sh.remove(); settingsSheet(() => { look(); scroll.classList.toggle("horiz", horiz()); $("#el_ol").hidden = !SET().outline; tbPlace(); relayout(); }); }; };
  /* ---- floating toolbar: drag the grip anywhere; it turns vertical near the left or right edge ---- */
  const tb = $("#el_tb");
  const tbPlace = () => { const p = store.get("eluTb", null), r = W.getBoundingClientRect(); if (!p) { tb.classList.remove("vert"); tb.style.left = "50%"; tb.style.top = "58px"; tb.style.transform = "translateX(-50%)"; return; }
    tb.style.transform = "none"; tb.classList.toggle("vert", !!p.v); tb.style.left = Math.max(6, Math.min(r.width - tb.offsetWidth - 6, p.x * r.width)) + "px"; tb.style.top = Math.max(52, Math.min(r.height - tb.offsetHeight - 6, p.y * r.height)) + "px"; };
  const tbDrag = e => { e.preventDefault(); e.stopPropagation(); closePop(); const r = W.getBoundingClientRect(), t0 = tb.getBoundingClientRect(), dx = e.clientX - t0.left, dy = e.clientY - t0.top; tb.classList.add("drag");
    const mv = ev => { const v = ev.clientX - r.left < 90 || r.right - ev.clientX < 90; tb.classList.toggle("vert", v); tb.style.transform = "none"; tb.style.left = Math.max(6, Math.min(r.width - tb.offsetWidth - 6, ev.clientX - r.left - dx)) + "px"; tb.style.top = Math.max(52, Math.min(r.height - tb.offsetHeight - 6, ev.clientY - r.top - dy)) + "px"; };
    const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); tb.classList.remove("drag");
      if (tb.classList.contains("vert")) tb.style.left = (parseFloat(tb.style.left) + tb.offsetWidth / 2 < r.width / 2 ? 8 : r.width - tb.offsetWidth - 8) + "px";   /* dock neatly to the side */
      store.set("eluTb", {x: parseFloat(tb.style.left) / r.width, y: parseFloat(tb.style.top) / r.height, v: tb.classList.contains("vert")}); };
    addEventListener("pointermove", mv); addEventListener("pointerup", up); };
  $("#el_grip").addEventListener("pointerdown", tbDrag); tb.addEventListener("pointerdown", e => { if (e.target === tb || e.target.classList.contains("eltb-sep")) tbDrag(e); });
  $("#el_grip").addEventListener("dblclick", () => { store.set("eluTb", null); tbPlace(); });
  const tbMini = on => { tb.classList.toggle("mini", on); store.set("eluTbMini", on); $("#el_mini").title = on ? "Show all tools" : "Fold toolbar"; requestAnimationFrame(tbPlace); };
  $("#el_mini").onclick = () => tbMini(!tb.classList.contains("mini")); tbMini(store.get("eluTbMini", false));
  /* ---- tools and their options ---- */
  const pop = $("#el_pop");
  const popAt = (btn, html) => { pop.innerHTML = html; pop.hidden = false; const r = btn.getBoundingClientRect(), w = W.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(w.width - pop.offsetWidth - 8, r.left - w.left + r.width / 2 - pop.offsetWidth / 2)) + "px"; pop.style.top = (r.bottom - w.top + 8 + pop.offsetHeight > w.height ? r.top - w.top - pop.offsetHeight - 8 : r.bottom - w.top + 8) + "px"; };
  const closePop = () => { pop.hidden = true; };
  const colPop = () => { const hl = S.tool === "hl", cols = hl ? HLS : PENS, curC = hl ? S.hl : S.pen;
    popAt($("#el_col"), `<div class="elpoph">${hl ? "Highlighter" : "Pen"} colour</div><div class="elcols">${cols.map(c => `<button class="elc${c === curC ? " on" : ""}" data-c="${c}" style="--c:${c}" aria-label="Colour"></button>`).join("")}<label class="elc elcust" title="Any colour"><input type="color" id="el_cc" value="${curC}"></label></div><div class="elpoph">Thickness</div><div class="elsizes">${[1, 2, 3, 5, 8].map(z => `<button class="elz${z === S.size ? " on" : ""}" data-z="${z}"><i style="--z:${3 + z * 1.8}px"></i></button>`).join("")}</div>`);
    const setC = c => { if (hl) store.set("eluHl", S.hl = c); else store.set("eluPen", S.pen = c); tbUpd(); colPop(); };
    $$("[data-c]", pop).forEach(b => b.onclick = () => setC(b.dataset.c)); $("#el_cc", pop).onchange = e => setC(e.target.value);
    $$("[data-z]", pop).forEach(b => b.onclick = () => { store.set("eluSize", S.size = +b.dataset.z); colPop(); }); };
  const subPop = k => { const opts = {eraser: [["stroke", "Stroke eraser", "removes whole lines"], ["standard", "Standard eraser", "rubs out like a real eraser"], ["precision", "Precision eraser", "fine tip for small details"]], lasso: [["free", "Freehand", "draw any shape around it"], ["rect", "Rectangle", "drag a box"]], laser: [["line", "Laser pen", "write or circle — it stays while you keep going"], ["dot", "Laser dot", "a single bright pointer"]]}[k]; if (!opts) return colPop();
    const head = {eraser: "Eraser", lasso: "Lasso — select or screenshot", laser: "Laser pointer"}[k], extra = k === "laser" ? `<div class="elpoph" style="margin-top:10px">Laser writing stays for</div><div class="elseg">${[[100, "0.1 s"], [500, "0.5 s"], [1000, "1 s"], [2000, "2 s"], [5000, "5 s"], [0, "Until clear"]].map(([v, l]) => `<button class="${LZH() === v ? "on" : ""}" data-lzh="${v}">${l}</button>`).join("")}</div>`
      : k === "lasso" ? `<small class="muted elpnote">Circle your own writing, photos or text to move, resize, recolour or copy them. Circle an empty part of the page (or a PDF) to get a screenshot of it.</small>` : "";
    popAt($(`.eltb [data-tool="${k}"]`), `<div class="elpoph">${head}</div><div class="elsub${k === "lasso" ? " elsub2" : ""}">${opts.map(([v, l, d]) => `<button class="${S.sub[k] === v ? "on" : ""}" data-sub="${v}">${k === "lasso" ? `<i class="elsubi">${v === "rect" ? I.lassoRect : I.lasso}</i>` : ""}<b>${l}</b><small>${d}</small></button>`).join("")}</div>${extra}`);
    $$("[data-sub]", pop).forEach(b => b.onclick = () => { S.sub[k] = b.dataset.sub; store.set("eluSub", S.sub); tbUpd(); subPop(k); });
    $$("[data-lzh]", pop).forEach(b => b.onclick = () => { store.set("eluLzHold", +b.dataset.lzh); if (lpts.some(p => p.live)) laserOff(); subPop(k); }); };
  const sweepTexts = () => pages.forEach(P => { const keep = P.pg.texts.filter(t => t.emoji || (t.t || "").trim()); if (keep.length !== P.pg.texts.length) { P.pg.texts = keep; texts(P); save(); } });
  const udUpd = () => { $("#el_undo").classList.toggle("dis", !undo.length); $("#el_redo").classList.toggle("dis", !redo.length); };
  const tbUpd = () => { sweepTexts(); udUpd(); { const pb = $('.eltb [data-tool="pen"]'), hb = $('.eltb [data-tool="hl"]'); if (pb) pb.style.setProperty("--tc", S.pen); if (hb) hb.style.setProperty("--tc", S.hl); } $("#el_palm").classList.toggle("on", !!S.pencil); { const lb = $('[data-tool="lasso"]', tb); lb.innerHTML = S.sub.lasso === "rect" ? I.lassoRect : I.lasso; } $$("[data-tool]", tb).forEach(b => b.classList.toggle("on", b.dataset.tool === S.tool)); $("#el_col i").style.backgroundColor = S.tool === "hl" ? S.hl : S.pen; W.dataset.tool = S.tool; W.classList.toggle("selmode", S.tool === "select"); if (S.tool !== "lasso") clearSel(); };
  $$("[data-tool]", tb).forEach(b => b.onclick = () => { const k = b.dataset.tool; if (S.tool === k && ["eraser", "lasso", "laser", "pen", "hl"].includes(k)) { pop.hidden ? subPop(k) : closePop(); return; } closePop(); S.paste = false; pasteUpd(); if (S.tool === "laser" && k !== "laser") laserFade(); store.set("eluTool", S.tool = k); tbUpd(); if (["eraser", "lasso", "laser"].includes(k)) subPop(k); if (k === "select") { textLayers(true); nbToast(book.pages.some(p => p.type === "pdf") ? "Press and hold a word to select it — then Define, Google or highlight." : "Select text works on PDFs (and pages after OCR)."); } });
  $("#el_col").onclick = () => pop.hidden ? colPop() : closePop();
  /* Apple Pencil and S Pen options */
  const penPop = () => { const p = PEN(), row = (k, l, d) => `<button class="elsw${p[k] ? " on" : ""}" data-pk="${k}"><span><b>${l}</b><small>${d}</small></span><i></i></button>`;
    popAt($("#el_sty"), `<div class="elpoph">Apple Pencil & S Pen</div><div class="elsub">${row("palm", "Pen only — palm rejection", "the pen writes; fingers scroll, zoom and hold to select words")}${row("pressure", "Pressure", "press harder for thicker lines")}${row("hover", "Hover preview", "see the nib before it touches (Pencil hover, S Pen air view)")}</div>
      <div class="elpoph" style="margin-top:10px">S Pen button / barrel button</div><div class="elseg">${[["eraser", "Eraser"], ["lasso", "Lasso"], ["hl", "Highlighter"], ["laser", "Laser"]].map(([v, l]) => `<button class="${p.btn === v ? "on" : ""}" data-pb="${v}">${l}</button>`).join("")}</div>
      <small class="muted elpnote">Hold the S Pen button (or flip a stylus to its eraser end) while writing. On iPad, Apple Pencil double-tap and squeeze are reserved for Apple apps — use the toolbar instead.</small>`);
    $$("[data-pk]", pop).forEach(b => b.onclick = () => { const n = PEN(); n[b.dataset.pk] = !n[b.dataset.pk]; store.set("eluPen2", n); if (b.dataset.pk === "palm") { setPencil(n.palm); $("#el_palm").classList.toggle("on", n.palm); } penPop(); });
    $$("[data-pb]", pop).forEach(b => b.onclick = () => { const n = PEN(); n.btn = b.dataset.pb; store.set("eluPen2", n); penPop(); }); };
  $("#el_sty").onclick = () => pop.hidden ? penPop() : closePop();
  const setPalm = on => { const n = PEN(); setPencil(on); n.palm = on; store.set("eluPen2", n); $("#el_palm").classList.toggle("on", on); };
  const palmPop = () => { popAt($("#el_palm"), `<div class="elpoph">Palm rejection</div><div class="elseg elseg2"><button class="${S.pencil ? "on" : ""}" data-pr="1">On</button><button class="${S.pencil ? "" : "on"}" data-pr="0">Off</button></div>
      <small class="muted elpnote"><b>On</b> — only the Apple Pencil / S Pen writes. Your hand can rest on the screen; fingers scroll, zoom and hold to select words.<br><b>Off</b> — fingers write too (for drawing without a pen).</small>`);
    $$("[data-pr]", pop).forEach(b => b.onclick = () => { setPalm(b.dataset.pr === "1"); palmPop(); nbToast(b.dataset.pr === "1" ? "Palm rejection on" : "Palm rejection off"); }); };
  $("#el_palm").onclick = () => pop.hidden ? palmPop() : closePop();
  window.__eluUd = udUpd; COMM.unsub.push(() => { if (window.__eluUd === udUpd) delete window.__eluUd; });
  $("#el_undo").onclick = () => restore(undo, redo); $("#el_redo").onclick = () => restore(redo, undo);
  $("#el_emo").onclick = () => { popAt($("#el_emo"), `<div class="elemo">${STICKERS.map(e => `<button data-e="${e}">${e}</button>`).join("")}</div><small class="muted">Tap a sticker, then tap the page</small>`); $$("[data-e]", pop).forEach(b => b.onclick = () => { S.emoji = b.dataset.e; closePop(); nbToast(`Tap the page to place ${S.emoji}`); }); };
  $("#el_img").onclick = () => { S.imgAsPage = null; $("#el_imgf").click(); };
  $("#el_imgf").onchange = async e => { const f = e.target.files[0]; e.target.value = ""; if (!f) return; try { const im = await commImage(f, 2000, 0.86, 1500000), out = await nbCrop(im.data); if (!out) return;
      if (S.imgAsPage != null) { pushPagesU(); const h = Math.round(PW * out.h / out.w), pg = newPage("blank", "white", {type: "image", bg: out.src, h}); book.pages.splice(S.imgAsPage, 0, pg); S.imgAsPage = null; build(); save(); return; }
      const P = pages[curPage()]; pushU(P.pg); const w = P.pg.w * 0.6, o = {id: uid(), src: out.src, x: (P.pg.w - w) / 2, y: P.pg.h * 0.2, w, h: w * out.h / out.w}; P.pg.imgs.push(o); await ready([o.src]); ink(P); save(); store.set("eluTool", S.tool = "lasso"); tbUpd(); selectItems(P, [], [o], []); } catch (er) { nbToast(er.message || "Could not add the photo"); } };
  /* ---- ruler: drag to move, two fingers or the handle to turn; the pen snaps to its edge ---- */
  const rul = $("#el_ruler"); const rulDraw = () => { const R = S.ruler; if (!R) { rul.hidden = true; return; } rul.hidden = false; rul.style.left = R.x + "px"; rul.style.top = R.y + "px"; rul.style.transform = `translate(-50%,-50%) rotate(${R.a}rad)`; $("#el_rdeg").textContent = Math.round(((-R.a * 180 / Math.PI) % 360 + 360) % 360) + "°"; };
  $("#el_rul").onclick = () => { const w = W.getBoundingClientRect(); S.ruler = S.ruler ? null : {x: w.width / 2, y: w.height / 2, a: -0.12}; $("#el_rul").classList.toggle("on", !!S.ruler); rulDraw(); };
  const rTouch = new Map();
  rul.addEventListener("pointerdown", e => { if (e.pointerType === "pen") return; e.stopPropagation(); rul.setPointerCapture(e.pointerId); rTouch.set(e.pointerId, {x: e.clientX, y: e.clientY}); });
  rul.addEventListener("pointermove", e => { if (!rTouch.has(e.pointerId)) return; const o = rTouch.get(e.pointerId), R = S.ruler; rTouch.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (rTouch.size === 2) { const [a, b] = [...rTouch.values()], [a0, b0] = rTouch.size === 2 ? [o, null] : []; const ang = Math.atan2(b.y - a.y, b.x - a.x); if (S.rAng0 == null) { S.rAng0 = ang; S.rA0 = R.a; } R.a = S.rA0 + ang - S.rAng0; }
    else { R.x += e.clientX - o.x; R.y += e.clientY - o.y; } rulDraw(); });
  rul.addEventListener("pointerup", e => { rTouch.delete(e.pointerId); S.rAng0 = null; });
  rul.querySelector("i").addEventListener("pointerdown", e => { e.stopPropagation(); e.preventDefault(); const w = W.getBoundingClientRect(); const mv = ev => { S.ruler.a = Math.atan2(ev.clientY - w.top - S.ruler.y, ev.clientX - w.left - S.ruler.x); rulDraw(); }, up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); }; addEventListener("pointermove", mv); addEventListener("pointerup", up); });
  const snapRuler = (cx, cy) => { const R = S.ruler; if (!R) return null; const w = W.getBoundingClientRect(), x = cx - w.left, y = cy - w.top, ux = Math.cos(R.a), uy = Math.sin(R.a), nx = -uy, ny = ux, half = 34;
    for (const sgn of [-1, 1]) { const ox = R.x + nx * half * sgn, oy = R.y + ny * half * sgn, d = (x - ox) * nx + (y - oy) * ny; if (Math.abs(d) < 26) { const t = (x - ox) * ux + (y - oy) * uy; return [w.left + ox + ux * t, w.top + oy + uy * t]; } } return null; };
  /* ---- overlay: laser, lasso path, eraser ring, Pencil hover ---- */
  let lpts = [], lraf = 0, ring = null, hover = null, lassoPath = null;
  const lzc = $("#el_lzc"); let lzT = 0;
  const fxLoop = () => { const d = dpr(), w = W.clientWidth, h = W.clientHeight; if (fx.width !== Math.round(w * d)) { fx.width = Math.round(w * d); fx.height = Math.round(h * d); } const c = fx.getContext("2d"), now = performance.now(), LIFE = S.sub.laser === "dot" ? 160 : (S.lzFade || 650);
    /* "live" points belong to the stroke still being drawn: they stay bright until the pen lifts, then the whole trail fades together */
    c.clearRect(0, 0, fx.width, fx.height); lpts = lpts.filter(p => p.live || now - p.t < LIFE); c.lineCap = c.lineJoin = "round";
    /* each laser stroke is one smooth path drawn in three passes (glow, red core, white centre), so letters stay clean */
    for (let i = 1, s0 = 0; i <= lpts.length; i++) if (i === lpts.length || lpts[i].br) { const q = lpts.slice(s0, i); s0 = i; if (!q.length) continue; const z = q[q.length - 1], al = z.live ? 1 : Math.pow(Math.max(0, 1 - (now - z.t) / LIFE), 1.6); if (al <= 0) continue;
      c.beginPath(); c.moveTo(q[0].x * d, q[0].y * d); if (q.length === 1) c.lineTo(q[0].x * d + .1, q[0].y * d); for (let k = 1; k < q.length - 1; k++) c.quadraticCurveTo(q[k].x * d, q[k].y * d, (q[k].x + q[k + 1].x) / 2 * d, (q[k].y + q[k + 1].y) / 2 * d); if (q.length > 1) c.lineTo(z.x * d, z.y * d);
      c.strokeStyle = `rgba(255,59,48,${al * .22})`; c.lineWidth = 15 * d; c.stroke(); c.strokeStyle = `rgba(255,72,62,${al * .92})`; c.lineWidth = 5 * d; c.stroke(); c.strokeStyle = `rgba(255,240,236,${al})`; c.lineWidth = 1.7 * d; c.stroke(); }
    { const on = lpts.some(p => p.live); if (lzc.hidden === on) lzc.hidden = !on; }
    const last = lpts[lpts.length - 1]; if (last && cur && cur.laser) { const g = c.createRadialGradient(last.x * d, last.y * d, 0, last.x * d, last.y * d, 15 * d); g.addColorStop(0, "#fff"); g.addColorStop(.3, "rgba(255,70,60,1)"); g.addColorStop(1, "rgba(255,59,48,0)"); c.fillStyle = g; c.beginPath(); c.arc(last.x * d, last.y * d, 15 * d, 0, 7); c.fill(); }
    if (ring) { c.strokeStyle = "rgba(71,85,105,.85)"; c.fillStyle = "rgba(148,163,184,.13)"; c.lineWidth = 1.6 * d; c.beginPath(); c.arc(ring.x * d, ring.y * d, ring.r * d, 0, 7); c.fill(); c.stroke(); }
    if (hover) { c.fillStyle = hover.c; c.globalAlpha = .55; c.beginPath(); c.arc(hover.x * d, hover.y * d, Math.max(2, hover.r) * d, 0, 7); c.fill(); c.globalAlpha = 1; }
    if (lassoPath && lassoPath.length > 1) { c.setLineDash([6 * d, 5 * d]); c.strokeStyle = "#2563eb"; c.lineWidth = 1.6 * d; c.fillStyle = "rgba(37,99,235,.08)"; c.beginPath(); lassoPath.forEach((p, i) => i ? c.lineTo(p.x * d, p.y * d) : c.moveTo(p.x * d, p.y * d)); c.closePath(); c.fill(); c.stroke(); c.setLineDash([]); }
    lraf = lpts.length || ring || hover || lassoPath || (cur && cur.laser) ? requestAnimationFrame(fxLoop) : 0; };
  const kick = () => { if (!lraf) lraf = requestAnimationFrame(fxLoop); };
  /* laser writing stays while you keep writing; a few seconds after the last stroke (or on Clear) it all fades together */
  const laserFade = () => { clearTimeout(lzT); const now = performance.now(); lpts.forEach(p => { if (p.live) { p.live = 0; p.t = now; } }); kick(); };
  const LZH = () => store.get("eluLzHold", 1000);
  const laserOff = () => { clearTimeout(lzT); if (S.sub.laser === "dot") return laserFade(); const h = LZH(); S.lzFade = h && h < 1000 ? 280 : 650; if (h > 0) lzT = setTimeout(laserFade, h); kick(); };
  lzc.onclick = laserFade;
  const pasteUpd = () => { const b = $("#el_paste"); if (!b) return; b.hidden = !CLIP; b.classList.toggle("on", !!S.paste); b.textContent = S.paste ? "Tap where it should go  ✕" : "📋 Paste"; };
  $("#el_paste").onclick = () => { S.paste = !S.paste; closePop(); clearSel(); pasteUpd(); };
  const doPaste = async (P, x, y) => { const c = JSON.parse(JSON.stringify(CLIP)), b = c.b, dx = x - (b.x0 + b.x1) / 2, dy = y - (b.y0 + b.y1) / 2, g = uid(); pushU(P.pg); [...c.sts, ...c.ims, ...c.txs].forEach(o => o.g = g);
    c.sts.forEach(st => { for (let i = 0; i < st.p.length; i += 3) { st.p[i] += dx; st.p[i + 1] += dy; } }); c.ims.forEach(o => { o.id = uid(); o.x += dx; o.y += dy; }); c.txs.forEach(q => { q.id = uid(); q.x += dx; q.y += dy; });
    P.pg.strokes.push(...c.sts); P.pg.imgs.push(...c.ims); P.pg.texts.push(...c.txs); await ready(c.ims.map(o => o.src)); ink(P); texts(P); save(); S.paste = false; pasteUpd();
    store.set("eluTool", S.tool = "lasso"); tbUpd(); selectItems(P, c.sts, c.ims, c.txs); nbToast("Pasted — drag it to move, even onto another page"); };
  /* dropped over a different page: the selection moves to that page */
  const dropTo = () => { const s = S.sel; if (!s) return; const bx = selBox.getBoundingClientRect(), [P2, r2] = pageAt(bx.left + bx.width / 2, bx.top + bx.height / 2); if (!P2 || P2 === s.P) return;
    const r1 = s.P.el.getBoundingClientRect(), k1 = r1.width / s.P.pg.w, k2 = r2.width / P2.pg.w, f = k1 / k2, cx = x => (x * k1 + r1.left - r2.left) / k2, cy = y => (y * k1 + r1.top - r2.top) / k2; pushU(P2.pg, true);
    s.sts.forEach(st => { for (let i = 0; i < st.p.length; i += 3) { st.p[i] = cx(st.p[i]); st.p[i + 1] = cy(st.p[i + 1]); } st.w *= f; }); s.ims.forEach(o => { o.x = cx(o.x); o.y = cy(o.y); o.w *= f; o.h *= f; }); s.txs.forEach(q => { q.x = cx(q.x); q.y = cy(q.y); q.w *= f; q.size = (q.size || 30) * f; });
    s.P.pg.strokes = s.P.pg.strokes.filter(x => !s.sts.includes(x)); s.P.pg.imgs = s.P.pg.imgs.filter(x => !s.ims.includes(x)); s.P.pg.texts = s.P.pg.texts.filter(x => !s.txs.includes(x));
    P2.pg.strokes.push(...s.sts); P2.pg.imgs.push(...s.ims); P2.pg.texts.push(...s.txs); [s.P, P2].forEach(P => { ink(P); texts(P); }); S.sel = {P: P2, sts: s.sts, ims: s.ims, txs: s.txs}; showSel(); nbToast("Moved to page " + (pages.indexOf(P2) + 1)); };
  /* highlighter: a roughly straight stroke straightens when the pen lifts; over PDF text it snaps to the line of text */
  const look = () => { const s = SET(); S.pencil = store.get("nbPencil", false); $("#el_palm").classList.toggle("on", !!S.pencil); W.dataset.desk = s.desk; W.dataset.tbs = s.tbs; W.dataset.gap = s.gap; W.classList.toggle("nopn", !s.pnum); };
  const hlSnap = (P, st) => { if (!SET().hlsnap) return; const p = st.p, n = p.length / 3; if (n < 2) return; const x0 = p[0], y0 = p[1], x1 = p[p.length - 3], y1 = p[p.length - 2], len = Math.hypot(x1 - x0, y1 - y0); if (len < 24) return;
    let dev = 0, sy = 0; for (let i = 0; i < p.length; i += 3) { dev = Math.max(dev, Math.abs((x1 - x0) * (y0 - p[i + 1]) - (x0 - p[i]) * (y1 - y0)) / len); sy += p[i + 1]; } if (dev > Math.max(22, len * 0.14)) return;   /* a circle or scribble stays as drawn */
    const ym = sy / n, xa = Math.min(x0, x1), xb = Math.max(x0, x1);
    if (Math.abs(y1 - y0) < len * 0.26) { const L = P.el.querySelector(".eltl"), r = P.el.getBoundingClientRect(), k = P.pg.w / r.width;
      const sp = L ? [...L.querySelectorAll("span")].map(q => q.getBoundingClientRect()).filter(q => q.width > 1 && q.height > 1).map(q => ({x0: (q.left - r.left) * k, x1: (q.right - r.left) * k, y0: (q.top - r.top) * k, y1: (q.bottom - r.top) * k})).filter(q => q.x1 > xa && q.x0 < xb && ym > q.y0 - st.w / 2 && ym < q.y1 + st.w / 2) : [];
      if (sp.length) { const best = sp.reduce((a, q) => Math.abs((q.y0 + q.y1) / 2 - ym) < Math.abs((a.y0 + a.y1) / 2 - ym) ? q : a), cy = (best.y0 + best.y1) / 2, row = sp.filter(q => Math.abs((q.y0 + q.y1) / 2 - cy) < (best.y1 - best.y0) * 0.5);
        const ty0 = Math.min(...row.map(q => q.y0)), ty1 = Math.max(...row.map(q => q.y1)), lx = Math.max(xa, Math.min(...row.map(q => q.x0))), rx = Math.min(xb, Math.max(...row.map(q => q.x1))), yc = +((ty0 + ty1) / 2).toFixed(1);
        if (rx > lx) { st.w = (ty1 - ty0) * 1.1; st.p = [+lx.toFixed(1), yc, .5, +rx.toFixed(1), yc, .5]; st.flat = 1; return; } }
      st.p = [x0, +ym.toFixed(1), .5, x1, +ym.toFixed(1), .5]; return; }
    st.p = [x0, y0, .5, x1, y1, .5]; };
  /* paste a picture from the clipboard (Ctrl/Cmd+V), or the last lasso copy */
  const onPaste = async e => { if (S.ro) return; const n = e.target && e.target.closest ? e.target : null; if (n && n.closest("input,textarea,[contenteditable]")) return; const f = [...((e.clipboardData && e.clipboardData.files) || [])].find(x => /^image\//.test(x.type));
    if (!f) { if (CLIP) { S.paste = true; pasteUpd(); } return; } e.preventDefault();
    try { const im = await commImage(f, 2000, 0.86, 1500000), img = new Image(); img.src = im.data; await img.decode(); const P = pages[curPage()]; pushU(P.pg); const w = Math.min(P.pg.w * 0.6, img.naturalWidth * 1.2), o = {id: uid(), src: im.data, x: (P.pg.w - w) / 2, y: P.pg.h * 0.15, w, h: w * img.naturalHeight / img.naturalWidth};
      P.pg.imgs.push(o); await ready([o.src]); ink(P); save(); store.set("eluTool", S.tool = "lasso"); tbUpd(); selectItems(P, [], [o], []); nbToast("Picture pasted — drag it where you like"); } catch (er) { nbToast("Could not paste that picture"); } };
  addEventListener("paste", onPaste);
  /* stop the browser zooming the whole app while a notebook is open (iPad Safari, Android Chrome) */
  const vm = document.querySelector('meta[name="viewport"]'), vm0 = vm ? vm.content : ""; if (vm) vm.content = vm0.replace(/,?\s*(maximum-scale|minimum-scale|user-scalable)=[^,]*/g, "") + ", maximum-scale=1, user-scalable=no";
  const noG = e => e.preventDefault(), noT = e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, noW = e => { if (e.ctrlKey && !e.target.closest(".elscroll")) e.preventDefault(); };
  ["gesturestart", "gesturechange", "gestureend"].forEach(g => document.addEventListener(g, noG, {passive: false})); document.addEventListener("touchmove", noT, {passive: false}); addEventListener("wheel", noW, {passive: false});
  COMM.unsub.push(() => { if (vm) vm.content = vm0; ["gesturestart", "gesturechange", "gestureend"].forEach(g => document.removeEventListener(g, noG)); document.removeEventListener("touchmove", noT); removeEventListener("wheel", noW); });
  const wxy = e => { const w = W.getBoundingClientRect(); return {x: e.clientX - w.left, y: e.clientY - w.top}; };
  /* ---- lasso selection: strokes, photos, text and stickers can be moved, duplicated, recoloured or deleted ---- */
  const selBox = $("#el_sel");
  const clearSel = () => { S.sel = null; selBox.hidden = true; };
  const itemBox = (P, sts, ims, txs) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const include = (x, y, w, h) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + h); };
    sts.forEach(st => { for (let i = 0; i < st.p.length; i += 3) include(st.p[i] - st.w, st.p[i + 1] - st.w, st.w * 2, st.w * 2); });
    ims.forEach(o => include(o.x, o.y, o.w, o.h));
    txs.forEach(t => {
      const size = t.size || (t.emoji ? 60 : 30), width = t.emoji ? size * 1.3 : Math.max(1, t.w || 300);
      let height = size * 1.3 + 16;
      if (!t.emoji) {
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.font = `${t.b ? 700 : 400} ${size}px ${FONT}`;
        height = wrapText(ctx, t.t || "", width).length * size * 1.3 + 16;
      }
      include(t.x, t.y, width + (t.emoji ? 0 : 16), height);
    });
    return {x0, y0, x1, y1};
  };
  const selectItems = (P, sts, ims, txs) => { if (!sts.length && !ims.length && !txs.length) { clearSel(); return; } S.sel = {P, sts, ims, txs}; showSel(); };
  const showSel = () => { const s = S.sel; if (!s) return; const b = itemBox(s.P, s.sts, s.ims, s.txs), r = s.P.el.getBoundingClientRect(), w = W.getBoundingClientRect(), k = r.width / s.P.pg.w;
    Object.assign(selBox.style, {left: r.left - w.left + b.x0 * k + "px", top: r.top - w.top + b.y0 * k + "px", width: (b.x1 - b.x0) * k + "px", height: (b.y1 - b.y0) * k + "px"}); selBox.hidden = false;
    const im1 = s.ims.length === 1 && !s.sts.length && !s.txs.length; selBox.querySelector('[data-a="rot"]').hidden = !im1; selBox.querySelector('[data-a="col"]').hidden = !s.sts.length && !s.txs.some(q => !q.emoji); };
  const pip = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const lassoFinish = (P, r) => { const poly = lassoPath.map(p => { const w = W.getBoundingClientRect(); return toPage(P, r, p.x + w.left, p.y + w.top); }); lassoPath = null; kick(); if (poly.length < 3) { clearSel(); return; }
    const sts = P.pg.strokes.filter(st => st.t !== "px" && (() => { let n = 0, tot = 0; for (let i = 0; i < st.p.length; i += 3) { tot++; if (pip([st.p[i], st.p[i + 1]], poly)) n++; } return n / tot > 0.5; })());
    const ims = P.pg.imgs.filter(o => pip([o.x + o.w / 2, o.y + o.h / 2], poly)), txs = P.pg.texts.filter(t => pip([t.x + 20, t.y + 20], poly));
    if (!sts.length && !ims.length && !txs.length) { clearSel(); shot(P, polyBox(poly), poly); return; }   /* nothing of yours inside: take a screenshot of the area */
    selectItems(P, sts, ims, txs); S.sel.poly = poly; };
  const polyBox = poly => ({x0: Math.min(...poly.map(p => p[0])), y0: Math.min(...poly.map(p => p[1])), x1: Math.max(...poly.map(p => p[0])), y1: Math.max(...poly.map(p => p[1]))});
  /* screenshot of the lassoed area (page, PDF and ink together): copy, save, or put it on a page */
  const shot = async (P, b, poly) => { const pad = 6, x0 = Math.max(0, b.x0 - pad), y0 = Math.max(0, b.y0 - pad), x1 = Math.min(P.pg.w, b.x1 + pad), y1 = Math.min(P.pg.h, b.y1 + pad); if (x1 - x0 < 10 || y1 - y0 < 10) return;
    let c; try { const k = Math.min(2.5, 4000 / P.pg.w), full = await pageImage(P.pg, k); c = document.createElement("canvas"); c.width = Math.round((x1 - x0) * k); c.height = Math.round((y1 - y0) * k); const x = c.getContext("2d");
      if (poly && poly.length > 4) { x.beginPath(); poly.forEach(([px, py], i) => i ? x.lineTo((px - x0) * k, (py - y0) * k) : x.moveTo((px - x0) * k, (py - y0) * k)); x.closePath(); x.clip(); }
      x.drawImage(full, -x0 * k, -y0 * k); } catch (e) { nbToast("Could not take the screenshot"); return; }
    const url = c.toDataURL("image/png"), blob = await new Promise(ok => c.toBlob(ok, "image/png")), pi = book.pages.indexOf(P.pg);
    const sh = sheet(`<h3>📸 Screenshot</h3><div class="elshot"><img src="${url}" alt="Selected area"></div><div class="elmenu"><button id="ss_copy">${I.copy}<span>Copy</span></button><button id="ss_save">${I.pdf}<span>Save image</span></button><button id="ss_put">${I.image}<span>Paste on this page</span></button><button id="ss_new">${I.plus}<span>Put on a new page</span></button></div><div class="small" id="ss_m"></div>`), m = t => $("#ss_m", sh).textContent = t;
    $("#ss_copy", sh).onclick = async () => { try { await navigator.clipboard.write([new ClipboardItem({"image/png": blob})]); m("Copied — paste it into a note, chat or document."); } catch (e) { m("This browser does not allow copying images — use Save image."); } };
    $("#ss_save", sh).onclick = () => { saveBlob(blob, `${book.title.replace(/[^\w -]+/g, "").slice(0, 40) || "Eluna"} p${pi + 1}.png`); m("Saved — check Downloads / Files."); };
    $("#ss_put", sh).onclick = async () => { sh.remove(); pushU(P.pg); const w = x1 - x0, h = y1 - y0, o = {id: uid(), src: url, x: Math.min(P.pg.w - w, x0 + 40), y: Math.min(P.pg.h - h, y0 + 40), w, h}; P.pg.imgs.push(o); await ready([url]); ink(P); save(); selectItems(P, [], [o], []); };
    $("#ss_new", sh).onclick = async () => { sh.remove(); pushPagesU(); const pg = newPage("blank", "white"), w = Math.min(PW * 0.84, (x1 - x0) * 1.6), h = w * (y1 - y0) / (x1 - x0); const fit = Math.min(1, (A4H - 200) / h); pg.imgs.push({id: uid(), src: url, x: (PW - w * fit) / 2, y: 120, w: w * fit, h: h * fit}); book.pages.splice(pi + 1, 0, pg); await ready([url]); build(); save(); setTimeout(() => goPage(pi + 1), 80); nbToast("Added on a new page"); }; };
  selBox.addEventListener("pointerdown", e => { const s = S.sel; if (!s || S.ro || e.target.closest(".elselbar") || e.button > 0) return; e.preventDefault(); e.stopPropagation(); pushU(s.P.pg); const r = s.P.el.getBoundingClientRect(), k = s.P.pg.w / r.width, x0 = e.clientX, y0 = e.clientY, sl0 = scroll.scrollLeft, st0 = scroll.scrollTop, resize = e.target.classList.contains("h"), b0 = itemBox(s.P, s.sts, s.ims, s.txs), hc = resize ? e.target.dataset.c || "br" : "", ax = hc[1] === "l" ? b0.x1 : b0.x0, ay = hc[0] === "t" ? b0.y1 : b0.y0;
    const orig = {sts: s.sts.map(st => st.p.slice()), widths: s.sts.map(st => st.w), ims: s.ims.map(o => ({...o})), txs: s.txs.map(t => ({...t}))};
    let lastEv = null, eraf = 0; selBox.classList.add("drag");
    const mv = ev => { if (ev.pointerId !== e.pointerId) return; lastEv = ev; const dx = (ev.clientX - x0 + scroll.scrollLeft - sl0) * k, dy = (ev.clientY - y0 + scroll.scrollTop - st0) * k;
      delete s.poly;
      if (resize) {
        const bw = Math.max(1, b0.x1 - b0.x0), bh = Math.max(1, b0.y1 - b0.y0);
        const sx = hc[1] === "l" ? -1 : 1, sy = hc[0] === "t" ? -1 : 1;
        const f = Math.max(0.15, Math.min(12, 1 + (sx * dx * bw + sy * dy * bh) / (bw * bw + bh * bh)));
        s.sts.forEach((st, n) => { const o = orig.sts[n]; for (let i = 0; i < o.length; i += 3) { st.p[i] = ax + (o[i] - ax) * f; st.p[i + 1] = ay + (o[i + 1] - ay) * f; } st.w = orig.widths[n] * f; });
        s.ims.forEach((o, n) => { const q = orig.ims[n]; o.x = ax + (q.x - ax) * f; o.y = ay + (q.y - ay) * f; o.w = q.w * f; o.h = q.h * f; }); s.txs.forEach((t, n) => { const q = orig.txs[n]; t.x = ax + (q.x - ax) * f; t.y = ay + (q.y - ay) * f; t.size = (q.size || 30) * f; t.w = q.w * f; }); }
      else { s.sts.forEach((st, n) => { const o = orig.sts[n]; for (let i = 0; i < o.length; i += 3) { st.p[i] = o[i] + dx; st.p[i + 1] = o[i + 1] + dy; } }); s.ims.forEach((o, n) => { o.x = orig.ims[n].x + dx; o.y = orig.ims[n].y + dy; }); s.txs.forEach((t, n) => { t.x = orig.txs[n].x + dx; t.y = orig.txs[n].y + dy; }); }
      ink(s.P); texts(s.P); showSel(); };
    const edge = () => { if (lastEv && !resize) { const sr = scroll.getBoundingClientRect(), H = horiz(), p = H ? lastEv.clientX : lastEv.clientY, lo = H ? sr.left : sr.top, hi = H ? sr.right : sr.bottom, sp = p > hi - 70 ? 14 : p < lo + 70 ? -14 : 0; if (sp) { if (H) scroll.scrollLeft += sp; else scroll.scrollTop += sp; mv(lastEv); } } eraf = requestAnimationFrame(edge); }; eraf = requestAnimationFrame(edge);
    const up = () => { cancelAnimationFrame(eraf); selBox.classList.remove("drag"); removeEventListener("pointermove", mv); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); if (!resize) dropTo(); save(); }; addEventListener("pointermove", mv); addEventListener("pointerup", up); addEventListener("pointercancel", up); });
  /* the selection as one picture (transparent around the ink), for cropping */
  const selPic = s => { const b = itemBox(s.P, s.sts, s.ims, s.txs), pad = 4, k = 2, w = b.x1 - b.x0 + pad * 2, h = b.y1 - b.y0 + pad * 2, c = document.createElement("canvas"); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k); const x = c.getContext("2d");
    x.translate((pad - b.x0) * k, (pad - b.y0) * k); drawInk(x, {strokes: s.sts, imgs: s.ims, texts: []}, k); drawTexts(x, {texts: s.txs}, k); return {src: c.toDataURL("image/png"), x: b.x0 - pad, y: b.y0 - pad, w, h}; };
  const rotPic = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => { const c = document.createElement("canvas"); c.width = i.naturalHeight; c.height = i.naturalWidth; const x = c.getContext("2d"); x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(i, 0, 0); ok(c.toDataURL(/^data:image\/png/.test(src) ? "image/png" : "image/jpeg", 0.9)); }; i.onerror = no; i.src = src; });
  selBox.querySelector(".elselbar").onclick = async e => { const a = (e.target.closest("[data-a]") || {}).dataset; if (!a || !a.a || !S.sel) return; const s = S.sel;
    if (a.a === "crop") { const one = s.ims.length === 1 && !s.sts.length && !s.txs.length, pic = one ? null : selPic(s), out = await nbCrop(one ? s.ims[0].src : pic.src); if (!out) return; pushU(s.P.pg);
      if (one) { const o = s.ims[0]; o.src = out.src; o.h = o.w * out.h / out.w; await ready([o.src]); }
      else { /* writing, photos and text become one picture, cropped the way you chose */ const o = {id: uid(), src: out.src, x: pic.x, y: pic.y, w: pic.w * out.w / (pic.w * 2), h: pic.h * out.h / (pic.h * 2)}; s.P.pg.strokes = s.P.pg.strokes.filter(x => !s.sts.includes(x)); s.P.pg.imgs = s.P.pg.imgs.filter(x => !s.ims.includes(x)); s.P.pg.texts = s.P.pg.texts.filter(x => !s.txs.includes(x)); s.P.pg.imgs.push(o); await ready([o.src]); S.sel = {P: s.P, sts: [], ims: [o], txs: []}; }
      ink(s.P); texts(s.P); showSel(); save(); return; }
    if (a.a === "rot") { const o = s.ims[0]; pushU(s.P.pg); o.src = await rotPic(o.src); const cx = o.x + o.w / 2, cy = o.y + o.h / 2, w = o.w; o.w = o.h; o.h = w; o.x = cx - o.w / 2; o.y = cy - o.h / 2; await ready([o.src]); ink(s.P); showSel(); save(); return; }
    if (a.a === "shot") { shot(s.P, s.poly ? polyBox(s.poly) : itemBox(s.P, s.sts, s.ims, s.txs), s.poly); return; }
    if (a.a === "copy" || a.a === "cut") { CLIP = JSON.parse(JSON.stringify({sts: s.sts, ims: s.ims, txs: s.txs, b: itemBox(s.P, s.sts, s.ims, s.txs)}));
      if (a.a === "cut") { pushU(s.P.pg); s.P.pg.strokes = s.P.pg.strokes.filter(x => !s.sts.includes(x)); s.P.pg.imgs = s.P.pg.imgs.filter(x => !s.ims.includes(x)); s.P.pg.texts = s.P.pg.texts.filter(x => !s.txs.includes(x)); clearSel(); ink(s.P); texts(s.P); save(); }
      pasteUpd(); nbToast((a.a === "cut" ? "Cut" : "Copied") + " — tap 📋 Paste, then tap where it should go (any page, any notebook)"); return; }
    pushU(s.P.pg);
    if (a.a === "del") { s.P.pg.strokes = s.P.pg.strokes.filter(x => !s.sts.includes(x)); s.P.pg.imgs = s.P.pg.imgs.filter(x => !s.ims.includes(x)); s.P.pg.texts = s.P.pg.texts.filter(x => !s.txs.includes(x)); clearSel(); }
    else if (a.a === "dup") { const c = o => JSON.parse(JSON.stringify(o)), sh = (o, k) => { if (o.p) for (let i = 0; i < o.p.length; i += 3) { o.p[i] += k; o.p[i + 1] += k; } else { o.x += k; o.y += k; } return o; };
      const g = uid(), ns = s.sts.map(x => sh(c(x), 40)), ni = s.ims.map(x => Object.assign(sh(c(x), 40), {id: uid()})), nt = s.txs.map(x => Object.assign(sh(c(x), 40), {id: uid()})); [...ns, ...ni, ...nt].forEach(o => o.g = g); s.P.pg.strokes.push(...ns); s.P.pg.imgs.push(...ni); s.P.pg.texts.push(...nt); S.sel = {P: s.P, sts: ns, ims: ni, txs: nt}; }
    else if (a.a === "col") { s.sts.forEach(st => { if (st.t === "pen") st.c = S.pen; else if (st.t === "hl") st.c = S.hl; }); s.txs.forEach(t => { if (!t.emoji) t.c = S.pen; }); }
    ink(s.P); texts(s.P); showSel(); save(); };
  /* ---- drawing, with palm rejection, S Pen button / eraser end, Pencil hover, pinch zoom and finger scrolling ---- */
  const touches = new Map(), rejectedTouches = new Set(); let pinch = null, vel = null, lastT = 0, fling = 0, hoverT = 0, activePen = null, disposedInput = false;
  const setPencil = on => { S.pencil = on; store.set("nbPencil", on); };
  // Anchor zoom to a page coordinate, so margins and inter-page gaps never drift.
  const zoomAnchor = (cx, cy) => {
    let P = pageAt(cx, cy)[0];
    if (!P) P = pages[curPage()];
    if (!P) return null;
    const r = P.el.getBoundingClientRect();
    return {P, x: (cx - r.left) / r.width, y: (cy - r.top) / r.height};
  };
  const setZoom = (z, cx, cy, anchor) => {
    const next = Math.max(0.4, Math.min(4, z));
    if (!Number.isFinite(next) || cur || disposedInput) return;
    anchor = anchor || zoomAnchor(cx, cy);
    if (!anchor) return;
    S.zoom = next; pages.forEach(size);
    const r = anchor.P.el.getBoundingClientRect();
    scroll.scrollLeft += r.left + anchor.x * r.width - cx;
    scroll.scrollTop += r.top + anchor.y * r.height - cy;
    clearTimeout(setZoom.t); setZoom.t = setTimeout(() => { if (!disposedInput) relayout(); }, 160);
    $("#el_zv").textContent = Math.round(S.zoom * 100) + "%";
    if (S.sel) showSel();
  };
  const beginPinch = () => {
    lpClear(); vel = null;
    const [a, b] = [...touches.values()], cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    pinch = {d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), z: S.zoom, anchor: zoomAnchor(cx, cy)};
  };
  const movePinch = () => {
    const [a, b] = [...touches.values()];
    setZoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2, pinch.anchor);
  };
  $("#el_zi").onclick = () => { const r = scroll.getBoundingClientRect(); setZoom(S.zoom * 1.25, r.left + r.width / 2, r.top + r.height / 2); }; $("#el_zo").onclick = () => { const r = scroll.getBoundingClientRect(); setZoom(S.zoom / 1.25, r.left + r.width / 2, r.top + r.height / 2); };
  const eraseAt = (P, x, y) => { const R = 12 + S.size * 3, n0 = P.pg.strokes.length; P.pg.strokes = P.pg.strokes.filter(st => { if (st.t === "px") return true; const p = st.p; for (let i = 0; i < p.length; i += 3) { if (Math.hypot(p[i] - x, p[i + 1] - y) < R + st.w / 2) return false; if (i >= 3) { const ax = p[i - 3], ay = p[i - 2], dx = p[i] - ax, dy = p[i + 1] - ay, den = dx * dx + dy * dy, k = den ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / den)) : 0; if (Math.hypot(ax + k * dx - x, ay + k * dy - y) < R + st.w / 2) return false; } } return true; });
    const t0 = P.pg.texts.length; P.pg.texts = P.pg.texts.filter(t => !(t.emoji && Math.hypot(t.x + 30 - x, t.y + 30 - y) < R + 30)); if (P.pg.texts.length !== t0) texts(P); if (P.pg.strokes.length !== n0) ink(P); };
  /* S Pen side button or a stylus eraser end: does what the Pen settings say (eraser by default) */
  const toolFor = e => (e.pointerType === "pen" && ((e.buttons & 32) || (e.buttons & 2))) ? (e.buttons & 32 ? "eraser" : PEN().btn) : S.tool;
  /* ---- press and hold on PDF text, with any tool, to select a word ---- */
  let lp = null;
  const lpClear = e => { if (lp && (!e || e.pointerId === lp.id)) { clearTimeout(lp.t); lp = null; } };
  const caretAt = (cx, cy, L) => { L.style.pointerEvents = "auto"; L.style.zIndex = 20; let rg = null;
    try { if (document.caretRangeFromPoint) rg = document.caretRangeFromPoint(cx, cy); else if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(cx, cy); if (p) { rg = document.createRange(); rg.setStart(p.offsetNode, p.offset); } } } catch (e) {}
    L.style.pointerEvents = L.style.zIndex = ""; return rg && L.contains(rg.startContainer) && rg.startContainer.nodeType === 3 ? rg : null; };
  const extendSel = (cx, cy) => { const d = S.selDrag, rg = caretAt(cx, cy, d.L); if (!rg) return; const tn = rg.startContainer, s = tn.data, wc = /[\p{L}\p{N}'’-]/u; let o = Math.min(rg.startOffset, s.length);
    const fwd = tn === d.tn ? o >= d.a : !!(d.tn.compareDocumentPosition(tn) & Node.DOCUMENT_POSITION_FOLLOWING), sel = getSelection();
    try { if (fwd) { while (o < s.length && wc.test(s[o])) o++; sel.setBaseAndExtent(d.tn, d.a, tn, o); } else { while (o > 0 && wc.test(s[o - 1])) o--; sel.setBaseAndExtent(d.tn, d.b, tn, o); } } catch (e) {} };
  const wordAt = async (cx, cy, pid) => { if (S.penDown && pid == null) return; const [P] = pageAt(cx, cy); if (!P || !P.b) return; if (cur) cancel();
    if (!P.tl) await textLayer(P); const L = P.el.querySelector(".eltl"), rg = caretAt(cx, cy, L);
    if (!rg) { if (P.pg.type !== "paper") nbToast(L.dataset.empty ? "This page is a scan — More ⋯ › Recognise text, then hold on a word." : "Hold right on a word to select it."); return; }
    const tn = rg.startContainer, s = tn.data, wc = /[\p{L}\p{N}'’-]/u; let a = Math.min(rg.startOffset, s.length), b = a;
    while (a > 0 && wc.test(s[a - 1])) a--; while (b < s.length && wc.test(s[b])) b++; if (a === b) return;
    const r2 = document.createRange(); r2.setStart(tn, a); r2.setEnd(tn, b); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r2); S.selDrag = pid == null ? null : {id: pid, P, L, tn, a, b}; try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} };
  const down = e => {
    if (disposedInput) return;
    cancelAnimationFrame(fling); fling = 0; vel = null;
    closePop();
    if (e.pointerType === "touch" && (S.penDown || (S.pencil && (Math.max(e.width || 0, e.height || 0) > 34 || performance.now() - (S.lastPen || -2000) < 350)))) { rejectedTouches.add(e.pointerId); return; }
    if (e.pointerType === "pen") {
      S.lastPen = performance.now();
      if (cur && cur.id !== e.pointerId) cancel();
      touches.forEach((_, id) => rejectedTouches.add(id)); touches.clear(); pinch = null;
    }
    if (cur && e.pointerType !== "touch") return;
    if (e.pointerType === "pen" && !S.pencil && PEN().palm) { setPencil(true); $("#el_palm").classList.toggle("on", true); nbToast("Pen detected — palm rejection on: the pen writes, fingers scroll and zoom"); }
    if (S.ro || S.tool === "select") { if (e.pointerType === "touch") { touches.set(e.pointerId, {x: e.clientX, y: e.clientY}); if (touches.size === 2) { const [a, b] = [...touches.values()]; beginPinch(); } } return; }   /* native scrolling and text selection */
    if (e.target.closest && e.target.closest(".elt:not(.emo)")) return;   /* typing in a text box */
    if (S.paste && CLIP) { const [P, r] = pageAt(e.clientX, e.clientY); if (!P || !P.i) return; e.preventDefault(); const [x, y] = toPage(P, r, e.clientX, e.clientY); doPaste(P, x, y); return; }
    { const gs = getSelection(), an = gs.anchorNode; if (gs.rangeCount && an && (an.nodeType === 1 ? an : an.parentElement).closest(".eltl")) gs.removeAllRanges(); }
    const palmy = e.pointerType === "touch" && (Math.max(e.width || 0, e.height || 0) > 34 || performance.now() - (S.lastPen || 0) < 1500);
    lpClear(); if (SET().hold && !S.penDown && !palmy && !S.paste && touches.size < 1 && (e.pointerType === "pen" ? ["hl", "lasso"] : ["pen", "hl", "eraser", "lasso"]).includes(S.tool)) { const x0 = e.clientX, y0 = e.clientY; lp = {id: e.pointerId, x: x0, y: y0, t: setTimeout(() => { lp = null; wordAt(x0, y0, e.pointerId); }, 520)}; }
    const finger = e.pointerType === "touch", drawer = !finger || (!S.pencil && touches.size === 0);
    if (finger) { touches.set(e.pointerId, {x: e.clientX, y: e.clientY}); try { scroll.setPointerCapture(e.pointerId); } catch (_) {} if (S.penDown) return;
      if (!drawer || touches.size > 1) { if (cur && touches.size > 1) cancel(); if (touches.size === 2) { const [a, b] = [...touches.values()]; beginPinch(); } lastT = performance.now(); return; } }
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const t = toolFor(e);
    if (t === "laser") { e.preventDefault(); if (e.pointerType === "pen") { S.penDown = true; activePen = e.pointerId; } try { scroll.setPointerCapture(e.pointerId); } catch (_) {} clearTimeout(lzT); cur = {id: e.pointerId, laser: 1}; lpts.push({...wxy(e), t: performance.now(), br: true, live: S.sub.laser !== "dot"}); kick(); return; }
    const [P, r] = pageAt(e.clientX, e.clientY); if (!P || !P.i) return; e.preventDefault(); try { scroll.setPointerCapture(e.pointerId); } catch (er) {}
    if (e.pointerType === "pen") { S.penDown = true; activePen = e.pointerId; }
    const [x, y] = toPage(P, r, e.clientX, e.clientY);
    if (S.emoji) { pushU(P.pg); const t2 = {id: uid(), emoji: 1, t: S.emoji, x: x - 30, y: y - 30, w: 90, size: 60}; P.pg.texts.push(t2); P.el.querySelector(".elx").appendChild(textEl(P, t2)); S.emoji = null; save(); return; }
    if (t === "text") { pushU(P.pg); const left = Math.max(16, Math.min(x, P.pg.w - 300)), t2 = {id: uid(), x: left, y: Math.max(16, Math.min(y, P.pg.h - 80)), w: Math.max(120, Math.min(640, P.pg.w - left - 24)), t: "", size: Math.round(20 + S.size * 4), c: S.pen}; P.pg.texts.push(t2); const d = textEl(P, t2); P.el.querySelector(".elx").appendChild(d); lpClear(); d.focus(); setTimeout(() => { if (document.activeElement !== d) d.focus(); }, 60); return; }
    if (t === "lasso") { const hi = [...P.pg.imgs].reverse().find(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h), ht = hi ? null : [...P.pg.texts].reverse().find(q => x >= q.x && x <= q.x + (q.emoji ? (q.size || 60) * 1.3 : q.w) && y >= q.y && y <= q.y + (q.size || 30) * 1.6);
      const hs = hi || ht ? null : [...P.pg.strokes].reverse().find(st => { if (st.t === "px") return false; for (let i = 0; i < st.p.length; i += 3) if (Math.hypot(st.p[i] - x, st.p[i + 1] - y) < Math.max(12, st.w * 0.8)) return true; return false; }), hit = hi || ht || hs;
      if (hit) { const g = hit.g; if (g) selectItems(P, P.pg.strokes.filter(q => q.g === g), P.pg.imgs.filter(q => q.g === g), P.pg.texts.filter(q => q.g === g)); else selectItems(P, hs ? [hs] : [], hi ? [hi] : [], ht ? [ht] : []); return; }
      clearSel(); cur = {id: e.pointerId, lasso: 1, P, r, start: wxy(e)}; lassoPath = [wxy(e)]; kick(); return; }
    if (t === "hl" && P.pg.type !== "paper" && !P.tl) textLayer(P);
    const beforeDraw = snap(P.pg), redoBefore = redo.slice(); pushU(P.pg);
    if (t === "eraser" && S.sub.eraser === "stroke") { cur = {id: e.pointerId, P, r, erase: 1, beforeDraw, redoBefore}; eraseAt(P, x, y); ring = {...wxy(e), r: (12 + S.size * 3) * r.width / P.pg.w}; kick(); return; }
    const pr = e.pointerType === "pen" && PEN().pressure ? e.pressure || .5 : .55, px = t === "eraser", w = px ? (S.sub.eraser === "precision" ? 8 : 34 + S.size * 6) : t === "hl" ? 18 + S.size * 6 : 1.2 + S.size * 1.15;
    cur = {id: e.pointerId, P, r, beforeDraw, redoBefore, st: {t: px ? "px" : t === "hl" ? "hl" : "pen", c: t === "hl" ? S.hl : S.pen, w, p: [+x.toFixed(1), +y.toFixed(1), pr]}, drawn: 1, ctx: P.i.getContext("2d", {desynchronized: true})};
    // Snapshot existing ink once, rather than replay every previous stroke per frame.
    if (cur.st.t !== "pen") { cur.backdrop = document.createElement("canvas"); cur.backdrop.width = P.i.width; cur.backdrop.height = P.i.height; cur.backdrop.getContext("2d").drawImage(P.i, 0, 0); }
    if (px) { ring = {...wxy(e), r: w / 2 * r.width / P.pg.w}; kick(); }
    cur.snap = !!S.ruler && t === "pen"; if (cur.st.t === "pen") stroke(cur.ctx, cur.st, sc() * cvSize.d(P));
  };
  cvSize.d = P => P && P.i ? P.i.width / Math.max(1, pw()) : Math.min(dpr(), 4096 / Math.max(1, pw()));
  const move = e => {
    if (disposedInput || rejectedTouches.has(e.pointerId)) return;
    if (S.selDrag && e.pointerId === S.selDrag.id) { e.preventDefault(); extendSel(e.clientX, e.clientY); return; }
    if (e.pointerType === "pen") S.lastPen = performance.now();
    if (lp && e.pointerId === lp.id && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > 9) lpClear();
    if (e.pointerType === "pen" && !cur && e.buttons === 0 && !S.ro && PEN().hover && ["pen", "hl"].includes(S.tool)) { const p = wxy(e); hover = {...p, c: S.tool === "hl" ? S.hl : S.pen, r: (S.tool === "hl" ? 9 + S.size * 3 : 1 + S.size) * sc()}; kick(); clearTimeout(hoverT); hoverT = setTimeout(() => { hover = null; kick(); }, 400); return; }
    if (e.pointerType === "touch" && touches.has(e.pointerId) && (S.ro || S.tool === "select")) { touches.set(e.pointerId, {x: e.clientX, y: e.clientY}); if (touches.size === 2 && pinch) { e.preventDefault(); movePinch(); } return; }
    if (e.pointerType === "touch" && touches.has(e.pointerId)) { const t0 = touches.get(e.pointerId), now = performance.now(); touches.set(e.pointerId, {x: e.clientX, y: e.clientY});
      if (!cur || touches.size > 1) {
        if (S.penDown) return; e.preventDefault();
        if (touches.size === 2 && pinch) { movePinch(); lastT = now; return; }
        const dx = e.clientX - t0.x, dy = e.clientY - t0.y, dt = Math.max(8, now - lastT);
        scroll.scrollLeft -= dx; scroll.scrollTop -= dy;
        vel = {x: dx / dt, y: dy / dt}; lastT = now; return;
      }
    }
    if (!cur || cur.id !== e.pointerId || (e.pointerType === "touch" && S.penDown)) return; e.preventDefault();
    if (cur.laser) { const w = W.getBoundingClientRect(), evs = e.getCoalescedEvents ? e.getCoalescedEvents() : []; const live = S.sub.laser !== "dot"; (evs.length ? evs : [e]).forEach(ev => lpts.push({x: ev.clientX - w.left, y: ev.clientY - w.top, t: performance.now(), live})); kick(); return; }
    if (cur.lasso) { const p = wxy(e); if (S.sub.lasso === "rect") { const s0 = cur.start; lassoPath = [s0, {x: p.x, y: s0.y}, p, {x: s0.x, y: p.y}]; } else lassoPath.push(p); kick(); return; }
    if (cur.erase) { const [x, y] = toPage(cur.P, cur.r, e.clientX, e.clientY); eraseAt(cur.P, x, y); ring = {...wxy(e), r: ring.r}; kick(); return; }
    if (cur.st.t === "px") { ring = {...wxy(e), r: ring.r}; kick(); }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [], pen = e.pointerType === "pen" && PEN().pressure, k = cur.st.t === "pen" ? Math.max(0, Math.min(.85, SET().smooth)) : 0.25;
    for (const ev of (evs.length ? evs : [e])) { let cx = ev.clientX, cy = ev.clientY; if (cur.snap) { const s2 = snapRuler(cx, cy); if (s2) [cx, cy] = s2; }
      const [x, y] = toPage(cur.P, cur.r, cx, cy), p = cur.st.p, n = p.length, lx = p[n - 3], ly = p[n - 2], kk = cur.snap ? 0 : k;
      const sx = lx + (x - lx) * (1 - kk), sy = ly + (y - ly) * (1 - kk), sp = p[n - 1] * .7 + (pen ? ev.pressure || .5 : .55) * .3; if (Math.abs(sx - lx) + Math.abs(sy - ly) < .5) continue; p.push(+sx.toFixed(1), +sy.toFixed(1), +sp.toFixed(3)); }
    if (!cur.raf) cur.raf = requestAnimationFrame(() => { if (!cur || !cur.st) return; cur.raf = 0; const s = sc() * cvSize.d(cur.P);
      if (cur.st.t === "pen") { const n = cur.st.p.length / 3; if (n > cur.drawn) { stroke(cur.ctx, cur.st, s, Math.max(2, cur.drawn)); cur.drawn = n; } } else { cur.ctx.clearRect(0, 0, cur.ctx.canvas.width, cur.ctx.canvas.height); cur.ctx.drawImage(cur.backdrop, 0, 0); stroke(cur.ctx, cur.st, s); } });
  };
  const cancel = () => {
    if (!cur) return;
    const c = cur; cur = null;
    if (c.raf) cancelAnimationFrame(c.raf);
    if (c.beforeDraw != null) { Object.assign(c.P.pg, JSON.parse(c.beforeDraw)); undo.pop(); redo = c.redoBefore; if (window.__eluUd) __eluUd(); }
    if (c.backdrop) c.backdrop.width = c.backdrop.height = 0;
    ring = null; lassoPath = null; if (c.laser) laserOff(); kick();
    if (c.P) { ink(c.P); texts(c.P); }
  };
  const up = e => {
    if (rejectedTouches.delete(e.pointerId)) return;
    lpClear(e);
    if (e.pointerType === "pen" && activePen === e.pointerId) { S.penDown = false; activePen = null; }
    if (S.selDrag && e.pointerId === S.selDrag.id) { S.selDrag = null; touches.delete(e.pointerId); return; }
    const ownsStroke = cur && cur.id === e.pointerId;
    if (e.pointerType === "touch") {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinch = null;
      if (!cur && !touches.size && !S.penDown && !S.ro && S.tool !== "select" && e.type !== "pointercancel" && vel && performance.now() - lastT < 100 && Math.hypot(vel.x, vel.y) > .25) {
        let vx = Math.max(-3, Math.min(3, vel.x)), vy = Math.max(-3, Math.min(3, vel.y)), previous = performance.now();
        const step = now => {
          if (disposedInput || cur || touches.size || S.penDown) return;
          const dt = Math.min(32, now - previous); previous = now;
          const x = scroll.scrollLeft, y = scroll.scrollTop;
          scroll.scrollLeft -= vx * dt; scroll.scrollTop -= vy * dt;
          const decay = Math.pow(.94, dt / 16.67); vx *= decay; vy *= decay;
          if (Math.hypot(vx, vy) > .025 && (scroll.scrollLeft !== x || scroll.scrollTop !== y)) fling = requestAnimationFrame(step);
        };
        fling = requestAnimationFrame(step);
      }
      vel = null; lastT = performance.now();
    }
    if (!ownsStroke) return;
    const c = cur; cur = null; if (c.raf) cancelAnimationFrame(c.raf);
    if (c.backdrop) c.backdrop.width = c.backdrop.height = 0;
    if (c.laser) { laserOff(); return; }
    if (c.lasso) { lassoFinish(c.P, c.r); return; }
    ring = null; kick();
    if (c.erase) { save(); return; }
    if (e.type !== "pointercancel" && c.st && e.clientX != null && !c.snap) { const [x, y] = toPage(c.P, c.r, e.clientX, e.clientY), p = c.st.p; if (Math.abs(x - p[p.length - 3]) + Math.abs(y - p[p.length - 2]) > .5) p.push(+x.toFixed(1), +y.toFixed(1), p[p.length - 1]); }
    if (c.st.t === "pen") c.st.e = 1;   /* finished: redraw so the end tapers too */
    if (c.st.t === "hl") hlSnap(c.P, c.st);
    c.P.pg.strokes.push(c.st); ink(c.P);
    save();
  };
  /* no system text selection or long-press menu while writing — only the select tool, read-only mode and text boxes select */
  const selOK = e => { const n = e.target && (e.target.nodeType === 1 ? e.target : e.target.parentElement); return S.ro || S.tool === "select" || (n && n.closest(".elt")); };
  scroll.addEventListener("selectstart", e => { if (!selOK(e)) e.preventDefault(); });
  scroll.addEventListener("contextmenu", e => { if (!selOK(e)) e.preventDefault(); });
  scroll.addEventListener("pointerdown", down); scroll.addEventListener("pointermove", move, {passive: false}); scroll.addEventListener("pointerup", up);
  const onCancel = e => {
    if (cur && cur.id === e.pointerId && e.pointerType === "touch") cancel();
    up(e);
  };
  scroll.addEventListener("pointercancel", onCancel);
  // A release outside the page, a lost capture, or an app switch must never leave the pen stuck down.
  const onLostCapture = e => { if (cur && cur.id === e.pointerId) up({pointerId: e.pointerId, pointerType: activePen === e.pointerId ? "pen" : "touch", type: "pointercancel"}); };
  const endInput = () => {
    if (cur) up({pointerId: cur.id, pointerType: activePen === cur.id ? "pen" : "touch", type: "pointercancel"});
    S.penDown = false; activePen = null; touches.clear(); rejectedTouches.clear(); pinch = null; vel = null;
    lpClear(); cancelAnimationFrame(fling); hover = null;
  };
  const onInputHidden = () => { if (document.hidden) endInput(); };
  scroll.addEventListener("lostpointercapture", onLostCapture);
  addEventListener("pointerup", up); addEventListener("pointercancel", onCancel); addEventListener("blur", endInput);
  document.addEventListener("visibilitychange", onInputHidden);
  COMM.unsub.push(() => {
    endInput(); disposedInput = true; clearTimeout(setZoom.t); clearTimeout(hoverT); clearTimeout(lzT); cancelAnimationFrame(lraf);
    removeEventListener("pointerup", up); removeEventListener("pointercancel", onCancel); removeEventListener("blur", endInput);
    document.removeEventListener("visibilitychange", onInputHidden);
  });
  scroll.addEventListener("wheel", e => { if (e.ctrlKey) { e.preventDefault(); setZoom(S.zoom * (e.deltaY < 0 ? 1.1 : .9), e.clientX, e.clientY); } }, {passive: false});
  ["gesturestart", "gesturechange"].forEach(g => scroll.addEventListener(g, e => { if (!S.ro && S.tool !== "select") e.preventDefault(); }));
  document.addEventListener("pointerdown", e => { if (!pop.hidden && !e.target.closest(".elpop,.eltb")) closePop(); }, true);
  /* highlight the words selected in a PDF text layer (called from the word lookup bar) */
  E.highlightSelection = () => { if (S.ro) return; const s = getSelection(); if (!s.rangeCount) return; const rects = [...s.getRangeAt(0).getClientRects()].filter(r => r.width > 1); if (!rects.length) return;
    const [P] = pageAt(rects[0].left + 1, rects[0].top + 1); if (!P) return; const r = P.el.getBoundingClientRect(); pushU(P.pg);
    rects.forEach(q => { const [x0, y0] = toPage(P, r, q.left, q.top), [x1, y1] = toPage(P, r, q.right, q.bottom), ym = (y0 + y1) / 2; P.pg.strokes.push({t: "hl", c: S.hl, w: (y1 - y0) * 1.05, p: [x0, ym, .5, x1, ym, .5]}); });
    s.removeAllRanges(); ink(P); save(); nbToast("Highlighted"); };
  /* ---- keyboard, resize, cleanup ---- */
  const onKey = e => {
    const target = e.target.closest ? e.target : null;
    if (!target || target.closest("input,textarea") || (target.closest("[contenteditable]") && !target.closest(".elt"))) return;
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (key === "z" || key === "y")) { e.preventDefault(); if (!S.ro) (key === "y" || e.shiftKey) ? restore(redo, undo) : restore(undo, redo); }
    else if (!S.ro && e.key === "Delete" && S.sel && !target.isContentEditable) selBox.querySelector('[data-a="del"]').click();
  };
  const onResize = () => { clearTimeout(onResize.t); onResize.t = setTimeout(() => { relayout(); tbPlace(); rulDraw(); }, 160); };
  addEventListener("keydown", onKey); addEventListener("resize", onResize);
  COMM.unsub.push(() => { removeEventListener("paste", onPaste); removeEventListener("keydown", onKey); removeEventListener("resize", onResize); io.disconnect(); closed = true;
    document.removeEventListener("visibilitychange", onHidden); removeEventListener("pagehide", onPageHide); removeEventListener("beforeunload", onBeforeUnload);
    flushSave().then(ok => { if (ok) thumbFor(book); }); delete E.highlightSelection; });
  /* ---- go ---- */
  await ready(book.pages.flatMap(p => [p.bg, ...p.imgs.map(i => i.src)]));
  S.paste = false; look(); build(); tbUpd(); tbPlace(); navUpd(); pasteUpd(); if (revision) flushSave();
  if (book.pages.some(p => p.type === "pdf")) pdfjs().catch(e => nbToast(e.message));
}

/* ---------- styles ---------- */
const css = document.createElement("style");
css.textContent = `
.elib{max-width:1100px;margin:0 auto}
.elhead{display:flex;align-items:center;gap:14px;margin:4px 0 14px}.elhead h1{margin:0}.elhead p{margin:2px 0 0;color:var(--muted);font-size:14px}.elhead>.iconbtn{margin-left:auto}
.ellogo{width:54px;height:54px;border-radius:17px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#6366f1,#a855f7 60%,#ec4899);box-shadow:0 12px 26px -12px #7c3aed;flex:none}.ellogo svg{width:28px;height:28px}
.elacts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.elacts .btn svg{width:17px;height:17px;vertical-align:-3px}
.eltags{display:flex;gap:6px;overflow-x:auto;margin:-2px 0 12px;scrollbar-width:none}.eltags .chip.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.elgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:18px 16px}
.elcard{position:relative;animation:foldIn .4s both;animation-delay:var(--d,0ms)}.elcard a{display:flex;flex-direction:column;gap:3px;text-decoration:none;color:var(--ink)}.elcard b{font-size:14.5px;margin-top:8px;line-height:1.3}.elcard small{font-size:12px;color:var(--muted)}
.elcm{position:absolute;top:6px;right:6px;width:30px;height:30px;background:rgba(255,255,255,.9);color:#111;border-radius:50%}
.elcov{position:relative;aspect-ratio:1/1.32;border-radius:5px 13px 13px 5px;overflow:hidden;background:radial-gradient(120% 80% at 85% 0%,rgba(255,255,255,.28),transparent 55%),linear-gradient(150deg,var(--a),var(--b));box-shadow:inset -1px 0 0 rgba(255,255,255,.25),3px 0 0 -1px #f4f1ea,5px 0 0 -2px #e6e1d6,0 2px 4px rgba(0,0,0,.08),0 18px 30px -18px rgba(0,0,0,.6);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.elcard a:hover .elcov{transform:translateY(-5px) rotate(-.8deg);box-shadow:inset -1px 0 0 rgba(255,255,255,.25),3px 0 0 -1px #f4f1ea,5px 0 0 -2px #e6e1d6,0 4px 8px rgba(0,0,0,.08),0 26px 36px -18px rgba(0,0,0,.6)}.elcard a:active .elcov{transform:scale(.97)}.elcov img{position:absolute;inset:7% 8% 7% 14%;width:78%;height:86%;object-fit:cover;border-radius:3px;box-shadow:0 4px 10px rgba(0,0,0,.25);background:#fff}
.elspine{position:absolute;left:0;top:0;bottom:0;width:9%;background:linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,.08) 70%,rgba(255,255,255,.18))}.elcovic{position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.92)}.elcovic svg{width:36%;height:36%;filter:drop-shadow(0 4px 8px rgba(0,0,0,.25))}
.elcov em{position:absolute;right:8px;bottom:8px;font:800 9.5px var(--ui-font);font-style:normal;color:#fff;background:rgba(0,0,0,.32);backdrop-filter:blur(6px);padding:3px 8px;border-radius:99px;letter-spacing:.08em}
.elcont{display:flex;align-items:center;gap:6px;overflow-x:auto;margin:0 0 12px;scrollbar-width:none;padding:2px 0}.elcont::-webkit-scrollbar{display:none}.elcont>span{font:800 11px var(--ui-font);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:none;margin-right:2px}
.elchip{display:flex;align-items:center;gap:7px;flex:none;max-width:220px;padding:7px 13px 7px 9px;border-radius:99px;background:var(--panel);border:1px solid var(--line);color:var(--ink);text-decoration:none;font:600 13px var(--ui-font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 12px -10px rgba(0,0,0,.5);transition:transform .2s,border-color .2s}.elchip:hover{transform:translateY(-1px);border-color:#a78bfa}.elchip i{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;flex:none}.elchip svg{width:14px;height:14px}
.elsheet .sheetin{position:relative}
.elsec{display:flex;align-items:center;margin:16px 2px 10px}.elsec b{font:800 11.5px var(--ui-font);letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}
.elfolds{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:6px}
.elfold{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:14px 14px 12px;border:0;border-radius:18px;cursor:pointer;text-align:left;color:#fff;background:radial-gradient(120% 90% at 100% 0%,rgba(255,255,255,.28),transparent 55%),linear-gradient(150deg,var(--a),var(--b));box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 14px 26px -16px rgba(0,0,0,.6);animation:foldIn .4s both;animation-delay:var(--d,0ms);transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s}
.elfold:hover{transform:translateY(-3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 20px 30px -16px rgba(0,0,0,.6)}.elfold:active{transform:scale(.97)}
.elfold b{font:700 15px var(--ui-font);margin-top:10px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.elfold small{font-size:12px;opacity:.85}
.elfic{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.22);backdrop-filter:blur(4px)}.elfic svg{width:22px;height:22px}.elfe{font-size:22px;line-height:1}
.elfics{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;margin:6px 0 12px}.elfics button{height:40px;font-size:21px;border:0;border-radius:11px;background:var(--panel2);cursor:pointer;transition:transform .2s}.elfics button:hover{transform:scale(1.08)}.elfics button.on{background:var(--accent-soft);box-shadow:inset 0 0 0 2px #8b5cf6}
@media (max-width:500px){.elfics{grid-template-columns:repeat(6,1fr)}}
.elfnew{background:var(--panel);color:var(--ink);border:1.5px dashed var(--line);box-shadow:none}.elfnew .elfic{background:var(--accent-soft);color:var(--accent)}.elfnew small{color:var(--muted);opacity:1}.elfnew:hover{border-color:var(--accent)}
.elfhead{display:flex;align-items:center;gap:12px;padding:12px 12px 12px 8px;margin:4px 0 14px;border-radius:20px;color:#fff;background:radial-gradient(120% 90% at 100% 0%,rgba(255,255,255,.25),transparent 55%),linear-gradient(130deg,var(--a),var(--b));box-shadow:0 14px 28px -18px rgba(0,0,0,.6)}
.elfhead .iconbtn{color:#fff;background:rgba(255,255,255,.16);flex:none}.elfhead>div{flex:1;min-width:0;display:flex;flex-direction:column}.elfhead b{font:800 18px var(--ui-font);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.elfhead small{opacity:.85;font-size:12.5px}.elsx{position:absolute;right:10px;top:10px}
.elcovs{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 12px}.elcv{width:34px;height:44px;border-radius:4px 8px 8px 4px;border:0;background:linear-gradient(145deg,var(--a),var(--b));cursor:pointer;box-shadow:0 4px 10px -6px rgba(0,0,0,.5);transition:transform .15s}.elcv.on{outline:3px solid var(--accent);outline-offset:2px;transform:translateY(-2px)}
.eltpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:12px 10px;margin:8px 0}.eltpl{display:flex;flex-direction:column;align-items:center;gap:5px;border:2px solid transparent;background:none;border-radius:12px;padding:5px;cursor:pointer;color:var(--ink);font:600 11.5px var(--ui-font)}
.eltpl canvas{width:84px;height:119px;border-radius:6px;box-shadow:0 0 0 1px rgba(15,23,42,.06),0 6px 14px -6px rgba(0,0,0,.4);transition:transform .25s cubic-bezier(.3,1.5,.5,1)}.eltpl:hover canvas{transform:translateY(-3px)}.eltpl.on canvas{box-shadow:0 0 0 2.5px #8b5cf6,0 10px 20px -8px rgba(124,58,237,.6)}.eltpl.on{border-color:var(--accent);background:var(--accent-soft)}
.elpapers{display:flex;gap:10px;margin:4px 0 12px}.elpap{width:32px;height:32px;border-radius:50%;border:2px solid var(--line);background:var(--p);cursor:pointer}.elpap.on{outline:3px solid var(--accent);outline-offset:2px}
.elpick{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:12px;max-height:50vh;overflow:auto;margin:8px 0}.elpk{text-decoration:none;color:var(--ink);font-size:12.5px;display:flex;flex-direction:column;gap:6px}
.elmenu{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:10px 0}.elmenu button{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:600 13.5px var(--ui-font);cursor:pointer;text-align:left}.elmenu button:hover{background:var(--panel2)}.elmenu svg{width:20px;height:20px;color:var(--accent);flex:none}
body.inel .pbar,body.inel .topbar,body.inel .foot,body.inel details.notes,body.inel .mbar,body.inel #bbfab,body.inel .mtoast,body.inroom .mtoast,body.innb .mtoast{display:none!important}body.inel .view{max-width:none!important;padding:0!important;zoom:1}
body.inel .rail{display:none!important}body.inel{overflow:hidden}
.elw{position:fixed;inset:0;z-index:36;display:flex;flex-direction:column;height:100dvh;background:#e8ecf2;overflow:hidden}:root[data-mode="dark"] .elw{background:#161a21}
.eltop{display:flex;align-items:center;gap:4px;padding:6px 8px;padding-top:calc(6px + env(safe-area-inset-top));background:linear-gradient(120deg,#4f46e5,#7c3aed 55%,#a21caf);color:#fff;flex:none;box-shadow:0 4px 16px -8px rgba(0,0,0,.5);z-index:8}
.eltop .chb{flex:none}.eltop .chb.on{background:rgba(255,255,255,.25)}
.eltabs{flex:1;min-width:0;display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none}.eltabs::-webkit-scrollbar{display:none}
.eltab{display:flex;align-items:center;max-width:210px;flex:none;border-radius:11px;background:rgba(255,255,255,.12);transition:background .2s,box-shadow .2s}.eltab:hover{background:rgba(255,255,255,.2)}.eltab.on{background:#fff;box-shadow:0 6px 16px -8px rgba(0,0,0,.5)}.eltab a{display:flex;align-items:center;gap:6px;padding:7px 4px 7px 10px;color:#fff;text-decoration:none;font:600 13.5px var(--ui-font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eltab.on a{color:#3b0764}
.eltabi{display:grid;place-items:center;flex:none}.eltabi svg{width:15px;height:15px}.eltab.on .eltabi{color:#7c3aed}.eltab button{width:26px;height:26px;border:0;background:none;color:inherit;border-radius:8px;display:grid;place-items:center;cursor:pointer;opacity:.75}.eltab.on button{color:#3b0764}.eltab button svg{width:14px;height:14px}
.eltabadd{width:32px;height:32px;flex:none;border:0;border-radius:10px;background:rgba(255,255,255,.14);color:#fff;display:grid;place-items:center;cursor:pointer}.eltabadd svg{width:18px;height:18px}
.elbody{position:relative;flex:1;min-height:0;display:flex}
.elol{width:150px;flex:none;background:var(--panel);border-right:1px solid var(--line);display:flex;flex-direction:column}.elol[hidden]{display:none}
.elolh{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;font-size:13px}.elolist{flex:1;overflow-y:auto;padding:4px 12px 80px;display:flex;flex-direction:column;gap:12px}
.elth{border:0;background:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--muted);font:600 11.5px var(--ui-font)}.elth canvas{width:110px;background:#fff;border-radius:4px;box-shadow:0 2px 8px -3px rgba(0,0,0,.35);outline:2.5px solid transparent;outline-offset:2px;min-height:60px;transition:outline-color .2s,transform .2s}.elth:hover canvas{transform:translateY(-2px)}.elth.on canvas{outline-color:#7c3aed}.elth.on{color:#7c3aed}
@media (max-width:700px){.elol{position:absolute;left:0;top:0;bottom:0;z-index:7;box-shadow:8px 0 24px -12px rgba(0,0,0,.4)}}
.elscroll{flex:1;min-width:0;overflow:auto;touch-action:none;-webkit-user-select:none;user-select:none;overscroll-behavior:contain;position:relative}
.elpages{display:flex;flex-direction:column;align-items:center;gap:22px;padding:72px 14px 90px;min-width:min-content}
.elscroll.horiz .elpages{flex-direction:row;align-items:center;min-height:100%;padding:16px 40px;scroll-snap-type:x proximity}.elscroll.horiz .elp{scroll-snap-align:center}
.elp{position:relative;background:#fff;border-radius:4px;flex:none;box-shadow:0 0 0 1px rgba(15,23,42,.05),0 1px 3px rgba(0,0,0,.07),0 18px 40px -22px rgba(15,23,42,.55)}
.elp::before{content:"";position:absolute;inset:0;border-radius:4px;background:linear-gradient(100deg,transparent 30%,rgba(124,58,237,.07) 50%,transparent 70%) 0 0/250% 100%,#fbfbfd;animation:elshim 1.3s linear infinite;pointer-events:none;transition:opacity .35s}.elp.night::before{background-color:#1d2230}.elp.ready::before{opacity:0;animation:none}
.elb{opacity:0;transition:opacity .35s ease}.elp.ready .elb{opacity:1}@keyframes elshim{to{background-position:-250% 0,0 0}}
.elb,.eli{position:absolute;inset:0;width:100%;height:100%;border-radius:3px}.eli{mix-blend-mode:multiply}.elp.night .eli{mix-blend-mode:normal}
.elpn{position:absolute;right:0;bottom:-20px;font-size:11px;color:var(--muted)}
.elx{position:absolute;inset:0;pointer-events:none}.elt{position:absolute;pointer-events:auto;padding:.25em;line-height:1.3;outline:0;border-radius:4px;white-space:pre-wrap;word-wrap:break-word;font-family:"Source Sans 3",system-ui,sans-serif;-webkit-user-select:text;user-select:text}
.elt:focus{background:rgba(124,58,237,.06);box-shadow:0 0 0 1.5px rgba(124,58,237,.5)}.elt:not(.emo):empty::before{content:"Type here…";color:#94a3b8;pointer-events:none}.elt{caret-color:#7c3aed;min-height:1.3em;cursor:text}.elt.emo{line-height:1;padding:0;font-family:system-ui;pointer-events:none}
.elw:not([data-tool="text"]) .elt:not(:focus){pointer-events:none}.elw.ro .elt{pointer-events:none}
.eltl{position:absolute;inset:0;overflow:hidden;line-height:1;pointer-events:none;-webkit-user-select:text;user-select:text;z-index:2}
.eltl span,.eltl br{color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0 0}
.eltl.ocr span{display:block;overflow:hidden;line-height:1}.eltl ::selection{background:rgba(124,58,237,.3)}
.elw.selmode .elscroll,.elw.ro .elscroll{touch-action:auto;-webkit-user-select:text;user-select:text}.elw.selmode .eltl,.elw.ro .eltl{pointer-events:auto}
.elfx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6}
.eltb{position:absolute;z-index:9;display:flex;align-items:center;gap:3px;padding:6px;border-radius:20px;background:color-mix(in srgb,var(--panel) 82%,transparent);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);border:1px solid color-mix(in srgb,var(--line) 70%,transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 1px 2px rgba(0,0,0,.06),0 18px 40px -18px rgba(15,23,42,.55);max-width:calc(100% - 12px);overflow-x:auto;scrollbar-width:none;transition:box-shadow .2s}
.eltb::-webkit-scrollbar{display:none}.eltb.drag{box-shadow:0 22px 50px -14px rgba(0,0,0,.6);transition:none}.eltb.vert{flex-direction:column;max-height:calc(100% - 70px);overflow-y:auto}
.elw.ro .eltb{display:none}
.eltb-grip{width:22px;height:38px;display:grid;place-items:center;color:var(--muted);cursor:grab;flex:none;touch-action:none}.eltb.vert .eltb-grip{width:38px;height:22px;transform:rotate(90deg)}.eltb-grip svg{width:16px;height:16px}
.eltb-b{width:40px;height:40px;flex:none;border:0;border-radius:13px;background:none;color:color-mix(in srgb,var(--ink) 82%,transparent);display:grid;place-items:center;cursor:pointer;transition:background .2s,color .2s,transform .25s cubic-bezier(.3,1.6,.5,1),box-shadow .2s;-webkit-tap-highlight-color:transparent}.eltb-b svg{width:22px;height:22px;transition:transform .25s cubic-bezier(.3,1.6,.5,1)}.eltb-b:hover{background:var(--panel2);color:var(--ink)}.eltb-b:active{transform:scale(.88)}
.eltb-b.on{color:#fff;background:linear-gradient(140deg,#818cf8,#7c3aed 60%,#9333ea);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 8px 16px -8px #6d28d9}.eltb-b.on svg{transform:translateY(-1px) scale(1.06)}.eltb-b.on svg path[opacity]{opacity:.3}.eltb-b[data-tool="laser"].on{background:linear-gradient(135deg,#ff6b5e,#e11d48)}
.eltb-sep{width:1px;height:26px;background:var(--line);margin:0 3px;flex:none}.eltb.vert .eltb-sep{width:26px;height:1px;margin:3px 0}
.eltb-c{width:40px;height:40px;flex:none;border:0;background:none;display:grid;place-items:center;cursor:pointer}.eltb-c i{width:22px;height:22px;border-radius:50%;background-image:radial-gradient(circle at 32% 28%,rgba(255,255,255,.55),transparent 45%);box-shadow:inset 0 -2px 3px rgba(0,0,0,.18),0 0 0 2.5px var(--panel),0 0 0 4.5px color-mix(in srgb,var(--line) 80%,#7c3aed);transition:transform .25s cubic-bezier(.3,1.6,.5,1)}.eltb-c:active i{transform:scale(.85)}
.elpop{position:absolute;z-index:11;padding:12px;border-radius:18px;background:color-mix(in srgb,var(--panel) 92%,transparent);backdrop-filter:blur(20px) saturate(1.5);-webkit-backdrop-filter:blur(20px) saturate(1.5);border:1px solid var(--line);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 24px 48px -18px rgba(15,23,42,.6);animation:elpopin .22s cubic-bezier(.2,.9,.3,1.2);transform-origin:top center;max-width:300px}
@keyframes elpopin{from{opacity:0;transform:translateY(-6px) scale(.95)}to{opacity:1;transform:none}}.elpoph{font:800 10.5px var(--ui-font);letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin:0 2px 8px}
.elcols{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}.elc{position:relative;width:30px;height:30px;border-radius:50%;border:0;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.5),transparent 45%),var(--c);box-shadow:inset 0 -2px 4px rgba(0,0,0,.2),0 2px 6px -2px rgba(0,0,0,.35);cursor:pointer;transition:transform .2s cubic-bezier(.3,1.6,.5,1)}.elc:hover{transform:scale(1.1)}.elc.on{box-shadow:inset 0 -2px 4px rgba(0,0,0,.2),0 0 0 3px var(--panel),0 0 0 5px var(--c)}.elc.on::after{content:"";position:absolute;left:50%;top:46%;width:6px;height:11px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:translate(-50%,-50%) rotate(45deg);filter:drop-shadow(0 0 1px rgba(0,0,0,.5))}.elcust.on::after{display:none}
.elcust{position:relative;overflow:hidden;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)}.elcust input{position:absolute;inset:-8px;opacity:0;cursor:pointer}
.elsizes{display:flex;gap:4px}.elz{width:40px;height:36px;border:0;border-radius:11px;background:none;display:grid;place-items:center;cursor:pointer;transition:background .2s}.elz i{width:var(--z);height:var(--z);border-radius:50%;background:var(--ink);transition:transform .2s}.elz:hover i{transform:scale(1.15)}.elz.on{background:var(--accent-soft);box-shadow:inset 0 0 0 1.5px #a78bfa}
.elsub{display:flex;flex-direction:column;gap:4px;min-width:220px}.elsub button{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:9px 12px;border:0;border-radius:12px;background:none;color:var(--ink);cursor:pointer;text-align:left;transition:background .15s}.elsub button:hover{background:var(--panel2)}.elsub2{flex-direction:row!important;min-width:250px}.elsub2 button{flex:1;align-items:center!important;text-align:center!important;gap:3px!important;padding:12px 8px!important}.elsubi{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--panel2);margin-bottom:4px}.elsubi svg{width:26px;height:26px}.elsub2 button.on .elsubi{background:linear-gradient(140deg,#818cf8,#7c3aed);color:#fff}.elsub2 button.on{box-shadow:inset 0 0 0 1.5px #a78bfa!important}
.eltb-b.dis{opacity:.35}
.elsub button.on{background:var(--accent-soft);box-shadow:inset 3px 0 0 #7c3aed}.elsub b{font-size:14px}.elsub small{color:var(--muted);font-size:12px}
.elsw{flex-direction:row!important;align-items:center!important;justify-content:space-between;gap:12px}.elsw>span{display:flex;flex-direction:column;gap:1px}.elsw>i{flex:none;width:38px;height:22px;border-radius:99px;background:var(--line);position:relative;transition:background .2s}.elsw>i::after{content:"";position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .25s cubic-bezier(.3,1.5,.5,1)}.elsw.on{box-shadow:none!important;background:none!important}.elsw.on>i{background:#7c3aed}.elsw.on>i::after{transform:translateX(16px)}
.elseg{display:flex;gap:3px;padding:3px;border-radius:12px;background:var(--panel2)}.elseg button{flex:1;border:0;background:none;color:var(--ink);font:600 12.5px var(--ui-font);padding:7px 4px;border-radius:9px;cursor:pointer}.elseg button.on{background:var(--panel);box-shadow:0 2px 6px -2px rgba(0,0,0,.3);color:#7c3aed}.elpnote{display:block;margin-top:10px;font-size:11.5px;line-height:1.4;max-width:270px}
.ellzc{position:absolute;left:50%;bottom:calc(64px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9;border:0;border-radius:99px;padding:9px 18px;font:700 13px var(--ui-font);color:#fff;background:linear-gradient(135deg,#ff5a4f,#e11d48);box-shadow:0 10px 24px -10px rgba(225,29,72,.8);cursor:pointer;animation:elpopin .2s ease-out}.ellzc:active{transform:translateX(-50%) scale(.94)}
.elw{touch-action:none}.eltabs{touch-action:pan-x}.elolist{touch-action:pan-y}.elpop,.elselbar{touch-action:pan-x pan-y}
.elw.selmode .elscroll,.elw.ro .elscroll{touch-action:pan-x pan-y!important}
.elw[data-desk="warm"]{background:#ece6da}.elw[data-desk="lav"]{background:#e9e6f6}.elw[data-desk="dark"]{background:#14171d}:root[data-mode="dark"] .elw[data-desk="warm"]{background:#221f1a}:root[data-mode="dark"] .elw[data-desk="lav"]{background:#1d1b29}
.elw[data-tbs="s"] .eltb-b,.elw[data-tbs="s"] .eltb-c{width:33px;height:33px}.elw[data-tbs="s"] .eltb-b svg{width:18px;height:18px}.elw[data-tbs="l"] .eltb-b,.elw[data-tbs="l"] .eltb-c{width:50px;height:50px}.elw[data-tbs="l"] .eltb-b svg{width:27px;height:27px}.elw[data-tbs="l"] .eltb-c i{width:28px;height:28px}
.elw[data-gap="s"] .elpages{gap:8px}.elw[data-gap="l"] .elpages{gap:44px}.elw.nopn .elpn{display:none}
.elhead .elhome{flex:none}.eltop .elhm{flex:none}@media (max-width:600px){.eltop .elhm{display:flex}.eltop{gap:2px}.eltop .chb{width:32px;min-width:32px}}
.elselbox .h[data-c="bl"]{right:auto;left:-11px;cursor:nesw-resize}.elselbox .h[data-c="tr"]{bottom:auto;top:-11px;cursor:nesw-resize}.elselbox .h[data-c="tl"]{right:auto;left:-11px;bottom:auto;top:-11px;cursor:nwse-resize}.elselbox .h:hover{transform:scale(1.15)}.elselbox .h{transition:transform .15s}
.eltb{gap:2px;padding:5px;border-radius:19px;background:color-mix(in srgb,var(--panel) 95%,transparent);border:1px solid color-mix(in srgb,var(--ink) 11%,transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 1px 2px rgba(15,23,42,.08),0 18px 38px -16px rgba(15,23,42,.5);transition:left .3s cubic-bezier(.2,.9,.3,1.1),top .3s cubic-bezier(.2,.9,.3,1.1),box-shadow .2s}
:root[data-mode="dark"] .eltb{box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 18px 38px -16px rgba(0,0,0,.7)}
.eltb.drag{transition:none;cursor:grabbing;box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 28px 50px -16px rgba(15,23,42,.6)}
.eltb-grip{width:18px;color:color-mix(in srgb,var(--ink) 40%,transparent);border-radius:9px}.eltb-grip:hover{background:var(--panel2)}.eltb.vert .eltb-grip{width:38px;height:18px}
.eltb-b{position:relative;border-radius:12px;color:color-mix(in srgb,var(--ink) 86%,transparent)}
.eltb-b.on{color:#fff;background:#7c3aed;box-shadow:0 6px 14px -6px rgba(124,58,237,.75)}.eltb-b.on svg path[opacity]{opacity:.3}.eltb-b.on svg{transform:none}
.eltb-b[data-tool="pen"]::after,.eltb-b[data-tool="hl"]::after{content:"";position:absolute;left:50%;bottom:4px;width:14px;height:3px;border-radius:2px;transform:translateX(-50%);background:var(--tc,#111827);box-shadow:0 0 0 1px rgba(255,255,255,.5)}
.eltb-b[data-tool="eraser"]::before,.eltb-b[data-tool="lasso"]::before,.eltb-b[data-tool="laser"]::before{content:"";position:absolute;right:4px;bottom:4px;border:2.5px solid transparent;border-right-color:currentColor;border-bottom-color:currentColor;opacity:.4}
.eltb-mini svg{transition:transform .3s}.eltb.mini .eltb-mini svg{transform:rotate(180deg)}.eltb.vert .eltb-mini svg{transform:rotate(90deg)}.eltb.vert.mini .eltb-mini svg{transform:rotate(-90deg)}
.eltb.mini>:not(.eltb-grip):not(.on):not(.eltb-mini):not(.eltb-c){display:none!important}
.elseg{flex-wrap:wrap}
.eltl .eleoc{display:block;position:absolute;left:0;right:0;top:100%;bottom:0;z-index:-1;cursor:default;-webkit-user-select:none;user-select:none}.eltl.selecting .eleoc{top:0}
.elseg2 button{font-size:14px;padding:9px 4px}.elseg2 button.on{background:#7c3aed;color:#fff;box-shadow:0 6px 14px -6px rgba(124,58,237,.7)}
.elfab{position:fixed;right:22px;bottom:calc(26px + env(safe-area-inset-bottom));z-index:20;display:flex;align-items:center;gap:8px;padding:0 22px 0 16px;height:56px;border:0;border-radius:20px;color:#fff;font:800 15px var(--ui-font);background:linear-gradient(140deg,#818cf8,#7c3aed 55%,#c026d3);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 16px 32px -12px rgba(124,58,237,.75);cursor:pointer;transition:transform .25s cubic-bezier(.3,1.5,.5,1),box-shadow .25s;animation:elpopin .35s cubic-bezier(.2,.9,.3,1.2)}.elfab svg{width:24px;height:24px;stroke-width:2.4}.elfab:hover{transform:translateY(-2px)}.elfab:active{transform:scale(.94)}
@media (max-width:860px){.elfab{bottom:calc(88px + env(safe-area-inset-bottom));right:16px}}
.elnewm{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.elnewm button{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:14px;border-radius:18px;border:1px solid var(--line);background:var(--panel);color:var(--ink);text-align:left;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s;animation:foldIn .35s both}.elnewm button:nth-child(2){animation-delay:40ms}.elnewm button:nth-child(3){animation-delay:80ms}.elnewm button:nth-child(4){animation-delay:120ms}
.elnewm button:hover{transform:translateY(-2px);border-color:#a78bfa;box-shadow:0 12px 24px -16px rgba(124,58,237,.6)}.elnewm i{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;color:#fff;background:linear-gradient(140deg,var(--a),var(--b));box-shadow:0 8px 16px -8px var(--b);margin-bottom:6px}.elnewm i svg{width:24px;height:24px}.elnewm b{font:700 15px var(--ui-font)}.elnewm small{font-size:12.5px;color:var(--muted);line-height:1.35}
.elpaste{position:absolute;left:50%;bottom:calc(64px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9;border:0;border-radius:99px;padding:10px 20px;font:700 13.5px var(--ui-font);color:#fff;background:linear-gradient(135deg,#6366f1,#7c3aed);box-shadow:0 12px 26px -10px rgba(124,58,237,.8);cursor:pointer;animation:elpopin .2s ease-out}.elpaste.on{background:#111827;box-shadow:0 0 0 3px rgba(139,92,246,.5),0 12px 26px -10px rgba(0,0,0,.6)}.elpaste:active{transform:translateX(-50%) scale(.95)}.ellzc{bottom:calc(112px + env(safe-area-inset-bottom))}
.elselbox.drag{border-style:dashed;background:rgba(139,92,246,.12)}.elselbar{max-width:min(92vw,560px);overflow-x:auto;scrollbar-width:none}
.elw,.elscroll{-webkit-touch-callout:none}
.elemo{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;margin-bottom:6px}.elemo button{font-size:24px;height:40px;border:0;background:none;border-radius:10px;cursor:pointer}.elemo button:hover{background:var(--panel2)}
.elsavestatus{position:absolute;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:8;max-width:calc(100% - 250px);padding:8px 12px;border:1px solid var(--line);border-radius:99px;background:var(--panel);color:var(--muted);font:600 11px var(--ui-font);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.elsavestatus[data-state="error"]{color:#b91c1c;background:#fff1f2;border-color:#fda4af}.elsavestatus[data-state="saving"],.elsavestatus[data-state="pending"]{color:#7c3aed}@media(max-width:480px){.elsavestatus{left:8px;bottom:calc(56px + env(safe-area-inset-bottom));max-width:calc(100% - 16px)}}
.elnav{position:absolute;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:8;display:flex;align-items:center;gap:2px;padding:4px 8px;border-radius:99px;background:color-mix(in srgb,var(--panel) 92%,transparent);backdrop-filter:blur(10px);border:1px solid var(--line);box-shadow:0 8px 22px -10px rgba(0,0,0,.45);font:700 12.5px var(--ui-font)}
.elnav button{width:30px;height:30px;border:0;border-radius:50%;background:none;color:var(--ink);font-size:18px;cursor:pointer;transition:background .15s,transform .2s}.elnav button:hover{background:var(--panel2)}.elnav button:active{transform:scale(.88)}.elnav input{width:38px;text-align:center;border:1px solid var(--line);border-radius:8px;background:var(--panel2);color:var(--ink);font:700 13px var(--ui-font);padding:4px}.elnsep{width:1px;height:18px;background:var(--line);margin:0 6px}
.elro{position:absolute;left:50%;top:60px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:99px;background:#111827;color:#fff;font:600 13px var(--ui-font);box-shadow:0 10px 24px -10px rgba(0,0,0,.6)}.elro svg{width:17px;height:17px}.elro .lnk{color:#c4b5fd;font-weight:800}
.elruler{position:absolute;z-index:7;width:min(80vw,620px);height:68px;border-radius:10px;background:repeating-linear-gradient(90deg,rgba(15,23,42,.55) 0 1px,transparent 1px 10px) 0 0/100% 14px no-repeat,repeating-linear-gradient(90deg,rgba(15,23,42,.7) 0 1.5px,transparent 1.5px 50px) 0 0/100% 24px no-repeat,rgba(241,245,249,.82);border:1px solid rgba(15,23,42,.25);box-shadow:0 10px 24px -12px rgba(0,0,0,.5);backdrop-filter:blur(6px);touch-action:none;cursor:move;display:flex;align-items:flex-end;justify-content:center}
.elrn{position:absolute;left:0;right:0;top:0;height:40px;overflow:hidden;pointer-events:none}.elrn b{position:absolute;top:25px;transform:translateX(-50%);font:700 10.5px var(--ui-font);color:#334155;font-variant-numeric:tabular-nums}.elrn b:first-child{transform:translateX(2px)}
.elrdeg{position:absolute;left:50%;top:-30px;transform:translateX(-50%);font:700 11.5px var(--ui-font);font-style:normal;color:#fff;background:rgba(17,24,39,.85);padding:3px 9px;border-radius:99px;pointer-events:none}
.elruler i{position:absolute;right:-14px;top:50%;width:28px;height:28px;margin-top:-14px;border-radius:50%;background:#7c3aed;box-shadow:0 0 0 4px rgba(255,255,255,.8);cursor:grab}.elruler span{font:600 11px var(--ui-font);color:#475569;margin-bottom:6px}
.elselbox{position:absolute;z-index:7;border:1.5px solid #8b5cf6;border-radius:8px;background:rgba(139,92,246,.06);box-shadow:0 0 0 4px rgba(139,92,246,.12);cursor:move;touch-action:none;animation:elpopin .18s ease-out}
.elselbox .h{position:absolute;right:-11px;bottom:-11px;width:22px;height:22px;border-radius:50%;background:#fff;border:2.5px solid #7c3aed;box-shadow:0 3px 8px -2px rgba(0,0,0,.35);cursor:nwse-resize}
.elselbar{position:absolute;left:50%;top:-50px;transform:translateX(-50%);display:flex;gap:2px;padding:4px;border-radius:13px;background:rgba(17,24,39,.92);backdrop-filter:blur(10px);white-space:nowrap;box-shadow:0 8px 20px -8px rgba(0,0,0,.5)}.elselbar button{border:0;background:none;color:#fff;font:600 13px var(--ui-font);padding:7px 10px;border-radius:8px;cursor:pointer}.elselbar button:hover{background:rgba(255,255,255,.12)}.elselbar .elshotb{background:linear-gradient(135deg,#6366f1,#7c3aed)}
.elshot{display:grid;place-items:center;padding:14px;margin:6px 0 10px;border-radius:16px;background:repeating-conic-gradient(#e5e7eb 0 25%,#f8fafc 0 50%) 0 0/18px 18px;max-height:46vh;overflow:auto}.elshot img{max-width:100%;max-height:42vh;border-radius:6px;box-shadow:0 10px 26px -12px rgba(0,0,0,.5);background:transparent}
@media (max-width:600px){.eltb-b,.eltb-c{width:36px;height:36px}.eltb-b svg{width:20px;height:20px}.elpages{padding:66px 6px 80px;gap:14px}}
`;
css.textContent += `/* Refined notebook workspace */
.elw .eltop{background:var(--panel);color:var(--ink);border-bottom:1px solid var(--line);box-shadow:0 1px 5px #0f172a08}
.elw .eltop .chb{color:var(--ink)}
.elw .eltab.on{background:var(--accent-soft);box-shadow:inset 0 -2px #7c3aed}
.elw .elp{box-shadow:0 2px 5px #0f172a09,0 14px 40px -14px #0f172a24}
.elw button:focus-visible,.elib button:focus-visible{outline:3px solid #a78bfa;outline-offset:3px}
.elw .eltb-b:active{transform:scale(.94)}
.elw .eltb-b.dis{cursor:default}
.elw .elth{transition:background .15s,box-shadow .15s}
.elw .elth.on{box-shadow:inset 0 0 0 2px #8b5cf6}
.elw .elscroll{overscroll-behavior:contain}
@media(max-width:600px){.elw .eltb:not(.vert){max-width:calc(100vw - 20px);overflow-x:auto;justify-content:flex-start;scrollbar-width:thin}.elw .eltb>*{flex-shrink:0}.elw .elsavestatus{font-size:10px;max-width:120px}.elw .elol{width:90px;min-width:90px}}
@media(prefers-reduced-motion:reduce){.elw *,.elib *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}`;
document.head.appendChild(css);
})();
