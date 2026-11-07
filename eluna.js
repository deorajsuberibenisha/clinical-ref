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
  full: ic('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', "M7 7h10v10H7z"),
  unfull: ic('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>', "M9 9h6v6H9z"),
  sideb: ic('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16M5.5 8h1.5M5.5 11h1.5M5.5 14h1.5"/>', "M3 4h6v16H3z"),
  tape: ic('<path d="M3.6 9.2l15.6-4.4 1.4 5-15.6 4.4z"/><path d="M7.2 8.2l1.4 5M11 7.1l1.4 5M14.8 6l1.4 5M4 18.5h16"/>', "M3.6 9.2l15.6-4.4 1.4 5-15.6 4.4z"),
  zoomw: ic('<rect x="3" y="3.5" width="18" height="10" rx="2"/><rect x="7" y="6" width="5" height="4.5" rx=".8"/><path d="M3 17h18M3 20.5h12"/>', "M3 3.5h18v10H3z"),
  find: ic('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5M8 10.5h5"/>', "M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"),
  bmk: ic('<path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1z"/>', "M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1z"),
  star: ic('<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>', "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"),
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
const TAPES = ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#94a3b8"];
const PENK = [["", "Smooth"], ["fountain", "Fountain"], ["ball", "Ballpoint"], ["brush", "Brush"]];
const STICKERS = "🫀 🫁 🧠 🦷 🦴 👁️ 👂 👃 👅 🩸 🦠 🧬 💊 💉 🩺 🩹 🌡️ 🧪 🔬 🩻 🏥 🚑 ⚕️ 👶 🤰 ✅ ❌ ⚠️ ❗ ❓ ⭐ 📌 ➡️ ⬆️ ⬇️ 🔁 💡 🎯".split(" ");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const PEN = () => Object.assign({palm: true, btn: "eraser", pressure: true, hover: true, ftap: true}, store.get("eluPen2", {}));
const LINC = () => Object.assign({ink: 1, shape: 1, hl: 1, tape: 1, img: 1, text: 1}, store.get("eluLInc", {}));
const SET = () => Object.assign({tpl: "lined", paper: "white", scroll: "v", smooth: 0.38, outline: true, desk: "grey", tbs: "m", gap: "m", pnum: true, hlsnap: true, hold: true, shapes: true, gest: true, full: true, zwauto: true}, store.get("eluSet", {}));

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
  if (st.t === "tape") {   /* revision tape: solid with soft stripes; revealed tape is a faint dashed outline */
    const ax = p[0], ay = p[1], bx = n > 1 ? p[(n - 1) * 3] : ax + 1, by = n > 1 ? p[(n - 1) * 3 + 1] : ay, L = Math.max(1, Math.hypot(bx - ax, by - ay)), ux = (bx - ax) / L, uy = (by - ay) / L, hw = st.w / 2;
    x.beginPath(); x.moveTo(ax - uy * hw, ay + ux * hw); x.lineTo(bx - uy * hw, by + ux * hw); x.lineTo(bx + uy * hw, by - ux * hw); x.lineTo(ax + uy * hw, ay - ux * hw); x.closePath();
    if (st.r) { x.globalAlpha = .13; x.fillStyle = st.c; x.fill(); x.globalAlpha = .75; x.setLineDash([7, 6]); x.lineWidth = 1.6; x.strokeStyle = st.c; x.stroke(); }
    else { x.fillStyle = st.c; x.fill(); x.clip(); x.globalAlpha = .2; x.strokeStyle = "#fff"; x.lineWidth = 5; x.beginPath(); for (let t = -st.w; t < L + st.w; t += 16) { x.moveTo(ax + ux * t + uy * hw * 1.5, ay + uy * t - ux * hw * 1.5); x.lineTo(ax + ux * (t + st.w) - uy * hw * 1.5, ay + uy * (t + st.w) + ux * hw * 1.5); } x.stroke(); }
    x.restore(); return;
  }
  if (st.t === "hl" || st.t === "px") {
    if (st.t === "px") { x.globalCompositeOperation = "destination-out"; x.strokeStyle = "#000"; } else { x.globalAlpha = 0.5; x.strokeStyle = st.c; }
    x.lineWidth = st.w; x.beginPath(); x.moveTo(p[0], p[1]);
    for (let i = 1; i < n - 1; i++) x.quadraticCurveTo(p[i * 3], p[i * 3 + 1], (p[i * 3] + p[i * 3 + 3]) / 2, (p[i * 3 + 1] + p[i * 3 + 4]) / 2);
    if (n > 1) x.lineTo(p[(n - 1) * 3], p[(n - 1) * 3 + 1]); else x.lineTo(p[0] + .1, p[1]); x.stroke();
  } else {
    /* pressure, a soft nib-like start and — once the stroke is finished — a matching taper at the end */
    /* pen types: smooth (default), fountain (angled nib), ballpoint (even), brush (very pressure-led); shapes are even */
    x.strokeStyle = st.c; const k = st.k, W = i => { if (st.u) return st.w * 0.9; const pz = p[i * 3 + 2], ramp = Math.min(1, 0.4 + i * 0.15) * (st.e ? Math.min(1, 0.35 + (n - 1 - i) * 0.16) : 1);
      if (k === "ball") return st.w * (0.8 + 0.3 * pz) * Math.min(1, 0.75 + i * 0.08) * (st.e ? Math.min(1, 0.7 + (n - 1 - i) * 0.1) : 1);
      if (k === "brush") return st.w * (0.15 + 2.2 * Math.pow(pz, 1.25)) * ramp;
      if (k === "fountain") { const j = Math.min(n - 1, i + 1), h = Math.max(0, i - 1), a = Math.atan2(p[j * 3 + 1] - p[h * 3 + 1], p[j * 3] - p[h * 3]); return st.w * (0.42 + 0.95 * pz) * (0.36 + 0.95 * Math.abs(Math.sin(a - 0.785))) * ramp; }
      return st.w * (0.42 + 0.95 * pz) * ramp; };
    if (n === 1 && !from) { x.fillStyle = st.c; x.beginPath(); x.arc(p[0], p[1], W(0) / 2, 0, 7); x.fill(); }
    for (let i = Math.max(2, from || 2); i < n; i++) { x.lineWidth = (W(i - 1) + W(i)) / 2; x.beginPath(); x.moveTo(i === 2 ? p[0] : (p[i * 3 - 6] + p[i * 3 - 3]) / 2, i === 2 ? p[1] : (p[i * 3 - 5] + p[i * 3 - 2]) / 2); x.quadraticCurveTo(p[i * 3 - 3], p[i * 3 - 2], (p[i * 3 - 3] + p[i * 3]) / 2, (p[i * 3 - 2] + p[i * 3 + 1]) / 2); x.stroke(); }
    if (!from && n === 2) { x.lineWidth = (W(0) + W(1)) / 2; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[3], p[4]); x.stroke(); }
    if (!from && n >= 3) { x.lineWidth = W(n - 1); x.beginPath(); x.moveTo((p[(n - 2) * 3] + p[(n - 1) * 3]) / 2, (p[(n - 2) * 3 + 1] + p[(n - 1) * 3 + 1]) / 2); x.lineTo(p[(n - 1) * 3], p[(n - 1) * 3 + 1]); x.stroke(); }
  }
  x.restore();
}
const IMGS = new Map(); const img = src => { let i = IMGS.get(src); if (!i) { i = new Image(); i.src = src; IMGS.set(src, i); } return i; };
const ready = srcs => Promise.all(srcs.filter(Boolean).map(s => { const i = img(s); return i.complete ? 0 : new Promise(r => { const done = () => { i.removeEventListener("load", done); i.removeEventListener("error", done); r(); }; i.addEventListener("load", done, {once:true}); i.addEventListener("error", done, {once:true}); }); }));
/* stroke bounds (page units), cached until the stroke's points change */
const BB = new WeakMap();
const sbox = st => { const p = st.p, n = p.length, c = BB.get(st); if (c && c.p === p && c.n === n && c.a === p[0] && c.b === p[1] && c.z === p[n - 2] && c.w === st.w) return c.r;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < n; i += 3) { const X = p[i], Y = p[i + 1]; if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; }
  const m = st.w * 1.6 + 3, r = [x0 - m, y0 - m, x1 + m, y1 + m]; BB.set(st, {p, n, a: p[0], b: p[1], z: p[n - 2], w: st.w, r}); return r; };
const boxU = (a, b) => !a ? b && b.slice() : !b ? a : [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
/* o (optional): {ox, oy} device-pixel offset for a partial canvas, r = only repaint this page-unit box, keep = do not clear first */
function drawInk(x, pg, s, o) { const cw = x.canvas.width, ch = x.canvas.height, ox = o ? o.ox || 0 : 0, oy = o ? o.oy || 0 : 0, v = o ? o.r || [ox / s, oy / s, (ox + cw) / s, (oy + ch) / s] : null;
  x.save();
  if (o && o.r) { const X0 = Math.floor(v[0] * s - ox) - 1, Y0 = Math.floor(v[1] * s - oy) - 1, X1 = Math.ceil(v[2] * s - ox) + 1, Y1 = Math.ceil(v[3] * s - oy) + 1; x.beginPath(); x.rect(X0, Y0, X1 - X0, Y1 - Y0); x.clip(); x.clearRect(X0, Y0, X1 - X0, Y1 - Y0); }
  else if (!o || !o.keep) x.clearRect(0, 0, cw, ch);
  if (ox || oy) x.translate(-ox, -oy);
  const hit = (a0, b0, a1, b1) => !v || (a1 >= v[0] && a0 <= v[2] && b1 >= v[1] && b0 <= v[3]);
  pg.imgs.forEach(im => { if (!hit(im.x, im.y, im.x + im.w, im.y + im.h)) return; const i = img(im.src); if (i.complete && i.naturalWidth) x.drawImage(i, im.x * s, im.y * s, im.w * s, im.h * s); });
  pg.strokes.forEach(st => { if (v) { const b = sbox(st); if (!hit(b[0], b[1], b[2], b[3])) return; } stroke(x, st, s); });
  x.restore(); }
/* ---------- shape recognition: draw a line, circle, oval, triangle, rectangle or polygon and keep the pen still ---------- */
const segD = (q, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0; return Math.hypot(a[0] + t * dx - q[0], a[1] + t * dy - q[1]); };
function rdp(pts, eps) { if (pts.length < 3) return pts.slice(); const a = pts[0], b = pts[pts.length - 1]; let dm = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) { const d = segD(pts[i], a, b); if (d > dm) { dm = d; at = i; } }
  if (dm <= eps) return [a, b]; return rdp(pts.slice(0, at + 1), eps).slice(0, -1).concat(rdp(pts.slice(at), eps)); }
const polyErr = (pts, v, closed) => { let e = 0; pts.forEach(q => { let m = 1e9; for (let i = 0; i < v.length - (closed ? 0 : 1); i++) m = Math.min(m, segD(q, v[i], v[(i + 1) % v.length])); e += m; }); return e / pts.length; };
const turn = (a, b, c) => { const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]), a2 = Math.atan2(c[1] - b[1], c[0] - b[0]); let d = Math.abs(a2 - a1); if (d > Math.PI) d = 2 * Math.PI - d; return d; };
function cleanPoly(v, diag) { let ch = true; v = v.slice(); while (ch && v.length > 3) { ch = false;
  for (let i = 0; i < v.length; i++) { const a = v[(i - 1 + v.length) % v.length], b = v[i], c = v[(i + 1) % v.length];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.09 * diag || turn(a, b, c) < 0.38) { v.splice(i, 1); ch = true; break; } } } return v; }
const snapAng = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax), s = Math.round(a / (Math.PI / 4)) * (Math.PI / 4); return Math.abs(a - s) < 0.07 ? [ax + Math.cos(s) * L, ay + Math.sin(s) * L] : [bx, by]; };
function recogniseShape(p) { const pts = []; for (let i = 0; i < p.length; i += 3) pts.push([p[i], p[i + 1]]); if (pts.length < 5) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, len = 0; pts.forEach((q, i) => { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); if (i) len += Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]); });
  const bw = x1 - x0, bh = y1 - y0, diag = Math.hypot(bw, bh); if (diag < 28) return null;
  const s = pts[0], e = pts[pts.length - 1], gap = Math.hypot(e[0] - s[0], e[1] - s[1]);
  if (gap / len > 0.93) return {v: [s, snapAng(s[0], s[1], e[0], e[1])], closed: false};   /* straight line */
  if (gap > Math.max(22, 0.24 * diag)) { const q = rdp(pts, 0.06 * diag + 3); return q.length >= 3 && q.length <= 5 && polyErr(pts, q, false) < 0.035 * diag ? {v: q, closed: false} : null; }
  let f = 0, fd = 0; pts.forEach((q, i) => { const d = Math.hypot(q[0] - s[0], q[1] - s[1]); if (d > fd) { fd = d; f = i; } });
  const eps = 0.06 * diag + 2; let v = cleanPoly(rdp(pts.slice(0, f + 1), eps).slice(0, -1).concat(rdp(pts.slice(f), eps).slice(0, -1)), diag);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.max(1, bw / 2), ry = Math.max(1, bh / 2); let ee = 0; pts.forEach(([x, y]) => { ee += Math.abs(Math.hypot((x - cx) / rx, (y - cy) / ry) - 1); });
  const eErr = ee / pts.length * (rx + ry) / 2, pErr = v.length >= 3 && v.length <= 6 ? polyErr(pts, v, true) : 1e9;
  if (eErr < pErr && eErr < 0.05 * diag) { const r0 = Math.abs(rx - ry) / Math.max(rx, ry) < 0.14 ? (rx + ry) / 2 : 0; return {ell: [cx, cy, r0 || rx, r0 || ry]}; }
  if (pErr > 0.045 * diag) return null;
  if (v.length === 4 && [0, 1, 2, 3].every(i => Math.abs(turn(v[(i + 3) % 4], v[i], v[(i + 1) % 4]) - Math.PI / 2) < 0.3)) {   /* tidy rectangle, square to its own angle */
    let a = Math.atan2(v[1][1] - v[0][1], v[1][0] - v[0][0]); const sa = Math.round(a / (Math.PI / 2)) * (Math.PI / 2); if (Math.abs(a - sa) < 0.14) a = sa;
    const mx = v.reduce((t, q) => t + q[0], 0) / 4, my = v.reduce((t, q) => t + q[1], 0) / 4, c = Math.cos(-a), sn = Math.sin(-a);
    const rot = v.map(([x, y]) => [(x - mx) * c - (y - my) * sn, (x - mx) * sn + (y - my) * c]), hx = (Math.max(...rot.map(q => q[0])) - Math.min(...rot.map(q => q[0]))) / 2, hy = (Math.max(...rot.map(q => q[1])) - Math.min(...rot.map(q => q[1]))) / 2, c2 = Math.cos(a), s2 = Math.sin(a);
    v = [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]].map(([x, y]) => [mx + x * c2 - y * s2, my + x * s2 + y * c2]); }
  return {v, closed: true}; }
/* a recognised shape as dense, evenly spaced points so corners stay crisp */
function shapePoints(r) { const out = []; const add = (x, y) => out.push(+x.toFixed(1), +y.toFixed(1), .5);
  if (r.ell) { const [cx, cy, rx, ry] = r.ell, n = Math.max(48, Math.round((rx + ry) / 3)); for (let i = 0; i <= n; i++) { const t = i / n * Math.PI * 2 - Math.PI / 2; add(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry); } return out; }
  const v = r.closed ? [...r.v, r.v[0]] : r.v; for (let i = 0; i < v.length - 1; i++) { const a = v[i], b = v[i + 1], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5)); for (let j = 0; j < k; j++) add(a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k); }
  const z = v[v.length - 1]; add(z[0], z[1]); return out; }
const FONT = '"Source Sans 3","Segoe UI",system-ui,-apple-system,Arial,sans-serif';
function wrapText(x, t, w) { const out = []; String(t).split("\n").forEach(par => { let l = ""; par.split(/\s+/).forEach(wd => { const tl = l ? l + " " + wd : wd; if (x.measureText(tl).width > w && l) { out.push(l); l = wd; } else l = tl; }); out.push(l); }); return out; }
function drawTexts(x, pg, s) { pg.texts.forEach(t => { x.save(); x.scale(s, s); x.font = `${t.b ? 700 : 400} ${t.size || 30}px ${t.emoji ? "system-ui" : FONT}`; x.fillStyle = t.c || "#111827"; x.textBaseline = "top"; wrapText(x, t.t || "", t.w).forEach((l, i) => x.fillText(l, t.x + 8, t.y + 8 + i * (t.size || 30) * 1.3)); x.restore(); }); }
/* base layer: paper, an app page image, or a PDF page */
async function drawBase(x, pg, s, task, ox = 0, oy = 0) {
  x.save(); if (ox || oy) x.translate(-ox, -oy); drawPaper(x, pg, s);
  if (pg.bg) { await ready([pg.bg]); const i = img(pg.bg); x.imageSmoothingQuality = "high"; if (i.naturalWidth) x.drawImage(i, 0, 0, pg.w * s, pg.h * s); }
  x.restore();
  if (pg.type === "pdf") { const d = await pdfDoc(pg.fid), page = await d.getPage(pg.pi + 1), vp1 = page.getViewport({scale: 1}), vp = page.getViewport({scale: pg.w * s / vp1.width});
    const t = page.render(ox || oy ? {canvasContext: x, viewport: vp, transform: [1, 0, 0, 1, -ox, -oy]} : {canvasContext: x, viewport: vp}); if (task) task.t = t; await t.promise; }
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
    ${tags.length || books.some(b => b.fav) ? `<div class="eltags" id="el_tags"><button class="chip on" data-t="">All</button>${books.some(b => b.fav) ? `<button class="chip" data-t="★">★ Favourites</button>` : ""}${tags.map(t => `<button class="chip" data-t="${esc(t)}">#${esc(t)}</button>`).join("")}</div>` : ""}
    <div class="elgrid" id="el_grid"></div><div id="el_msg" class="small"></div></div>`;
  const grid = $("#el_grid");
  const draw = () => { const bs = books.filter(b => (q ? true : inF(b)) && (!q || b.title.toLowerCase().includes(q)) && (!q || !curF || b.folder === curF) && (!tag || (tag === "★" ? b.fav : (b.tags || []).includes(tag)))).sort((a, b) => (!!b.fav - !!a.fav) || b.updated - a.updated);
    grid.innerHTML = bs.length ? bs.map((b, i) => `<div class="elcard" style="--d:${Math.min(i, 12) * 35}ms"><a href="#eluna/${b.id}">${coverHTML(b)}<b>${esc(b.title)}</b><small>${b.pages.length} page${b.pages.length > 1 ? "s" : ""}${(b.tags || []).length ? " · " + b.tags.map(t => "#" + esc(t)).join(" ") : ""}</small></a><button class="iconbtn elcm" data-m="${b.id}" aria-label="Options">${I.more}</button><button class="iconbtn elfav${b.fav ? " on" : ""}" data-fav="${b.id}" aria-label="${b.fav ? "Remove from favourites" : "Add to favourites"}" title="Favourite">${I.star}</button></div>`).join("")
      : `<div class="cempty"><b>${q || tag ? "Nothing matches" : fo ? "This folder is empty" : "Your shelf is empty"}</b><span>${fo ? "Import PDFs or create a notebook here — or move one in from its ⋮ menu." : "Create a notebook, import PDFs, or open a topic from the app."}</span></div>`;
    $$("[data-m]", grid).forEach(bt => bt.onclick = () => bookMenu(books.find(b => b.id === bt.dataset.m), () => library(v)));
    $$("[data-fav]", grid).forEach(bt => bt.onclick = async e => { e.preventDefault(); const b = books.find(x => x.id === bt.dataset.fav); if (!b) return; const had = books.some(x => x.fav); b.fav = !b.fav; try { await DB.put("books", b); } catch (er) {} nbToast(b.fav ? "★ Added to favourites" : "Removed from favourites"); if (had !== books.some(x => x.fav) && !q) library(v); else draw(); }); };
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
    <div class="setrow"><div><b>Shape snapping</b><span>Draw a line, circle, triangle or box and keep the pen still for a moment — it becomes a neat shape</span></div><div class="setctl">${segCtl("es_shp", [["1", "On"], ["0", "Off"]], s.shapes ? "1" : "0")}</div></div>
    <div class="setrow"><div><b>Finger tap gestures</b><span>Tap with two fingers to undo, three fingers to redo</span></div><div class="setctl">${segCtl("es_gst", [["1", "On"], ["0", "Off"]], s.gest ? "1" : "0")}</div></div>
    <div class="setrow"><div><b>Toolbar position</b><span>Put the floating toolbar back at the top</span></div><div class="setctl"><button class="btn btn-ghost" id="es_tb">Reset</button></div></div>`);
  const put = (k, val) => { const n = SET(); n[k] = val; store.set("eluSet", n); onChange && onChange(); };
  paintTpls(sh, s.paper);
  $$("[data-tpl]", sh).forEach(b => b.onclick = () => { put("tpl", b.dataset.tpl); $$("[data-tpl]", sh).forEach(x => x.classList.toggle("on", x === b)); });
  $$("[data-pap]", sh).forEach(b => b.onclick = () => { put("paper", b.dataset.pap); $$("[data-pap]", sh).forEach(x => x.classList.toggle("on", x === b)); paintTpls(sh, b.dataset.pap); });
  const seg2 = (id, k, conv) => $$("#" + id + " button", sh).forEach(b => b.onclick = () => { $$("#" + id + " button", sh).forEach(x => x.setAttribute("aria-pressed", x === b)); put(k, conv(b.dataset.v)); });
  seg2("es_scroll", "scroll", v => v); seg2("es_sm", "smooth", v => +v); seg2("es_ol", "outline", v => v === "1");
  $$("#es_palm button", sh).forEach(b => b.onclick = () => { $$("#es_palm button", sh).forEach(x => x.setAttribute("aria-pressed", x === b)); const on = b.dataset.v === "1", n = PEN(); store.set("nbPencil", on); n.palm = on; store.set("eluPen2", n); onChange && onChange(); });
  seg2("es_desk", "desk", v => v); seg2("es_tbs", "tbs", v => v); seg2("es_gap", "gap", v => v); seg2("es_pn", "pnum", v => v === "1"); seg2("es_hs", "hlsnap", v => v === "1"); seg2("es_hold", "hold", v => v === "1"); seg2("es_shp", "shapes", v => v === "1"); seg2("es_gst", "gest", v => v === "1");
  $("#es_tb", sh).onclick = () => { store.set("eluTb", null); onChange && onChange(); nbToast("Toolbar moved back to the top."); };
}

/* ---------- editor ---------- */
async function editor(v, id) {
  const book = unsavedBooks.get(id) || await DB.get("books", id);
  if (!book) { v.innerHTML = `<div class="card">This notebook is not on this device. <a href="#eluna">Back to Eluna</a></div>`; return; }
  let tabs = store.get("eluTabs", []); if (!tabs.includes(id)) tabs = [id, ...tabs].slice(0, 8); store.set("eluTabs", tabs);
  const allB = await DB.all("books"), metas = allB.reduce((m, b) => (m[b.id] = b.title, m), {}), kinds = allB.reduce((m, b) => (m[b.id] = b.pages.some(p => p.type === "pdf"), m), {});
  tabs = tabs.filter(t => metas[t]); store.set("eluTabs", tabs);
  const st = SET(), S = {tool: store.get("eluTool", "pen"), sub: Object.assign({eraser: "stroke", lasso: "free", laser: "line"}, store.get("eluSub", {})), pen: store.get("eluPen", PENS[0]), hl: store.get("eluHl", HLS[0]), tape: store.get("eluTape", TAPES[0]), penk: store.get("eluPenK", ""), zw: null, zwDirty: 0, size: store.get("eluSize", 3), zoom: 1, ro: false, pencil: store.get("nbPencil", false), penDown: false, ruler: null, sel: null, emoji: null};
  const tool = (k, l) => `<button class="eltb-b" data-tool="${k}" aria-label="${l}" title="${l}">${I[k]}</button>`;
  v.innerHTML = `<div class="elw" id="elw">
    <div class="eltop"><button class="iconbtn chb" onclick="goBack()" aria-label="Back to previous screen" title="Back to previous screen">${I.back}</button><a class="iconbtn chb" href="#eluna" aria-label="Eluna library" title="All notebooks">${I.book}</a><a class="iconbtn chb elhm" href="#home" aria-label="Home" title="Home">${ICON.home}</a><div class="eltabs" id="el_tabs">${tabs.map(t => `<div class="eltab${t === id ? " on" : ""}" draggable="true" data-tab="${t}"><a href="#eluna/${t}"><i class="eltabi">${kinds[t] ? I.pdf : I.book}</i>${esc(metas[t])}</a><button data-tab-left="${t}" aria-label="Move tab left" title="Move tab left">‹</button><button data-tab-right="${t}" aria-label="Move tab right" title="Move tab right">›</button><button data-close="${t}" aria-label="Close tab">${I.x}</button></div>`).join("")}<button class="eltabadd" id="el_tabadd" aria-label="Open another notebook">${I.plus}</button></div>
      <button class="iconbtn chb" id="el_find" aria-label="Search this notebook" title="Search this notebook (Ctrl/⌘ F)">${I.find}</button><button class="iconbtn chb" id="el_bmk" aria-label="Bookmark this page" title="Bookmark this page">${I.bmk}</button><button class="iconbtn chb" id="el_ro" aria-label="Read-only mode" title="Read-only mode">${I.read}</button><button class="iconbtn chb" id="el_side" aria-label="Page outline" title="Page outline">${I.side}</button><button class="iconbtn chb" id="el_more" aria-label="More">${I.more}</button></div>
    <div class="elbody"><aside class="elol" id="el_ol"${st.outline ? "" : " hidden"}><div class="elolh"><div class="elolt"><button data-ot="pages" class="on">Pages</button><button data-ot="toc">Outline</button></div><button class="iconbtn elbmf" id="el_bmf" aria-label="Show bookmarked pages only" title="Bookmarked pages only">${I.bmk}</button><button class="iconbtn" id="el_addp2" aria-label="Add page">${I.plus}</button></div><div class="elolist" id="el_olist"></div><div class="eltoc" id="el_toc" hidden></div></aside>
      <div class="elscroll${st.scroll === "h" ? " horiz" : ""}" id="el_scroll"><div class="elpages" id="el_pages"></div></div>
      <div class="elfind" id="el_fbar" hidden><div class="elfrow">${I.find}<input id="el_fq" type="search" placeholder="Search PDF text, recognised text and text boxes" autocomplete="off" enterkeyhint="search"><span id="el_fn"></span><button id="el_fp" aria-label="Previous result">‹</button><button id="el_fnx" aria-label="Next result">›</button><button id="el_fc" aria-label="Close search">${I.x}</button></div><div class="elfres" id="el_fres"></div></div>
      <div class="elzw" id="el_zw" hidden><div class="elzwbar"><button data-zw="left" aria-label="Move window left">‹</button><button data-zw="right" aria-label="Move window right">›</button><button data-zw="nl" aria-label="Next line" title="Next line">↵</button><span class="elnsep"></span><button data-zw="out" aria-label="Bigger area">−</button><button data-zw="in" aria-label="More zoom">+</button><span class="elzwh">Write here — it lands inside the box on the page</span><button data-zw="x" aria-label="Close zoom window">${I.x}</button></div><canvas id="el_zwc"></canvas></div>
      <canvas class="elfx" id="el_fx"></canvas><div class="elruler" id="el_ruler" hidden><div class="elrn">${Array.from({length: 13}, (_, k) => `<b style="left:${k * 50}px">${k}</b>`).join("")}</div><em class="elrdeg" id="el_rdeg">0°</em><i></i><span>drag · two fingers or the handle to turn</span></div><div class="elselbox" id="el_sel" hidden><i class="h" data-c="br"></i><i class="h" data-c="bl"></i><i class="h" data-c="tr"></i><i class="h" data-c="tl"></i><div class="elselbar"><button data-a="shot" class="elshotb">📸 Screenshot</button><button data-a="copy">Copy</button><button data-a="cut">Cut</button><button data-a="dup">Duplicate</button><button data-a="crop">Crop</button><button data-a="rot">Rotate</button><button data-a="col">Colour</button><button data-a="del">Delete</button></div></div>
      <div class="eltb" id="el_tb"><span class="eltb-grip" id="el_grip">${I.grip}</span><button class="eltb-b" id="el_full" aria-label="Full screen — tools only" title="Full screen — tools only">${I.full}</button><button class="eltb-b" id="el_sideb" aria-label="Show or hide the pages panel" title="Pages panel">${I.sideb}</button>${tool("pen", "Pen")}${tool("hl", "Highlighter")}${tool("eraser", "Eraser")}${tool("lasso", "Lasso")}${tool("laser", "Laser pointer")}${tool("tape", "Tape — cover answers, tap to peek")}${tool("text", "Text box")}${tool("select", "Select text in PDFs")}<span class="eltb-sep"></span><button class="eltb-b" id="el_emo" aria-label="Medical stickers" title="Medical stickers">${I.emoji}</button><button class="eltb-b" id="el_img" aria-label="Insert photo" title="Insert photo">${I.image}</button><button class="eltb-b" id="el_rul" aria-label="Ruler" title="Ruler">${I.ruler}</button><button class="eltb-b" id="el_zwb" aria-label="Zoom window" title="Zoom window — write small text big">${I.zoomw}</button><button class="eltb-b" id="el_palm" aria-label="Palm rejection" title="Palm rejection — only the pen writes">${I.palm}</button><button class="eltb-b" id="el_sty" aria-label="Apple Pencil and S Pen" title="Apple Pencil & S Pen">${I.stylus}</button><span class="eltb-sep"></span><button class="eltb-c" id="el_col" aria-label="Colour and size"><i></i></button><button class="eltb-b" id="el_undo" aria-label="Undo">${I.undo}</button><button class="eltb-b" id="el_redo" aria-label="Redo">${I.redo}</button><button class="eltb-b" id="el_tbc" aria-label="Customise toolbar" title="Customise toolbar">${I.gear}</button><button class="eltb-b eltb-mini" id="el_mini" aria-label="Fold toolbar" title="Fold toolbar">${I.fold}</button><input type="file" id="el_imgf" accept="image/*" hidden><input type="file" id="el_camf" accept="image/*" capture="environment" hidden><input type="file" id="el_pdff" accept="application/pdf,.pdf" multiple hidden></div>
      <div class="eltbdock" id="el_tbdock">Release to dock the toolbar at the top</div><div class="elpop" id="el_pop" hidden></div><button class="elpaste" id="el_paste" hidden></button><button class="ellzc" id="el_lzc" hidden>✕ Clear laser</button>
      <button class="elsavestatus" id="el_save" type="button" aria-live="polite" title="Notes are stored on this device">Saved on device</button><div class="elnav"><button id="el_fit" aria-label="Whole page / page width" title="Whole page ⇄ page width">⤢</button><button id="el_zo" aria-label="Zoom out">−</button><span id="el_zv">100%</span><button id="el_zi" aria-label="Zoom in">+</button><span class="elnsep"></span><input id="el_pg" inputmode="numeric" aria-label="Go to page"><span id="el_pn">/ 1</span></div>
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
  const pushU = (pg, joinPrevious = false, pre) => {
    const entry = [pg.id, pre || snap(pg)];
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
  const mk = pg => { const el = document.createElement("div"); el.className = "elp" + (pg.paper === "night" ? " night" : "") + (pg.bm ? " bmk" : ""); el.innerHTML = `<div class="eltl"></div><div class="elx"></div><span class="elpn">${book.pages.indexOf(pg) + 1}</span>`; const P = {pg, el}; el.__P = P; return P; };
  const size = P => { const w = Math.round(pw()), h = Math.round(w * P.pg.h / P.pg.w); P.el.style.width = w + "px"; P.el.style.height = h + "px"; };
  const cvSize = (c, P) => { const d = Math.min(dpr(), 4096 / Math.max(1, pw(), pw() * P.pg.h / P.pg.w)); c.width = Math.round(pw() * d); c.height = Math.round(pw() * d * P.pg.h / P.pg.w); return d; };
  const base = async P => { if (!P.b) return; if (P.task && P.task.t) try { P.task.t.cancel(); } catch (e) {} const task = P.task = {}, c = document.createElement("canvas"), d = cvSize(c, P);
    try { await drawBase(c.getContext("2d"), P.pg, sc() * d, task); } catch (e) { if (e && e.name === "RenderingCancelledException") return; }
    if (P.task !== task || !P.b) return; P.b.width = c.width; P.b.height = c.height; P.b.getContext("2d").drawImage(c, 0, 0); c.width = 0; P.el.classList.add("ready"); S.zwDirty = 1; if (P.hb) { P.hr = null; hpAll(); } };
  /* r (optional): repaint only this page-unit box — much faster than redrawing every stroke on a busy page */
  const ink = (P, r) => { if (!P.i) return; if (r && P.i.width) drawInk(P.i.getContext("2d"), P.pg, sc() * cvSize.d(P), {r}); else { const d = cvSize(P.i, P); drawInk(P.i.getContext("2d"), P.pg, sc() * d); } hpInk(P, r); S.zwDirty = 1; };
  /* ---- sharp zoom: when a page canvas is capped below screen resolution, its visible part gets a full-resolution layer ---- */
  const hpNeed = P => P.b && P.i && P.i.width / Math.max(1, pw()) < dpr() * 0.92;
  const hpClear = P => { [P.hb, P.hi].forEach(c => { if (c) { c.width = c.height = 0; c.remove(); } }); P.hb = P.hi = P.hr = null; if (P.htask && P.htask.t) try { P.htask.t.cancel(); } catch (e) {} P.htask = null; };
  const hpInk = (P, r) => { const h = P.hr; if (!P.hi || !h || P.hi.width !== h.w) return; drawInk(P.hi.getContext("2d"), P.pg, h.s, {ox: h.ox, oy: h.oy, r}); P.hi.style.visibility = ""; };
  const hpMake = async P => { const r = P.el.getBoundingClientRect(), v = scroll.getBoundingClientRect(), x0 = Math.max(r.left, v.left), y0 = Math.max(r.top, v.top), x1 = Math.min(r.right, v.right), y1 = Math.min(r.bottom, v.bottom);
    if (x1 - x0 < 4 || y1 - y0 < 4) { if (P.hb) hpClear(P); return; }
    const D = dpr(), cx = x0 - r.left, cy = y0 - r.top, w = Math.round((x1 - x0) * D), h = Math.round((y1 - y0) * D), hr = {ox: Math.round(cx * D), oy: Math.round(cy * D), s: sc() * D, w, h};
    if (P.hr && P.hr.ox === hr.ox && P.hr.oy === hr.oy && P.hr.w === w && P.hr.h === h && P.hr.s === hr.s) return;
    if (P.htask && P.htask.t) try { P.htask.t.cancel(); } catch (e) {}
    const task = P.htask = {}, c = document.createElement("canvas"); c.width = w; c.height = h;
    try { await drawBase(c.getContext("2d"), P.pg, hr.s, task, hr.ox, hr.oy); } catch (e) { c.width = 0; return; }
    if (P.htask !== task || !P.b || cur && cur.P === P) { c.width = 0; return; }
    if (!P.hb) { P.hb = document.createElement("canvas"); P.hb.className = "elhp"; P.hi = document.createElement("canvas"); P.hi.className = "elhp elhi"; P.b.after(P.hb); P.i.after(P.hi); }
    [P.hb, P.hi].forEach(k => Object.assign(k.style, {left: cx + "px", top: cy + "px", width: (x1 - x0) + "px", height: (y1 - y0) + "px"}));
    P.hb.width = w; P.hb.height = h; P.hb.getContext("2d").drawImage(c, 0, 0); c.width = 0; P.hi.width = w; P.hi.height = h; P.hr = hr; hpInk(P); };
  const hpAll = () => { clearTimeout(hpAll.t); hpAll.t = setTimeout(() => { if (cur) return hpAll(); pages.forEach(P => { if (!P.b || !hpNeed(P)) { if (P.hb) hpClear(P); return; } hpMake(P); }); }, 180); };
  const attach = P => { if (P.b) return; P.b = document.createElement("canvas"); P.b.className = "elb"; P.i = document.createElement("canvas"); P.i.className = "eli"; P.el.prepend(P.b, P.i); base(P); ink(P); if (S.ro || S.tool === "select") textLayer(P); };
  const detach = P => { if (!P.b) return; hpClear(P); [P.b, P.i].forEach(c => { c.width = c.height = 0; c.remove(); }); P.b = P.i = null; P.el.querySelector(".eltl").innerHTML = ""; P.tl = 0; P.el.classList.remove("ready"); };
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? attach(e.target.__P) : detach(e.target.__P)), {root: scroll, rootMargin: "150% 150%"});
  const relayout = () => { pages.forEach(P => { size(P); if (P.b) { base(P); ink(P); texts(P); if (P.tl) { P.tl = 0; textLayer(P); } } }); $("#el_zv").textContent = Math.round(S.zoom * 100) + "%"; hpAll(); };
  const build = () => { if (S.zw) zwClose(); pages.forEach(P => { if (P.hb) hpClear(P); }); io.disconnect(); wrap.innerHTML = ""; pages = book.pages.map(mk); pages.forEach(P => { wrap.appendChild(P.el); size(P); io.observe(P.el); texts(P); }); outline(); $("#el_pn").textContent = "/ " + pages.length; };
  /* the zoom window acts as a magnified view of one box on a page: its virtual page rect maps panel points into that box */
  const zwRect = () => { const z = S.zw, c = z.c.getBoundingClientRect(), k = c.width / z.w, P = z.P; return {zv: 1, left: c.left - z.x * k, top: c.top - z.y * k, width: P.pg.w * k, height: P.pg.h * k}; };
  const pageAt = (cx, cy) => { if (S.zw) { const c = S.zw.c.getBoundingClientRect(); if (cx >= c.left && cx <= c.right && cy >= c.top && cy <= c.bottom) return S.zw.P.i ? [S.zw.P, zwRect()] : [null, null]; }
    for (const P of pages) { const r = P.el.getBoundingClientRect(); if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return [P, r]; } return [null, null]; };
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
  /* Keep native selection handles free to extend across words, lines and pages. */
  const onSelDown = e => { const L = e.target.closest && e.target.closest(".eltl"); if (L) L.classList.add("selecting"); };
  const onSelUp = () => W.querySelectorAll(".eltl.selecting").forEach(L => L.classList.remove("selecting"));
  W.addEventListener("pointerdown", onSelDown, true); addEventListener("pointerup", onSelUp); addEventListener("pointercancel", onSelUp);
  COMM.unsub.push(() => { removeEventListener("pointerup", onSelUp); removeEventListener("pointercancel", onSelUp); });
  const textLayers = on => pages.forEach(P => { if (on) textLayer(P); });
  /* ---- outline ---- */
  const outline = () => { const L = $("#el_olist"); L.innerHTML = book.pages.map((p, i) => `<button class="elth${p.bm ? " bm" : ""}" data-go="${i}"><canvas data-th="${i}"></canvas><span>${i + 1}</span></button>`).join("");
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
  const tabStrip = W.querySelector("#el_tabs");
  const reorderTab = (id, to) => {
    const nodes=[...tabStrip.querySelectorAll("[data-tab]")], from=nodes.findIndex(n=>n.dataset.tab===id);
    if(from<0 || to<0 || to>=nodes.length || from===to) return;
    const [node]=nodes.splice(from,1); nodes.splice(to,0,node);
    nodes.forEach(n=>tabStrip.insertBefore(n,tabStrip.querySelector("#el_tabadd")));
    store.set("eluTabs",nodes.map(n=>n.dataset.tab)); node.scrollIntoView({block:"nearest",inline:"nearest"});
  };
  let draggedTab=null;
  tabStrip.addEventListener("dragstart",e=>{const n=e.target.closest("[data-tab]");if(!n)return;draggedTab=n.dataset.tab;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",draggedTab);});
  tabStrip.addEventListener("dragover",e=>{if(draggedTab && e.target.closest("[data-tab]")){e.preventDefault();e.dataTransfer.dropEffect="move";}});
  tabStrip.addEventListener("drop",e=>{const n=e.target.closest("[data-tab]");if(!n||!draggedTab)return;e.preventDefault();reorderTab(draggedTab,[...tabStrip.querySelectorAll("[data-tab]")].indexOf(n));draggedTab=null;});
  tabStrip.addEventListener("dragend",()=>draggedTab=null);
  tabStrip.querySelectorAll("[data-tab-left],[data-tab-right]").forEach(button=>button.onclick=e=>{e.preventDefault();e.stopPropagation();const node=button.closest("[data-tab]"),i=[...tabStrip.querySelectorAll("[data-tab]")].indexOf(node);reorderTab(node.dataset.tab,i+(button.hasAttribute("data-tab-left")?-1:1));});

  $$("[data-close]").forEach(b => b.onclick = e => { e.preventDefault(); const t = b.dataset.close, list = store.get("eluTabs", []).filter(x => x !== t); store.set("eluTabs", list); if (t === id) go(list.length ? "#eluna/" + list[0] : "#eluna"); else b.parentElement.remove(); });
  $("#el_tabadd").onclick = async () => { const bs = (await DB.all("books")).sort((a, b) => b.updated - a.updated); const sh = sheet(`<h3>Open in a new tab</h3><div class="elpick">${bs.map(b => `<a href="#eluna/${b.id}" class="elpk">${coverHTML(b)}<span>${esc(b.title)}</span></a>`).join("")}</div><div class="btnrow"><button class="btn btn-ghost" id="tb_imp">${I.pdf} Import PDFs</button><button class="btn btn-ghost" id="tb_new">${I.plus} New notebook</button></div>`);
    $$(".elpk", sh).forEach(a => a.onclick = () => sh.remove()); $("#tb_new", sh).onclick = () => { sh.remove(); newBookSheet(); };
    $("#tb_imp", sh).onclick = () => { sh.remove(); const f = document.createElement("input"); f.type = "file"; f.accept = "application/pdf,.pdf"; f.multiple = true; f.onchange = async () => { const ids = await importPdfs([...f.files], null, t => t && nbToast(t)); if (ids.length) { store.set("eluTabs", [...new Set([...ids, ...store.get("eluTabs", [])])].slice(0, 8)); go("#eluna/" + ids[0]); } }; f.click(); }; };
  /* ---- read-only mode, outline, more ---- */
  const setRO = on => { S.ro = on; W.classList.toggle("ro", on); $("#el_robadge").hidden = !on; $("#el_ro").classList.toggle("on", on); $$(".elt").forEach(d => { if (!d.classList.contains("emo")) d.contentEditable = !on; }); textLayers(on || S.tool === "select"); };
  $("#el_ro").onclick = () => setRO(!S.ro); $("#el_edit").onclick = () => setRO(false);
  $("#el_side").onclick = () => { const o = $("#el_ol"); o.hidden = !o.hidden; const n = SET(); n.outline = !o.hidden; store.set("eluSet", n); setTimeout(relayout, 60); };
  $("#el_more").onclick = () => { const i = curPage(), isPdf = book.pages.some(p => p.type === "pdf" || p.type === "image");
    const sh = sheet(`<h3>${esc(book.title)}</h3><div class="elmenu"><button id="mo_pdf">${I.pdf}<span>Export all as PDF</span></button><button id="mo_pdf1">${I.pdf}<span>Export this page</span></button><button id="mo_tbc">${I.gear}<span>Customise toolbar</span></button><button id="mo_text">${I.select}<span>Read / copy page text</span></button><button id="mo_add">${I.plus}<span>Add page</span></button><button id="mo_page">${I.book}<span>This page…</span></button>${isPdf ? `<button id="mo_ocr1">${I.scan}<span>Recognise text: this page</span></button><button id="mo_ocra">${I.scan}<span>Recognise text: all pages</span></button>` : ""}<button id="mo_set">${I.gear}<span>Settings</span></button></div><div class="small" id="mo_m"></div>`);
    $("#mo_text", sh).onclick = async () => {
      const pg = book.pages[i]; let text = "";
      const panel = sheet('<h3>Page text</h3><p class="muted">Select any amount of text below. Scanned pages need Recognise text first.</p><textarea id="el_readtext" readonly aria-label="Selectable page text" style="width:100%;min-height:45vh;font:16px/1.6 system-ui;padding:16px"></textarea><div class="btnrow"><button class="btn" id="el_copytext">Copy selected text</button><button class="btn btn-ghost" id="el_alltext">Select all</button></div><p id="el_textstatus" role="status"></p>'); sh.remove();
      try { if(pg.type === "pdf") { const f=await DB.get("files",pg.fid); const oc=f && f.ocr && f.ocr[pg.pi]; if(oc) text=oc.text || oc.words.map(w=>w.t).join(" "); else { const doc=await pdfDoc(pg.fid), page=await doc.getPage(pg.pi+1), tc=await page.getTextContent(); text=tc.items.map(x=>x.str+(x.hasEOL?"\n":" ")).join(""); } } else if(pg.ocr) text=pg.ocr.text; else text=pg.texts.map(t=>t.t).join("\n");
        const field=$("#el_readtext",panel); field.value=text || ""; $("#el_textstatus",panel).textContent=text ? "" : "No text found. Use Recognise text for a scanned PDF or photo.";
        $("#el_alltext",panel).onclick=()=>{field.focus();field.select();};
        $("#el_copytext",panel).onclick=async()=>{ const selected=field.value.slice(field.selectionStart,field.selectionEnd); if(!selected){$("#el_textstatus",panel).textContent="Select the words you want, or choose Select all.";return;}try{await navigator.clipboard.writeText(selected);$("#el_textstatus",panel).textContent="Copied.";}catch(e){field.focus();$("#el_textstatus",panel).textContent="Use your device’s Copy command on the selected text.";} };
      }catch(e){$("#el_textstatus",panel).textContent="Could not read this page: "+e.message;}
    };
    $("#mo_pdf", sh).onclick = () => exportPdf(book, t => $("#mo_m", sh).textContent = t);
    $("#mo_pdf1", sh).onclick = () => exportPdf(Object.assign({}, book, {title: `${book.title} — page ${i + 1}`, pages: [book.pages[i]]}), t => $("#mo_m", sh).textContent = t);
    $("#mo_tbc", sh).onclick = () => { sh.remove(); tbCustom(); };
    $("#mo_add", sh).onclick = () => { sh.remove(); addSheet(i + 1); }; $("#mo_page", sh).onclick = () => { sh.remove(); pageMenu(i); };
    const o1 = $("#mo_ocr1", sh); if (o1) o1.onclick = () => { sh.remove(); runOcr([i]); }; const oa = $("#mo_ocra", sh); if (oa) oa.onclick = () => { sh.remove(); runOcr(book.pages.map((_, k) => k)); };
    $("#mo_set", sh).onclick = () => { sh.remove(); settingsSheet(() => { look(); scroll.classList.toggle("horiz", horiz()); $("#el_ol").hidden = !SET().outline; tbPlace(); relayout(); }); }; };
  /* ---- floating toolbar: drag the grip anywhere; it turns vertical near the left or right edge ---- */
  const tb = $("#el_tb");
  /* positions are measured inside the page area (the toolbar's own container), so it can reach the very top */
  const tbBox = () => (tb.offsetParent || W).getBoundingClientRect();
  const tbPlace = () => { const p = store.get("eluTb", null), r = tbBox(); tb.classList.remove("dock"); W.classList.remove("tbdock");
    if (!p || p.dock) { tb.classList.remove("vert"); tb.classList.add("dock"); W.classList.add("tbdock"); tb.style.left = tb.style.top = tb.style.transform = ""; return; }
    if (p.float) { tb.classList.remove("vert"); tb.style.left = "50%"; tb.style.top = "8px"; tb.style.transform = "translateX(-50%)"; return; }
    tb.style.transform = "none"; tb.classList.toggle("vert", !!p.v); tb.style.left = Math.max(6, Math.min(r.width - tb.offsetWidth - 6, p.x * r.width)) + "px"; tb.style.top = Math.max(6, Math.min(r.height - tb.offsetHeight - 6, p.y * r.height)) + "px"; };
  /* drag: moved with a GPU transform once per frame (no layout work), blur switched off while moving; drop at the very top to dock, at a side to stand it up */
  const tbDrag = e => { e.preventDefault(); e.stopPropagation(); closePop(); try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
    const r = tbBox(); if (tb.classList.contains("dock")) { tb.classList.remove("dock"); W.classList.remove("tbdock"); tb.style.transform = "none"; tb.style.left = Math.max(6, Math.min(r.width - tb.offsetWidth - 6, e.clientX - r.left - 30)) + "px"; tb.style.top = "6px"; }
    const t0 = tb.getBoundingClientRect(), dx = e.clientX - t0.left, dy = e.clientY - t0.top, L0 = t0.left - r.left, T0 = t0.top - r.top; tb.style.transform = "none"; tb.style.left = L0 + "px"; tb.style.top = T0 + "px"; tb.classList.add("drag");
    let last = e, raf = 0, zone = "", moved = false, nl = L0, nt = T0;
    const paint = () => { raf = 0; const x = last.clientX - r.left, y = last.clientY - r.top; if (!moved) return; const v = x < 80 || r.width - x < 80; zone = y < 40 && !v ? "dock" : ""; tb.classList.toggle("vert", v); W.classList.toggle("tbhint", zone === "dock");
      nl = Math.max(6, Math.min(r.width - tb.offsetWidth - 6, x - (v ? tb.offsetWidth / 2 : dx))); nt = Math.max(6, Math.min(r.height - tb.offsetHeight - 6, y - (v ? 20 : dy))); tb.style.transform = `translate3d(${nl - L0}px,${nt - T0}px,0)`; };
    const mv = ev => { last = ev; if (!moved && Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) > 5) moved = true; if (!raf) raf = requestAnimationFrame(paint); };
    const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); cancelAnimationFrame(raf); paint(); tb.classList.remove("drag"); W.classList.remove("tbhint");
      if (!moved) { tbPlace(); return; }
      if (zone === "dock") { store.set("eluTb", {dock: 1}); tbPlace(); nbToast("Toolbar docked at the top — drag its grip down to float it again."); return; }
      tb.style.transform = "none"; if (tb.classList.contains("vert")) nl = nl + tb.offsetWidth / 2 < r.width / 2 ? 8 : r.width - tb.offsetWidth - 8;
      tb.style.left = nl + "px"; tb.style.top = nt + "px"; store.set("eluTb", {x: nl / r.width, y: nt / r.height, v: tb.classList.contains("vert")}); };
    addEventListener("pointermove", mv, {passive: true}); addEventListener("pointerup", up); addEventListener("pointercancel", up); };
  $("#el_grip").addEventListener("pointerdown", tbDrag); tb.addEventListener("pointerdown", e => { if (e.target === tb || e.target.classList.contains("eltb-sep")) tbDrag(e); });
  $("#el_grip").addEventListener("dblclick", () => { store.set("eluTb", null); tbPlace(); });
  const tbMini = on => { tb.classList.toggle("mini", on); store.set("eluTbMini", on); $("#el_mini").title = on ? "Show all tools" : "Fold toolbar"; requestAnimationFrame(tbPlace); };
  $("#el_mini").onclick = () => tbMini(!tb.classList.contains("mini")); tbMini(store.get("eluTbMini", false));
  /* ---- tools and their options ---- */
  const pop = $("#el_pop");
  const popAt = (btn, html) => { pop.innerHTML = html; pop.hidden = false; const r = btn.getBoundingClientRect(), w = W.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(w.width - pop.offsetWidth - 8, r.left - w.left + r.width / 2 - pop.offsetWidth / 2)) + "px"; pop.style.top = (r.bottom - w.top + 8 + pop.offsetHeight > w.height ? r.top - w.top - pop.offsetHeight - 8 : r.bottom - w.top + 8) + "px"; };
  const closePop = () => { pop.hidden = true; };
  const colPop = () => { const kd = S.tool === "hl" ? "hl" : S.tool === "tape" ? "tape" : "pen", cols = kd === "hl" ? HLS : kd === "tape" ? TAPES : PENS, curC = S[kd];
    const kinds = kd === "pen" ? `<div class="elpoph">Pen type</div><div class="elseg elpenk">${PENK.map(([v, l]) => `<button class="${S.penk === v ? "on" : ""}" data-pk2="${v}">${l}</button>`).join("")}</div>` : "";
    const tapeX = kd === "tape" ? `<div class="elpoph">All tape in this notebook</div><div class="elseg"><button data-ta="hide">Hide all</button><button data-ta="show">Reveal all</button></div><small class="muted elpnote">Cover answers with tape, then tap it (finger, or the tape tool) to peek. Great for revision.</small>` : "";
    popAt($("#el_col"), `<div class="elpoph">${{hl: "Highlighter", tape: "Tape", pen: "Pen"}[kd]} colour</div><div class="elcols">${cols.map(c => `<button class="elc${c === curC ? " on" : ""}" data-c="${c}" style="--c:${c}" aria-label="Colour"></button>`).join("")}<label class="elc elcust" title="Any colour"><input type="color" id="el_cc" value="${curC}"></label></div>${kinds}<div class="elpoph">Thickness</div><div class="elsizes">${[1, 2, 3, 5, 8].map(z => `<button class="elz${z === S.size ? " on" : ""}" data-z="${z}"><i style="--z:${3 + z * 1.8}px"></i></button>`).join("")}</div>${tapeX}`);
    const setC = c => { store.set({hl: "eluHl", tape: "eluTape", pen: "eluPen"}[kd], S[kd] = c); tbUpd(); colPop(); };
    $$("[data-c]", pop).forEach(b => b.onclick = () => setC(b.dataset.c)); $("#el_cc", pop).onchange = e => setC(e.target.value);
    $$("[data-pk2]", pop).forEach(b => b.onclick = () => { store.set("eluPenK", S.penk = b.dataset.pk2); colPop(); });
    $$("[data-ta]", pop).forEach(b => b.onclick = () => { const show = b.dataset.ta === "show"; let n = 0; book.pages.forEach(pg => pg.strokes.forEach(st => { if (st.t === "tape") { st.r = show; n++; } })); pages.forEach(P => ink(P)); if (n) save(); nbToast(n ? (show ? "All tape revealed" : "All tape hidden") : "No tape in this notebook yet"); });
    $$("[data-z]", pop).forEach(b => b.onclick = () => { store.set("eluSize", S.size = +b.dataset.z); colPop(); }); };
  const subPop = k => { const opts = {eraser: [["stroke", "Stroke eraser", "removes whole lines"], ["standard", "Standard eraser", "rubs out like a real eraser"], ["precision", "Precision eraser", "fine tip for small details"]], lasso: [["free", "Freehand", "draw any shape around it"], ["rect", "Rectangle", "drag a box"]], laser: [["line", "Laser pen", "write or circle — it stays while you keep going"], ["dot", "Laser dot", "a single bright pointer"]]}[k]; if (!opts) return colPop();
    const head = {eraser: "Eraser", lasso: "Lasso — select or screenshot", laser: "Laser pointer"}[k], extra = k === "laser" ? `<div class="elpoph" style="margin-top:10px">Laser writing stays for</div><div class="elseg">${[[100, "0.1 s"], [500, "0.5 s"], [1000, "1 s"], [2000, "2 s"], [5000, "5 s"], [0, "Until clear"]].map(([v, l]) => `<button class="${LZH() === v ? "on" : ""}" data-lzh="${v}">${l}</button>`).join("")}</div>`
      : k === "lasso" ? `<div class="elpoph" style="margin-top:10px">Included in selection</div><div class="ellinc">${[["ink", "Handwriting"], ["shape", "Shapes"], ["hl", "Highlighter"], ["tape", "Tape"], ["img", "Images"], ["text", "Text boxes & stickers"]].map(([v, l]) => `<button class="elsw${LINC()[v] ? " on" : ""}" data-li="${v}"><span><b>${l}</b></span><i></i></button>`).join("")}</div><small class="muted elpnote">Circle things to move, resize, recolour or copy them. Circle an empty area for a screenshot. Tap the page with the lasso (or hold on an empty spot) for Paste and more.</small>` : "";
    popAt($(`.eltb [data-tool="${k}"]`), `<div class="elpoph">${head}</div><div class="elsub${k === "lasso" ? " elsub2" : ""}">${opts.map(([v, l, d]) => `<button class="${S.sub[k] === v ? "on" : ""}" data-sub="${v}">${k === "lasso" ? `<i class="elsubi">${v === "rect" ? I.lassoRect : I.lasso}</i>` : ""}<b>${l}</b><small>${d}</small></button>`).join("")}</div>${extra}`);
    $$("[data-sub]", pop).forEach(b => b.onclick = () => { S.sub[k] = b.dataset.sub; store.set("eluSub", S.sub); tbUpd(); subPop(k); });
    $$("[data-li]", pop).forEach(b => b.onclick = () => { const f = LINC(); f[b.dataset.li] = f[b.dataset.li] ? 0 : 1; store.set("eluLInc", f); subPop(k); });
    $$("[data-lzh]", pop).forEach(b => b.onclick = () => { store.set("eluLzHold", +b.dataset.lzh); if (lpts.some(p => p.live)) laserOff(); subPop(k); }); };
  const sweepTexts = () => pages.forEach(P => { const keep = P.pg.texts.filter(t => t.emoji || (t.t || "").trim()); if (keep.length !== P.pg.texts.length) { P.pg.texts = keep; texts(P); save(); } });
  const udUpd = () => { $("#el_undo").classList.toggle("dis", !undo.length); $("#el_redo").classList.toggle("dis", !redo.length); };
  const tbUpd = () => { sweepTexts(); udUpd(); { const pb = $('.eltb [data-tool="pen"]'), hb = $('.eltb [data-tool="hl"]'); if (pb) pb.style.setProperty("--tc", S.pen); if (hb) hb.style.setProperty("--tc", S.hl); const tp = $('.eltb [data-tool="tape"]'); if (tp) tp.style.setProperty("--tc", S.tape); } $("#el_palm").classList.toggle("on", !!S.pencil); { const lb = $('[data-tool="lasso"]', tb); lb.innerHTML = S.sub.lasso === "rect" ? I.lassoRect : I.lasso; } $$("[data-tool]", tb).forEach(b => b.classList.toggle("on", b.dataset.tool === S.tool)); $("#el_col i").style.backgroundColor = S.tool === "hl" ? S.hl : S.tool === "tape" ? S.tape : S.pen; W.dataset.tool = S.tool; W.classList.toggle("selmode", S.tool === "select"); if (S.tool !== "lasso") clearSel(); };
  $$("[data-tool]", tb).forEach(b => b.onclick = () => { const k = b.dataset.tool; if (S.tool === k && ["eraser", "lasso", "laser", "pen", "hl", "tape"].includes(k)) { pop.hidden ? subPop(k) : closePop(); return; } closePop(); S.paste = false; pasteUpd(); if (S.tool === "laser" && k !== "laser") laserFade(); store.set("eluTool", S.tool = k); tbUpd(); if (["eraser", "lasso", "laser"].includes(k)) subPop(k); if (k === "select") { textLayers(true); nbToast(book.pages.some(p => p.type === "pdf") ? "Press and hold a word to select it — then Define, Google or highlight." : "Select text works on PDFs (and pages after OCR)."); } });
  $("#el_col").onclick = () => pop.hidden ? colPop() : closePop();
  /* Apple Pencil and S Pen options */
  const penPop = () => { const p = PEN(), row = (k, l, d) => `<button class="elsw${p[k] ? " on" : ""}" data-pk="${k}"><span><b>${l}</b><small>${d}</small></span><i></i></button>`;
    popAt($("#el_sty"), `<div class="elpoph">Apple Pencil & S Pen</div>${row("ftap", "Double-tap with a finger", "switches pen ⇄ eraser. (Apple Pencil double-tap and squeeze only reach App Store apps — Safari and web apps never receive them.)")}<div class="elsub">${row("palm", "Pen only — palm rejection", "the pen writes; fingers scroll, zoom and hold to select words")}${row("pressure", "Pressure", "press harder for thicker lines")}${row("hover", "Hover preview", "see the nib before it touches (Pencil hover, S Pen air view)")}</div>
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
    /* lasso: smooth curve, soft tint, white halo under marching ants so it shows on any page, and a dot where it closes */
    if (lassoPath && lassoPath.length > 1) { const lp = lassoPath, rect = S.sub.lasso === "rect", n = lp.length; c.beginPath(); c.moveTo(lp[0].x * d, lp[0].y * d);
      for (let i = 1; i < n; i++) { const p = lp[i]; if (rect || i === n - 1) c.lineTo(p.x * d, p.y * d); else { const q = lp[i + 1]; c.quadraticCurveTo(p.x * d, p.y * d, (p.x + q.x) / 2 * d, (p.y + q.y) / 2 * d); } } c.closePath();
      c.fillStyle = "rgba(124,58,237,.09)"; c.fill(); c.setLineDash([]); c.strokeStyle = "rgba(255,255,255,.92)"; c.lineWidth = 3.4 * d; c.stroke();
      c.setLineDash([7 * d, 6 * d]); c.lineDashOffset = -performance.now() / 30 * d; c.strokeStyle = "#7c3aed"; c.lineWidth = 1.8 * d; c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
      if (!rect) { c.fillStyle = "#7c3aed"; c.beginPath(); c.arc(lp[0].x * d, lp[0].y * d, 3.6 * d, 0, 7); c.fill(); } }
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
    /* a stroke is caught when most of it (points and segment midpoints) is inside; the lasso menu chooses which kinds are included */
    const f = LINC(), kind = st => st.t === "hl" ? f.hl : st.t === "tape" ? f.tape : st.u ? f.shape : f.ink;
    const sts = P.pg.strokes.filter(st => st.t !== "px" && kind(st) && (() => { let n = 0, tot = 0; const p = st.p; for (let i = 0; i < p.length; i += 3) { tot++; if (pip([p[i], p[i + 1]], poly)) n++; if (i >= 3) { tot++; if (pip([(p[i] + p[i - 3]) / 2, (p[i + 1] + p[i - 2]) / 2], poly)) n++; } } return n / tot >= 0.45; })());
    const ims = f.img ? P.pg.imgs.filter(o => pip([o.x + o.w / 2, o.y + o.h / 2], poly)) : [], txs = f.text ? P.pg.texts.filter(t => pip([t.x + 20, t.y + 20], poly)) : [];
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
    S.zoom = next; pages.forEach(size); pages.forEach(P => { if (P.hb) hpClear(P); });
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
  const eraseAt = (P, x, y) => { const R = 12 + S.size * 3, n0 = P.pg.strokes.length; let rb = null; P.pg.strokes = P.pg.strokes.filter(st => { const keep = (() => { if (st.t === "px") return true; const p = st.p; for (let i = 0; i < p.length; i += 3) { if (Math.hypot(p[i] - x, p[i + 1] - y) < R + st.w / 2) return false; if (i >= 3) { const ax = p[i - 3], ay = p[i - 2], dx = p[i] - ax, dy = p[i + 1] - ay, den = dx * dx + dy * dy, k = den ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / den)) : 0; if (Math.hypot(ax + k * dx - x, ay + k * dy - y) < R + st.w / 2) return false; } } return true; })(); if (!keep) rb = boxU(rb, sbox(st)); return keep; });
    const t0 = P.pg.texts.length; P.pg.texts = P.pg.texts.filter(t => !(t.emoji && Math.hypot(t.x + 30 - x, t.y + 30 - y) < R + 30)); if (P.pg.texts.length !== t0) texts(P); if (P.pg.strokes.length !== n0) ink(P, rb); };
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
    if (!rg) { pageMenuAt(P, P.el.getBoundingClientRect(), cx, cy); return; }   /* hold on an empty spot: paste and more */
    const tn = rg.startContainer, s = tn.data, wc = /[\p{L}\p{N}'’-]/u; let a = Math.min(rg.startOffset, s.length), b = a;
    while (a > 0 && wc.test(s[a - 1])) a--; while (b < s.length && wc.test(s[b])) b++; if (a === b) return;
    const r2 = document.createRange(); r2.setStart(tn, a); r2.setEnd(tn, b); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r2); S.selDrag = pid == null ? null : {id: pid, P, L, tn, a, b}; try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} };
  const down = e => {
    if (disposedInput) return;
    cancelAnimationFrame(fling); fling = 0; vel = null;
    closePop();
    /* a palm is far bigger than a fingertip (iPad reports fingers around 30–55 px), so only very large contacts count as palm */
    if (e.pointerType === "touch" && (S.penDown || (S.pencil && (Math.max(e.width || 0, e.height || 0) > 72 || performance.now() - (S.lastPen || -2000) < 350)))) { rejectedTouches.add(e.pointerId); return; }
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
    const palmy = e.pointerType === "touch" && (Math.max(e.width || 0, e.height || 0) > 72 || performance.now() - (S.lastPen || 0) < 1500);
    lpClear(); if (SET().hold && !S.penDown && !palmy && !S.paste && !(S.zw && e.target === S.zw.c) && touches.size < 1 && (e.pointerType === "pen" ? ["hl", "lasso"] : ["pen", "hl", "eraser", "lasso"]).includes(S.tool)) { const x0 = e.clientX, y0 = e.clientY; lp = {id: e.pointerId, x: x0, y: y0, t: setTimeout(() => { lp = null; wordAt(x0, y0, e.pointerId); }, 520)}; }
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
    if (t === "tape") { const hit = tapeAt(P, x, y); if (hit) { cur = {id: e.pointerId, P, r, tapeTap: hit}; return; } }
    if (t === "hl" && P.pg.type !== "paper" && !P.tl) textLayer(P);
    /* pen, highlighter and tape leave the page untouched until the pen lifts, so the undo snapshot is taken then — no lag at pen-down */
    const lazy = t !== "eraser", beforeDraw = lazy ? null : snap(P.pg), redoBefore = redo.slice(); if (!lazy) pushU(P.pg, false, beforeDraw);
    if (t === "eraser" && S.sub.eraser === "stroke") { cur = {id: e.pointerId, P, r, erase: 1, beforeDraw, redoBefore}; eraseAt(P, x, y); ring = {...wxy(e), r: (12 + S.size * 3) * r.width / P.pg.w}; kick(); return; }
    const pr = e.pointerType === "pen" && PEN().pressure ? e.pressure || .5 : .55, px = t === "eraser", tp = t === "tape", w = px ? (S.sub.eraser === "precision" ? 8 : 34 + S.size * 6) : t === "hl" ? 18 + S.size * 6 : tp ? 26 + S.size * 7 : 1.2 + S.size * 1.15;
    cur = {id: e.pointerId, P, r, lazy, beforeDraw, redoBefore, st: {t: px ? "px" : t === "hl" ? "hl" : tp ? "tape" : "pen", c: t === "hl" ? S.hl : tp ? S.tape : S.pen, w, p: [+x.toFixed(1), +y.toFixed(1), pr]}, drawn: 1, ctx: P.i.getContext("2d", {desynchronized: true})};
    if (cur.st.t === "pen" && S.penk) cur.st.k = S.penk;
    if (cur.st.t !== "pen" && P.hi) P.hi.style.visibility = "hidden";
    // Snapshot existing ink once, rather than replay every previous stroke per frame.
    if (cur.st.t !== "pen") { cur.backdrop = document.createElement("canvas"); cur.backdrop.width = P.i.width; cur.backdrop.height = P.i.height; cur.backdrop.getContext("2d").drawImage(P.i, 0, 0); }
    if (px) { ring = {...wxy(e), r: w / 2 * r.width / P.pg.w}; kick(); }
    cur.snap = !!S.ruler && t === "pen"; if (cur.st.t === "pen") paintCur(cur);
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
    if (cur.lasso) { const p = wxy(e); if (S.sub.lasso === "rect") { const s0 = cur.start; lassoPath = [s0, {x: p.x, y: s0.y}, p, {x: s0.x, y: p.y}]; } else { const q = lassoPath[lassoPath.length - 1]; if (!q || Math.hypot(p.x - q.x, p.y - q.y) > 2.5) lassoPath.push(p); } kick(); return; }
    if (cur.erase) { const [x, y] = toPage(cur.P, cur.r, e.clientX, e.clientY); eraseAt(cur.P, x, y); ring = {...wxy(e), r: ring.r}; kick(); return; }
    if (cur.tapeTap || cur.shaped) return;
    if (cur.st.t === "px") { ring = {...wxy(e), r: ring.r}; kick(); }
    if (S.zw) S.zwDirty = 1;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [], pen = e.pointerType === "pen" && PEN().pressure, k = cur.st.t === "pen" ? Math.max(0, Math.min(.85, SET().smooth)) : 0.25;
    for (const ev of (evs.length ? evs : [e])) { let cx = ev.clientX, cy = ev.clientY; if (cur.snap) { const s2 = snapRuler(cx, cy); if (s2) [cx, cy] = s2; }
      const [x, y] = toPage(cur.P, cur.r, cx, cy), p = cur.st.p, n = p.length, lx = p[n - 3], ly = p[n - 2], kk = cur.snap ? 0 : k;
      const sx = lx + (x - lx) * (1 - kk), sy = ly + (y - ly) * (1 - kk), sp = p[n - 1] * .7 + (pen ? ev.pressure || .5 : .55) * .3; if (Math.abs(sx - lx) + Math.abs(sy - ly) < .5) continue; p.push(+sx.toFixed(1), +sy.toFixed(1), +sp.toFixed(3)); }
    if (cur.st.t === "tape") { const p = cur.st.p; if (p.length > 6) cur.st.p = [p[0], p[1], p[2], p[p.length - 3], p[p.length - 2], .5]; }
    /* keep the pen still for a moment on a pen stroke → it snaps into a neat shape */
    if (cur.st.t === "pen" && !cur.snap && SET().shapes) { const p = cur.st.p, hx = p[p.length - 3], hy = p[p.length - 2];
      if (!cur.hold || Math.hypot(hx - cur.hx, hy - cur.hy) > 5) { clearTimeout(cur.hold); cur.hx = hx; cur.hy = hy; const c0 = cur; cur.hold = setTimeout(() => shapeNow(c0), 550); } }
    if (!cur.raf) cur.raf = requestAnimationFrame(() => { if (!cur || !cur.st) return; cur.raf = 0; const s = sc() * cvSize.d(cur.P);
      if (cur.st.t === "pen") { const n = cur.st.p.length / 3; if (n > cur.drawn) { paintCur(cur, Math.max(2, cur.drawn)); cur.drawn = n; } } else { cur.ctx.clearRect(0, 0, cur.ctx.canvas.width, cur.ctx.canvas.height); cur.ctx.drawImage(cur.backdrop, 0, 0); stroke(cur.ctx, cur.st, s); } });
  };
  const cancel = () => {
    if (!cur) return;
    const c = cur; cur = null; clearTimeout(c.hold);
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
    const c = cur; cur = null; if (c.raf) cancelAnimationFrame(c.raf); clearTimeout(c.hold);
    if (c.backdrop) c.backdrop.width = c.backdrop.height = 0;
    if (c.tapeTap) { toggleTape(c.P, c.tapeTap); return; }
    if (c.laser) { laserOff(); return; }
    if (c.lasso) { const lp0 = lassoPath || []; let ext = 0; lp0.forEach(q => { ext = Math.max(ext, Math.abs(q.x - lp0[0].x) + Math.abs(q.y - lp0[0].y)); });
      if (lp0.length < 4 || ext < 12) { lassoPath = null; kick(); const w = W.getBoundingClientRect(), q = lp0[0] || {x: e.clientX - w.left, y: e.clientY - w.top}; pageMenuAt(c.P, c.r, q.x + w.left, q.y + w.top); return; }   /* a tap with the lasso: page menu */
      lassoFinish(c.P, c.r); return; }
    ring = null; kick();
    if (c.erase) { save(); return; }
    if (e.type !== "pointercancel" && c.st && e.clientX != null && !c.snap && !c.shaped && c.st.t !== "tape") { const [x, y] = toPage(c.P, c.r, e.clientX, e.clientY), p = c.st.p; if (Math.abs(x - p[p.length - 3]) + Math.abs(y - p[p.length - 2]) > .5) p.push(+x.toFixed(1), +y.toFixed(1), p[p.length - 1]); }
    if (c.st.t === "pen") c.st.e = 1;   /* finished: redraw so the end tapers too */
    const drawnBox = sbox(c.st);
    if (c.st.t === "hl") hlSnap(c.P, c.st);
    if (c.st.t === "tape") { const p = c.st.p; if (p.length < 6 || Math.hypot(p[3] - p[0], p[4] - p[1]) < 12) { ink(c.P, drawnBox); return; } const [ex, ey] = snapAng(p[0], p[1], p[3], p[4]); p[3] = +ex.toFixed(1); p[4] = +ey.toFixed(1); }
    if (c.lazy) pushU(c.P.pg);
    c.P.pg.strokes.push(c.st);
    /* repaint only what changed: a pen stroke is already on screen apart from its tapered end */
    if (c.st.t === "pen" && !c.shaped) { const p = c.st.p, n = p.length, m = c.st.w * 2.4 + 4; let tb = null; for (let i = Math.max(0, n - 27); i < n; i += 3) tb = boxU(tb, [p[i] - m, p[i + 1] - m, p[i] + m, p[i + 1] + m]); ink(c.P, tb); }
    else ink(c.P, boxU(drawnBox, sbox(c.st)));
    if (c.r && c.r.zv) zwAuto(c);
    save();
  };
  /* no system text selection or long-press menu while writing — only the select tool, read-only mode and text boxes select */
  const editable = n => n && n.closest(".elt:not(.emo),input,textarea,[contenteditable=true]");
  const selOK = e => { const n = e.target && (e.target.nodeType === 1 ? e.target : e.target.parentElement); return editable(n) || (n && n.closest(".eltl") && (S.ro || S.tool === "select")); };
  W.addEventListener("selectstart", e => { if (!selOK(e)) e.preventDefault(); });
  W.addEventListener("contextmenu", e => { if (!selOK(e)) e.preventDefault(); });
  /* a resting palm must never start the system's long-press selection (iPad) */
  W.addEventListener("touchstart", e => { if (!S.penDown && !S.pencil) return; const t = e.changedTouches[0]; if (!t || !scroll.contains(t.target) || editable(t.target.nodeType === 1 ? t.target : t.target.parentElement)) return;
    if (S.penDown || Math.max(t.radiusX || 0, t.radiusY || 0) * 2 > 72) e.preventDefault(); }, {passive: false});
  /* keep any selection inside one page's text layer or a text box — never the whole page, sidebar or toolbar */
  const selGuard = () => { if (!W.isConnected) return document.removeEventListener("selectionchange", selGuard); const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return;
    const el = n => n && (n.nodeType === 1 ? n : n.parentElement), a = el(s.anchorNode), f = el(s.focusNode); if (!a || !W.contains(a)) return;
    if (editable(a)) return; const la = a.closest(".eltl"); if (!la) { s.removeAllRanges(); return; }
    if (!f || f.closest(".eltl") !== la) { try { s.collapse(s.anchorNode, s.anchorOffset); } catch (er) { s.removeAllRanges(); } } };
  document.addEventListener("selectionchange", selGuard);
  scroll.addEventListener("pointerdown", down); scroll.addEventListener("pointermove", move, {passive: false}); scroll.addEventListener("pointerup", up);
  const onCancel = e => {
    if (cur && cur.id === e.pointerId && e.pointerType === "touch") cancel();
    up(e);
  };
  scroll.addEventListener("pointercancel", onCancel);
  /* ---- live painting: the page canvas, plus the sharp-zoom layer when it is showing ---- */
  const paintCur = (c, from) => { stroke(c.ctx, c.st, sc() * cvSize.d(c.P), from); const h = c.P.hr; if (c.P.hi && h && c.P.hi.width === h.w) { const hx = c.P.hi.getContext("2d"); hx.save(); hx.translate(-h.ox, -h.oy); stroke(hx, c.st, h.s, from); hx.restore(); } S.zwDirty = 1; };
  const shapeNow = c => { if (cur !== c || c.shaped || !c.st || c.st.t !== "pen") return; const r = recogniseShape(c.st.p); if (!r) return;
    c.shaped = 1; c.st.p = shapePoints(r); c.st.u = 1; if (c.raf) { cancelAnimationFrame(c.raf); c.raf = 0; } ink(c.P); paintCur(c); try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };
  /* ---- tape ---- */
  const tapeAt = (P, x, y) => { for (let i = P.pg.strokes.length - 1; i >= 0; i--) { const st = P.pg.strokes[i]; if (st.t !== "tape") continue; const p = st.p, n = p.length; if (segD([x, y], [p[0], p[1]], [p[n - 3], p[n - 2]]) <= st.w / 2 + 4) return st; } return null; };
  const toggleTape = (P, st) => { st.r = !st.r; ink(P, sbox(st)); save(); try { navigator.vibrate && navigator.vibrate(6); } catch (e) {} };
  /* ---- finger taps: two fingers = undo, three = redo, one finger on tape = peek (when fingers don't write) ---- */
  const tg = {ids: new Map(), max: 0, t0: 0, moved: false};
  const tgDown = e => { if (e.pointerType !== "touch" || rejectedTouches.has(e.pointerId)) return; if (!tg.ids.size) { tg.max = 0; tg.t0 = performance.now(); tg.moved = false; } tg.ids.set(e.pointerId, [e.clientX, e.clientY]); tg.max = Math.max(tg.max, tg.ids.size); };
  const tgMove = e => { const q = tg.ids.get(e.pointerId); if (q && Math.hypot(e.clientX - q[0], e.clientY - q[1]) > 14) tg.moved = true; };
  const tgUp = e => { const q = tg.ids.get(e.pointerId); if (!q) return; tg.ids.delete(e.pointerId); if (e.type === "pointercancel") tg.moved = true; if (tg.ids.size || tg.moved || S.penDown || performance.now() - tg.t0 > 350) return;
    if (tg.max === 2 && SET().gest && !S.ro) { if (undo.length) { restore(undo, redo); nbToast("↶ Undo"); } }
    else if (tg.max === 3 && SET().gest && !S.ro) { if (redo.length) { restore(redo, undo); nbToast("↷ Redo"); } }
    else if (tg.max === 1 && (S.pencil || S.ro || S.tool === "select")) { const [P, r] = pageAt(q[0], q[1]); if (P) { const [x, y] = toPage(P, r, q[0], q[1]), st = tapeAt(P, x, y); if (st) toggleTape(P, st); }
      /* finger double-tap = pen ⇄ eraser (stands in for Apple Pencil double-tap, which web apps never receive) */
      if (S.pencil && !S.ro && PEN().ftap) { const now = performance.now(), lt = tg.last; if (lt && now - lt.t < 330 && Math.hypot(q[0] - lt.x, q[1] - lt.y) < 45) { tg.last = null; quickSwap(); } else tg.last = {t: now, x: q[0], y: q[1]}; } } };
  scroll.addEventListener("pointerdown", tgDown); scroll.addEventListener("pointermove", tgMove, {passive: true}); addEventListener("pointerup", tgUp); addEventListener("pointercancel", tgUp);
  /* ---- zoom window: write big in the bottom panel, ink lands small inside the box on the page ---- */
  const zwEl = $("#el_zw"), zwc = $("#el_zwc"), zwFrame = document.createElement("div"); zwFrame.className = "elzwf"; zwFrame.innerHTML = '<i title="Drag to move the box"></i>';
  const zwPlace = () => { const z = S.zw; if (!z) return; const P = z.P, ck = zwc.clientWidth / z.w || 1; z.h = Math.min(P.pg.h, zwc.clientHeight / ck || z.w / 3); z.x = Math.max(0, Math.min(P.pg.w - z.w, z.x)); z.y = Math.max(0, Math.min(P.pg.h - z.h, z.y));
    if (zwFrame.parentNode !== P.el) P.el.appendChild(zwFrame); Object.assign(zwFrame.style, {left: z.x / P.pg.w * 100 + "%", top: z.y / P.pg.h * 100 + "%", width: z.w / P.pg.w * 100 + "%", height: z.h / P.pg.h * 100 + "%"}); S.zwDirty = 1; };
  const zwShow = () => { if (!S.zw) return; const fr = zwFrame.getBoundingClientRect(), sr = scroll.getBoundingClientRect(), lim = zwEl.getBoundingClientRect().top - 12;
    if (fr.top < sr.top + 12) scroll.scrollTop -= sr.top + 12 - fr.top; else if (fr.bottom > lim) scroll.scrollTop += fr.bottom - lim;
    if (fr.left < sr.left + 8) scroll.scrollLeft -= sr.left + 8 - fr.left; else if (fr.right > sr.right - 8) scroll.scrollLeft += fr.right - sr.right + 8; };
  const zwDraw = () => { const z = S.zw; if (!z) return; const D = dpr(), cw = Math.max(1, Math.round(zwc.clientWidth * D)), ch = Math.max(1, Math.round(zwc.clientHeight * D)); if (zwc.width !== cw || zwc.height !== ch) { zwc.width = cw; zwc.height = ch; zwPlace(); }
    const P = z.P, k = cw / z.w, x = zwc.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = P.pg.paper === "night" ? PAPERS.night : "#fff"; x.fillRect(0, 0, cw, ch);
    if (P.pg.type === "paper" && !P.pg.bg) { x.save(); x.translate(-z.x * k, -z.y * k); drawPaper(x, P.pg, k); x.restore(); }   /* paper lines stay razor sharp */
    else if (P.b && P.b.width) { const sb = P.b.width / P.pg.w; x.imageSmoothingQuality = "high"; x.drawImage(P.b, z.x * sb, z.y * sb, z.w * sb, z.h * sb, 0, 0, cw, ch); }
    drawInk(x, P.pg, k, {ox: z.x * k, oy: z.y * k, keep: 1}); if (cur && cur.P === P && cur.st) { x.save(); x.translate(-z.x * k, -z.y * k); stroke(x, cur.st, k); x.restore(); }
    x.fillStyle = "rgba(99,102,241,.07)"; x.fillRect(cw * .8, 0, cw * .2, ch); };
  const zwLoop = () => { if (!S.zw) return; if (S.zwDirty) { S.zwDirty = 0; zwDraw(); } S.zw.raf = requestAnimationFrame(zwLoop); };
  const zwOpen = () => { const P = pages[curPage()]; if (!P || S.ro) return; if (!P.b) attach(P); const r = P.el.getBoundingClientRect(), sr = scroll.getBoundingClientRect(), topU = Math.max(0, (sr.top - r.top) / r.height * P.pg.h);
    S.zw = {P, c: zwc, x: P.pg.w * 0.06, y: topU + P.pg.h * 0.06, w: P.pg.w * 0.4, h: 100}; zwEl.hidden = false; W.classList.add("zwon"); $("#el_zwb").classList.add("on");
    requestAnimationFrame(() => { zwPlace(); zwShow(); }); S.zw.raf = requestAnimationFrame(zwLoop);
    if (!store.get("eluZwTip", 0)) { store.set("eluZwTip", 1); nbToast("Write in the bottom panel — it lands inside the box. Drag the box's corner to move it; it moves on by itself as you reach the right edge."); } };
  const zwClose = () => { if (!S.zw) return; cancelAnimationFrame(S.zw.raf); S.zw = null; zwEl.hidden = true; zwFrame.remove(); W.classList.remove("zwon"); $("#el_zwb").classList.remove("on"); };
  const zwStep = a => { const z = S.zw; if (!z) return; const P = z.P, i = pages.indexOf(P);
    if (a === "x") return zwClose();
    if (a === "left") z.x -= z.w * 0.8; else if (a === "right") z.x += z.w * 0.8;
    else if (a === "nl") { z.x = P.pg.w * 0.06; z.y += z.h; if (z.y + z.h > P.pg.h + 1) { const N = pages[i + 1]; if (N) { if (!N.b) attach(N); z.P = N; z.y = N.pg.h * 0.05; } else z.y = P.pg.h - z.h; } }
    else if (a === "in" || a === "out") { const cx = z.x + z.w / 2, cy = z.y + z.h / 2, ar = z.h / (z.w || 1); z.w = a === "in" ? Math.max(PW * 0.12, z.w / 1.25) : Math.min(P.pg.w, z.w * 1.25); z.x = cx - z.w / 2; z.y = cy - z.w * ar / 2; }
    zwPlace(); zwShow(); };
  const zwAuto = c => { const z = S.zw; if (!z || c.P !== z.P || !SET().zwauto) return; const p = c.st.p; let mx = -1e9; for (let i = 0; i < p.length; i += 3) mx = Math.max(mx, p[i]); if (mx < z.x + z.w * 0.8) return;
    if (z.x + z.w >= z.P.pg.w - 2) zwStep("nl"); else { z.x = Math.min(z.P.pg.w - z.w, z.x + z.w * 0.55); zwPlace(); zwShow(); } };
  $("#el_zwb").onclick = () => S.zw ? zwClose() : zwOpen();
  $$("[data-zw]", zwEl).forEach(b => b.onclick = () => zwStep(b.dataset.zw));
  zwc.addEventListener("pointerdown", e => { if (e.pointerType === "touch" && S.pencil) { e.preventDefault(); return; } down(e); });
  zwFrame.addEventListener("pointerdown", e => { e.stopPropagation(); e.preventDefault(); const z = S.zw; if (!z) return; const r = z.P.el.getBoundingClientRect(), k = r.width / z.P.pg.w, sx = e.clientX, sy = e.clientY, x0 = z.x, y0 = z.y; try { zwFrame.setPointerCapture(e.pointerId); } catch (er) {}
    const mv = ev => { z.x = x0 + (ev.clientX - sx) / k; z.y = y0 + (ev.clientY - sy) / k; zwPlace(); }, end = () => { zwFrame.removeEventListener("pointermove", mv); zwFrame.removeEventListener("pointerup", end); zwFrame.removeEventListener("pointercancel", end); };
    zwFrame.addEventListener("pointermove", mv); zwFrame.addEventListener("pointerup", end); zwFrame.addEventListener("pointercancel", end); });
  /* ---- search inside this notebook: PDF text, recognised (OCR) text and text boxes ---- */
  const fbar = $("#el_fbar"), fq = $("#el_fq"), fres = $("#el_fres"), ptext = new Map(); let fhits = [], fcur = -1, ftok = 0;
  const baseText = async pg => { if (ptext.has(pg.id)) return ptext.get(pg.id); let t = "";
    try { if (pg.type === "pdf") { const f = await DB.get("files", pg.fid), oc = f && f.ocr && f.ocr[pg.pi]; if (oc) t = oc.text || (oc.words || []).map(w => w.t).join(" "); else { const d = await pdfDoc(pg.fid), page = await d.getPage(pg.pi + 1), tc = await page.getTextContent(); t = tc.items.map(x => x.str + (x.hasEOL ? "\n" : " ")).join(""); } }
      else if (pg.ocr) t = pg.ocr.text || (pg.ocr.words || []).map(w => w.t).join(" "); } catch (e) {}
    ptext.set(pg.id, t); return t; };
  const clearHits = () => W.querySelectorAll(".elhit").forEach(s => s.classList.remove("elhit", "cur"));
  const fRun = async () => { const q = fq.value.trim().toLowerCase(), tok = ++ftok, fn = $("#el_fn"); fhits = []; fcur = -1; clearHits(); if (q.length < 2) { fres.innerHTML = ""; fn.textContent = ""; return; }
    fn.textContent = "Searching…"; const out = [];
    for (let i = 0; i < book.pages.length; i++) { const pg = book.pages[i], t = (await baseText(pg)) + "\n" + pg.texts.filter(x => !x.emoji).map(x => x.t || "").join("\n"); if (tok !== ftok) return;
      const norm = t.replace(/\s+/g, " "), low = norm.toLowerCase(); let at = low.indexOf(q), k = 0; while (at >= 0 && k < 30) { out.push({i, s: norm.slice(Math.max(0, at - 40), at + q.length + 50), a: Math.min(40, at)}); at = low.indexOf(q, at + q.length); k++; }
      if (i % 6 === 5) { fn.textContent = `Searching… ${i + 1}/${book.pages.length}`; await new Promise(r => setTimeout(r)); if (tok !== ftok) return; } }
    fhits = out; fn.textContent = out.length ? `${out.length} found` : "No matches";
    fres.innerHTML = out.slice(0, 300).map((h, n) => `<button data-fh="${n}"><b>p. ${h.i + 1}</b><span>${esc(h.s.slice(0, h.a))}<mark>${esc(h.s.slice(h.a, h.a + q.length))}</mark>${esc(h.s.slice(h.a + q.length))}</span></button>`).join("")
      + (!out.length ? `<small class="muted">Search finds PDF text, recognised (OCR) text and text boxes. Handwriting is not searchable — for scanned PDFs use More ⋯ › Recognise text first.</small>` : "");
    $$("[data-fh]", fres).forEach(b => b.onclick = () => fGo(+b.dataset.fh)); };
  const fGo = async n => { if (!fhits.length) return; fcur = (n + fhits.length) % fhits.length; const h = fhits[fcur], q = fq.value.trim().toLowerCase(); $("#el_fn").textContent = `${fcur + 1} / ${fhits.length}`;
    $$("[data-fh]", fres).forEach(b => b.classList.toggle("on", +b.dataset.fh === fcur)); if (innerWidth < 760) fres.hidden = true;
    goPage(h.i); const P = pages[h.i]; if (!P) return; await new Promise(r => setTimeout(r, 80)); if (!P.b) attach(P); await textLayer(P); await new Promise(r => setTimeout(r, 140)); if (fhits[fcur] !== h) return;
    clearHits(); let first = null; P.el.querySelectorAll(".eltl span, .elt").forEach(s => { if ((s.textContent || "").toLowerCase().includes(q)) { s.classList.add("elhit"); first = first || s; } });
    if (first) { first.classList.add("cur"); const fr = first.getBoundingClientRect(), sr = scroll.getBoundingClientRect(); if (fr.top < sr.top + 70 || fr.bottom > sr.bottom - 70) scroll.scrollTop += fr.top - sr.top - sr.height / 3; } };
  const fOpen = () => { ptext.clear(); fbar.hidden = false; fres.hidden = false; $("#el_find").classList.add("on"); setTimeout(() => { fq.focus(); fq.select(); }, 30); if (fq.value.trim()) fRun(); };
  const fClose = () => { fbar.hidden = true; ftok++; clearHits(); $("#el_find").classList.remove("on"); };
  $("#el_find").onclick = () => fbar.hidden ? fOpen() : fClose();
  fq.addEventListener("input", () => { clearTimeout(fq.t); fres.hidden = false; fq.t = setTimeout(fRun, 260); });
  fq.addEventListener("focus", () => { fres.hidden = false; });
  fq.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (fhits.length) fGo(e.shiftKey ? fcur - 1 : fcur + 1); else fRun(); } else if (e.key === "Escape") fClose(); });
  $("#el_fnx").onclick = () => fGo(fcur + 1); $("#el_fp").onclick = () => fGo(fcur - 1); $("#el_fc").onclick = fClose;
  const fKey = e => { if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "f") { e.preventDefault(); fOpen(); } else if (e.key === "Escape" && S.focus && fbar.hidden && !document.querySelector(".sheet,.elsheet")) setFocus(false); };
  addEventListener("keydown", fKey);
  /* ---- page bookmarks ---- */
  const bmUpd = () => { const pg = book.pages[curPage()]; $("#el_bmk").classList.toggle("on", !!(pg && pg.bm)); };
  $("#el_bmk").onclick = () => { const i = curPage(), pg = book.pages[i]; if (!pg) return; pg.bm = !pg.bm; save(); bmUpd(); const th = W.querySelector(`.elth[data-go="${i}"]`); if (th) th.classList.toggle("bm", pg.bm); if (pages[i]) pages[i].el.classList.toggle("bmk", pg.bm); nbToast(pg.bm ? `Page ${i + 1} bookmarked` : "Bookmark removed"); };
  $("#el_bmf").onclick = () => { const L = $("#el_olist"), on = !L.classList.contains("bmonly"); if (on && !book.pages.some(p => p.bm)) { nbToast("No bookmarked pages yet — tap the bookmark at the top to add one."); return; } L.classList.toggle("bmonly", on); $("#el_bmf").classList.toggle("on", on); };
  scroll.addEventListener("scroll", () => { clearTimeout(bmUpd.t); bmUpd.t = setTimeout(bmUpd, 140); hpAll(); }, {passive: true});
  /* ---- selection handles: after holding on a word, drag either end to select a phrase, a line or a whole paragraph ---- */
  const hA = document.createElement("i"), hB = document.createElement("i"); hA.className = "elsh a"; hB.className = "elsh b"; hA.hidden = hB.hidden = true; W.append(hA, hB);
  const selRange = () => { const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return null; const n = s.anchorNode, a = n && (n.nodeType === 1 ? n : n.parentElement), L = a && a.closest && a.closest(".eltl"); return L && W.contains(L) ? {s, L, r: s.getRangeAt(0)} : null; };
  let hsDragging = false;
  const hsUpd = () => { if (!W.isConnected) return document.removeEventListener("selectionchange", hsUpd); const q = selRange(); const rs = q ? [...q.r.getClientRects()].filter(x => x.width > 0.5 && x.height > 0.5) : []; if (!rs.length) { if (!hsDragging) hA.hidden = hB.hidden = true; return; }
    const w = W.getBoundingClientRect(), f = rs[0], l = rs[rs.length - 1]; Object.assign(hA.style, {left: f.left - w.left + "px", top: f.top - w.top + "px", height: f.height + "px"}); Object.assign(hB.style, {left: l.right - w.left + "px", top: l.top - w.top + "px", height: l.height + "px"}); hA.hidden = hB.hidden = false; };
  document.addEventListener("selectionchange", hsUpd); scroll.addEventListener("scroll", () => { if (!hA.hidden) requestAnimationFrame(hsUpd); }, {passive: true});
  [[hA, false], [hB, true]].forEach(([h, isEnd]) => h.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); const q = selRange(); if (!q) return; try { h.setPointerCapture(e.pointerId); } catch (er) {}
    const r0 = q.r, fixN = isEnd ? r0.startContainer : r0.endContainer, fixO = isEnd ? r0.startOffset : r0.endOffset, L = q.L, wc = /[\p{L}\p{N}'’-]/u, hr = h.getBoundingClientRect(), dx = e.clientX - hr.left, dy = e.clientY - (hr.top + hr.height / 2); hsDragging = true;
    const mv = ev => { const rg = caretAt(ev.clientX - dx, ev.clientY - dy, L); if (!rg) return; const tn = rg.startContainer, s = tn.data; let o = Math.min(rg.startOffset, s.length);
      const after = tn === fixN ? o >= fixO : !!(fixN.compareDocumentPosition(tn) & Node.DOCUMENT_POSITION_FOLLOWING); if (after) { while (o < s.length && wc.test(s[o])) o++; } else { while (o > 0 && wc.test(s[o - 1])) o--; }
      try { getSelection().setBaseAndExtent(fixN, fixO, tn, o); } catch (er) {} hsUpd(); };
    const end = () => { hsDragging = false; h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", end); h.removeEventListener("pointercancel", end); hsUpd(); };
    h.addEventListener("pointermove", mv); h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end); }));
  COMM.unsub.push(() => document.removeEventListener("selectionchange", hsUpd));
  const quickSwap = () => { const to = S.tool === "eraser" ? (S.prevTool || "pen") : "eraser"; if (S.tool !== "eraser") S.prevTool = S.tool; closePop(); store.set("eluTool", S.tool = to); tbUpd(); nbToast(to === "eraser" ? "Eraser" : "Back to " + ({pen: "pen", hl: "highlighter", tape: "tape", lasso: "lasso", text: "text", laser: "laser"}[to] || to)); };
  /* ---- page menu: a tap with the lasso, or holding on an empty spot ---- */
  const addTextAt = (P, x, y) => { pushU(P.pg); const left = Math.max(16, Math.min(x, P.pg.w - 300)), t2 = {id: uid(), x: left, y: Math.max(16, Math.min(y, P.pg.h - 80)), w: Math.max(120, Math.min(640, P.pg.w - left - 24)), t: "", size: Math.round(20 + S.size * 4), c: S.pen}; P.pg.texts.push(t2); const d = textEl(P, t2); P.el.querySelector(".elx").appendChild(d); d.focus(); setTimeout(() => { if (document.activeElement !== d) d.focus(); }, 60); };
  const pageMenuAt = (P, r, cx, cy) => { if (S.ro || !P) return; const [x, y] = toPage(P, r, cx, cy), at = {getBoundingClientRect: () => ({left: cx, right: cx, top: cy, bottom: cy, width: 0, height: 0})};
    popAt(at, `<div class="elctx">${CLIP ? `<button data-cx="paste"><b>📋 Paste</b></button>` : ""}<button data-cx="text">${I.text || ""}<b>Text box here</b></button><button data-cx="photo">${I.image}<b>Insert photo</b></button><button data-cx="emo">${I.emoji}<b>Sticker</b></button><button data-cx="shot"><b>📸 Screenshot of page</b></button><button data-cx="page">${I.plus}<b>Add page after</b></button>${CLIP ? "" : `<small class="muted">Copy with the lasso first — then Paste appears here.</small>`}</div>`);
    $$("[data-cx]", pop).forEach(b => b.onclick = () => { const a = b.dataset.cx; closePop();
      if (a === "paste") doPaste(P, x, y); else if (a === "text") addTextAt(P, x, y); else if (a === "photo") { S.imgAsPage = null; $("#el_imgf").click(); }
      else if (a === "emo") $("#el_emo").click(); else if (a === "shot") shot(P, {x0: 0, y0: 0, x1: P.pg.w, y1: P.pg.h}); else if (a === "page") addSheet(pages.indexOf(P) + 1); }); };
  /* ---- insert menu: camera, photo, PDF pages, photo as a page ---- */
  $("#el_camf").onchange = $("#el_imgf").onchange;
  $("#el_img").onclick = () => { if (!pop.hidden) return closePop(); popAt($("#el_img"), `<div class="elpoph">Insert</div><div class="elctx"><button data-in="cam"><b>📷 Take a photo</b></button><button data-in="lib">${I.image}<b>Photo or picture</b></button><button data-in="pg">${I.plus}<b>Photo as a new page</b></button><button data-in="pdf">${I.pdf}<b>PDF pages after this one</b></button></div>`);
    $$("[data-in]", pop).forEach(b => b.onclick = () => { const a = b.dataset.in; closePop(); if (a === "cam") { S.imgAsPage = null; $("#el_camf").click(); } else if (a === "lib") { S.imgAsPage = null; $("#el_imgf").click(); } else if (a === "pg") { S.imgAsPage = curPage() + 1; $("#el_imgf").click(); } else { S.pdfAt = curPage() + 1; $("#el_pdff").click(); } }); };
  /* ---- toolbar customisation: show/hide and reorder, position, size ---- */
  const TBI = [["sideb", "Pages panel"], ["pen", "Pen"], ["hl", "Highlighter"], ["eraser", "Eraser"], ["lasso", "Lasso"], ["laser", "Laser pointer"], ["tape", "Tape"], ["text", "Text box"], ["select", "Select PDF text"], ["emo", "Stickers"], ["img", "Insert"], ["rul", "Ruler"], ["zwb", "Zoom window"], ["palm", "Palm rejection"], ["sty", "Pencil & S Pen"], ["col", "Colour & size"], ["undo", "Undo"], ["redo", "Redo"]];
  const FEATS = [["set", "full", "Full screen when writing", "only the toolbar shows — tap ⤢ on the toolbar to bring the top bar back"], ["set", "outline", "Pages panel", "thumbnails and outline at the side"], ["pen", "palm", "Palm rejection", "only the pen writes; fingers scroll and zoom"], ["pen", "pressure", "Pen pressure", "lines get thicker as you press harder"], ["pen", "hover", "Pencil hover preview", "a dot shows where the pen will land"],
    ["set", "shapes", "Shape snapping", "draw a shape and hold still"], ["set", "gest", "Finger tap undo / redo", "two fingers undo, three redo"], ["pen", "ftap", "Finger double-tap: pen ⇄ eraser", "instead of Apple Pencil double-tap"], ["set", "hold", "Hold to select words", "then drag the blue handles"], ["set", "hlsnap", "Straighten highlighter", "snaps onto the line of text"], ["set", "zwauto", "Zoom window moves on", "follows your writing to the right"], ["set", "pnum", "Page numbers", "under each page"]];
  /* ---- full screen: only the toolbar (and the pages panel if you open it) ---- */
  const setFocus = (on, quiet) => { S.focus = on; W.classList.toggle("focus", on); const b = $("#el_full"); b.classList.toggle("on", on); b.innerHTML = on ? I.unfull : I.full; b.title = on ? "Exit full screen" : "Full screen — tools only";
    if (on) { S.olWas = !$("#el_ol").hidden; $("#el_ol").hidden = true; } else if (S.olWas) $("#el_ol").hidden = false; if (!quiet) { requestAnimationFrame(tbPlace); dispatchEvent(new Event("resize")); } };
  $("#el_full").onclick = () => setFocus(!S.focus);
  const sideUpd = () => $("#el_sideb").classList.toggle("on", !$("#el_ol").hidden);
  $("#el_sideb").onclick = () => { $("#el_side").click(); sideUpd(); }; $("#el_side").addEventListener("click", () => setTimeout(sideUpd));
  setFocus(!!SET().full, true);
  const tbEl = k => tb.querySelector(`[data-tool="${k}"]`) || $("#el_" + k);
  const tbApply = () => { const cfg = store.get("eluTbCfg", null); if (!cfg) return; const keys = TBI.map(x => x[0]), order = [...(cfg.order || []).filter(k => keys.includes(k)), ...keys.filter(k => !(cfg.order || []).includes(k))], hide = cfg.hide || [], end = $("#el_tbc");
    tb.querySelectorAll(".eltb-sep").forEach(s => s.remove()); order.forEach(k => { const el = tbEl(k); if (el) { tb.insertBefore(el, end); el.hidden = hide.includes(k); } }); };
  const tbCustom = () => { closePop(); const cfg = store.get("eluTbCfg", {}) || {}, keys = TBI.map(x => x[0]); let order = [...(cfg.order || []).filter(k => keys.includes(k)), ...keys.filter(k => !(cfg.order || []).includes(k))]; const hide = new Set(cfg.hide || []), p = store.get("eluTb", null) || {};
    const sh = sheet(`<h3>${I.gear} Customise toolbar</h3>
      <div class="setrow"><div><b>Position</b><span>You can also drag the grip: to the very top to dock it, to a side to stand it up</span></div><div class="setctl">${segCtl("tc_pos", [["float", "Floating"], ["dock", "Top bar"], ["left", "Left"], ["right", "Right"]], !store.get("eluTb", null) || p.dock ? "dock" : p.v ? (p.x < .5 ? "left" : "right") : "float")}</div></div>
      <div class="setrow"><div><b>Button size</b><span>Bigger is easier with a finger</span></div><div class="setctl">${segCtl("tc_sz", [["s", "Compact"], ["m", "Normal"], ["l", "Large"]], SET().tbs)}</div></div>
      <div class="elpoph" style="margin-top:12px">Tools — switch on or off, arrows to reorder</div><div class="eltcl" id="tc_list"></div>
      <div class="elpoph" style="margin-top:14px">Features — switch on only what you want</div><div class="ellinc" id="tc_feat">${FEATS.map(([src, k, l, d]) => `<button class="elsw${(src === "pen" ? PEN() : SET())[k] ? " on" : ""}" data-ft="${src}:${k}"><span><b>${l}</b><small>${d}</small></span><i></i></button>`).join("")}</div>
      <div class="elacts" style="margin-top:12px"><button class="btn btn-ghost" id="tc_reset">Reset toolbar</button></div>`);
    $$("[data-ft]", sh).forEach(b => b.onclick = () => { const [src, k] = b.dataset.ft.split(":"); if (src === "pen") { const n = PEN(), on = !n[k]; if (k === "palm") setPalm(on); else { n[k] = on; store.set("eluPen2", n); } } else { const n = SET(); n[k] = !n[k]; store.set("eluSet", n); look(); if (k === "outline") $("#el_ol").hidden = !n[k]; if (k === "full") setFocus(n[k]); }
      b.classList.toggle("on", !!(src === "pen" ? PEN() : SET())[k]); });
    const commit = () => { store.set("eluTbCfg", {order, hide: [...hide]}); tbApply(); requestAnimationFrame(tbPlace); };
    const paint = () => { $("#tc_list", sh).innerHTML = order.map((k, i) => { const it = TBI.find(x => x[0] === k), el = tbEl(k); return `<div class="eltci"><i class="eltcic">${el ? el.innerHTML : ""}</i><b>${it[1]}</b><button data-up="${i}" aria-label="Move ${it[1]} up"${i ? "" : " disabled"}>↑</button><button data-dn="${i}" aria-label="Move ${it[1]} down"${i < order.length - 1 ? "" : " disabled"}>↓</button><button class="elsw${hide.has(k) ? "" : " on"}" data-tg="${k}" aria-label="Show ${it[1]}"><i></i></button></div>`; }).join("");
      $$("[data-up]", sh).forEach(b => b.onclick = () => { const i = +b.dataset.up; [order[i - 1], order[i]] = [order[i], order[i - 1]]; commit(); paint(); });
      $$("[data-dn]", sh).forEach(b => b.onclick = () => { const i = +b.dataset.dn; [order[i + 1], order[i]] = [order[i], order[i + 1]]; commit(); paint(); });
      $$("[data-tg]", sh).forEach(b => b.onclick = () => { const k = b.dataset.tg; if (hide.has(k)) hide.delete(k); else { if (S.tool === k) return nbToast("That tool is in use — pick another tool first."); hide.add(k); } commit(); paint(); }); };
    paint();
    $$("#tc_pos button", sh).forEach(b => b.onclick = () => { $$("#tc_pos button", sh).forEach(x => x.setAttribute("aria-pressed", x === b)); const v = b.dataset.v; store.set("eluTb", v === "float" ? {float: 1} : v === "dock" ? {dock: 1} : {x: v === "left" ? 0 : 1, y: .12, v: true}); tbPlace(); });
    $$("#tc_sz button", sh).forEach(b => b.onclick = () => { $$("#tc_sz button", sh).forEach(x => x.setAttribute("aria-pressed", x === b)); const n = SET(); n.tbs = b.dataset.v; store.set("eluSet", n); look(); requestAnimationFrame(tbPlace); });
    $("#tc_reset", sh).onclick = () => { store.set("eluTbCfg", null); store.set("eluTb", null); sh.remove(); nbToast("Toolbar reset — reopen the notebook to restore the original order."); tbPlace(); }; };
  $("#el_tbc").onclick = tbCustom; tbApply();
  /* ---- outline: your own topic headings plus the PDF's built-in chapters, in page order ---- */
  let pdfToc = null;
  const loadPdfToc = async () => { if (pdfToc) return pdfToc; const out = [], fids = [...new Set(book.pages.filter(p => p.type === "pdf").map(p => p.fid))];
    for (const fid of fids) { try { const d = await pdfDoc(fid), ol = await d.getOutline(); if (!ol) continue;
      const walk = async (items, lvl) => { for (const it of items) { let pi = -1; try { let dest = it.dest; if (typeof dest === "string") dest = await d.getDestination(dest); if (Array.isArray(dest) && dest[0] != null) pi = typeof dest[0] === "number" ? dest[0] : await d.getPageIndex(dest[0]); } catch (e) {}
        const bi = book.pages.findIndex(p => p.fid === fid && p.pi === pi); if (bi >= 0 && it.title) out.push({t: it.title, i: bi, lvl, pdf: 1}); if (it.items && it.items.length && lvl < 3) await walk(it.items, lvl + 1); } };
      await walk(ol, 0); } catch (e) {} }
    return pdfToc = out; };
  const tocPaint = async () => { const L = $("#el_toc"), cp = curPage(); L.innerHTML = `<div class="small muted" style="padding:10px">Loading outline…</div>`; const pt = await loadPdfToc();
    const mine = (book.toc || []).map(e => Object.assign({}, e, {mine: 1, i: book.pages.findIndex(p => p.id === e.pid)})).filter(e => e.i >= 0), all = [...mine, ...pt].sort((a, b) => a.i - b.i || (a.mine ? 1 : 0) - (b.mine ? 1 : 0));
    L.innerHTML = (S.ro ? "" : `<button class="eltocadd" id="el_tocadd">${I.plus}<span>Add topic for page ${cp + 1}</span></button>`) + (all.length ? all.map(e => `<div class="eltoci${e.mine ? " mine" : ""}${e.i === cp ? " on" : ""}" style="--l:${e.lvl || 0}"><button data-ti="${e.i}"><b>${esc(e.t)}</b><span>${e.i + 1}</span></button>${e.mine && !S.ro ? `<button class="eltocx" data-tx="${e.id}" aria-label="Edit topic">${I.more}</button>` : ""}</div>`).join("")
      : `<div class="cempty"><b>No outline yet</b><span>Add a topic for any page — e.g. “DKA — management”. Topics and sub-topics appear here in page order. PDFs with built-in chapters show them too.</span></div>`);
    $$("[data-ti]", L).forEach(b => b.onclick = () => { goPage(+b.dataset.ti); if (innerWidth < 700) $("#el_ol").hidden = true; });
    const ad = $("#el_tocadd", L); if (ad) ad.onclick = () => tocEdit(null); $$("[data-tx]", L).forEach(b => b.onclick = () => tocEdit((book.toc || []).find(q => q.id === b.dataset.tx))); };
  const tocEdit = e => { const i = curPage(), lv0 = e ? e.lvl || 0 : 0; const sh = sheet(`<h3>${e ? "Edit topic" : `New topic · page ${i + 1}`}</h3><input class="psname" id="tc_t" placeholder="e.g. Asthma — acute management" value="${e ? esc(e.t) : ""}" autocomplete="off"><div class="elseg" id="tc_l" style="margin:10px 0">${["Topic", "Sub-topic", "Detail"].map((l, k) => `<button class="${lv0 === k ? "on" : ""}" data-lv="${k}">${l}</button>`).join("")}</div><div class="elacts"><button class="btn" id="tc_ok">${e ? "Save" : "Add to outline"}</button>${e ? `<button class="btn btn-ghost" id="tc_del">Delete</button>` : ""}</div>`);
    let lv = lv0; $$("[data-lv]", sh).forEach(b => b.onclick = () => { lv = +b.dataset.lv; $$("[data-lv]", sh).forEach(x => x.classList.toggle("on", x === b)); });
    const t = $("#tc_t", sh); setTimeout(() => t.focus(), 60);
    $("#tc_ok", sh).onclick = () => { const v = t.value.trim(); if (!v) return t.focus(); book.toc = book.toc || []; if (e) { const x = book.toc.find(q => q.id === e.id); if (x) { x.t = v; x.lvl = lv; } } else book.toc.push({id: uid(), t: v.slice(0, 160), pid: book.pages[i].id, lvl: lv}); save(); sh.remove(); tocPaint(); };
    t.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); $("#tc_ok", sh).click(); } });
    const del = $("#tc_del", sh); if (del) del.onclick = () => { book.toc = (book.toc || []).filter(q => q.id !== e.id); save(); sh.remove(); tocPaint(); }; };
  const olTab = k => { $$("[data-ot]").forEach(b => b.classList.toggle("on", b.dataset.ot === k)); $("#el_olist").hidden = k !== "pages"; $("#el_toc").hidden = k !== "toc"; $("#el_bmf").hidden = k !== "pages"; store.set("eluOlTab", k); if (k === "toc") tocPaint(); };
  $$("[data-ot]").forEach(b => b.onclick = () => olTab(b.dataset.ot)); olTab(store.get("eluOlTab", "pages"));
  /* ---- fit the whole page on screen, or back to page width ---- */
  const fitPage = () => { const P = pages[curPage()]; if (!P) return; const full = Math.max(0.4, Math.min(1, (scroll.clientHeight - 36) * P.pg.w / P.pg.h / Math.max(1, baseW()))); if (full > 0.98 && Math.abs(S.zoom - 1) < 0.02) return nbToast("The whole page is already on screen"); const z = Math.abs(S.zoom - full) < 0.02 ? 1 : full, r = scroll.getBoundingClientRect(); setZoom(z, r.left + r.width / 2, r.top + 10); setTimeout(() => goPage(curPage()), 60); nbToast(z === 1 ? "Page width" : "Whole page"); };
  $("#el_fit").onclick = fitPage;
  COMM.unsub.push(() => { removeEventListener("pointerup", tgUp); removeEventListener("pointercancel", tgUp); removeEventListener("keydown", fKey); zwClose(); clearTimeout(hpAll.t); clearTimeout(fq.t); ftok++; });
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
.elw.selmode .elscroll,.elw.ro .elscroll{touch-action:auto}.elw.selmode .eltl,.elw.ro .eltl{pointer-events:auto}
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
.elhp{position:absolute;pointer-events:none}.elhi{mix-blend-mode:multiply}.elp.night .elhi{mix-blend-mode:normal}
.elp.bmk::after{content:"";position:absolute;top:-4px;right:22px;width:18px;height:30px;background:linear-gradient(#fb7185,#e11d48);clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%);z-index:4;pointer-events:none}
.elth{position:relative}.elth.bm::after{content:"";position:absolute;top:-3px;right:10px;width:11px;height:18px;background:#e11d48;clip-path:polygon(0 0,100% 0,100% 100%,50% 74%,0 100%)}.elolist.bmonly .elth:not(.bm){display:none}
.elbmf.on{color:#e11d48}.elbmf.on svg path,#el_bmk.on svg path{fill:currentColor;opacity:1}#el_bmk.on{color:#fecdd3}
.elfav{position:absolute;top:6px;left:6px;width:30px;height:30px;background:rgba(255,255,255,.8);border-radius:50%;color:#64748b;z-index:2;display:grid;place-items:center;padding:0}.elfav svg{width:16px;height:16px}.elfav.on{color:#f59e0b}.elfav.on svg path{fill:#f59e0b;opacity:1}
.elfind{position:absolute;top:66px;left:50%;transform:translateX(-50%);width:min(560px,calc(100% - 24px));z-index:9;background:var(--panel);color:var(--text,inherit);border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 34px -12px rgba(0,0,0,.45);overflow:hidden;animation:elpopin .18s ease-out}.elfind[hidden]{display:none}
.elfrow{display:flex;align-items:center;gap:4px;padding:5px 8px}.elfrow>svg{width:18px;height:18px;flex:none;color:var(--muted)}
.elfrow input{flex:1;min-width:0;border:0;background:transparent;font:500 16px var(--ui-font);color:inherit;padding:8px 4px;outline:0;-webkit-user-select:text;user-select:text}
.elfrow span{font-size:12px;color:var(--muted);white-space:nowrap}
.elfrow button,.elzwbar button{border:0;background:transparent;color:inherit;min-width:36px;height:36px;border-radius:9px;font:600 19px var(--ui-font);cursor:pointer;display:grid;place-items:center}.elfrow button:hover,.elzwbar button:hover{background:rgba(127,127,127,.12)}.elfrow button svg,.elzwbar button svg{width:16px;height:16px}
.elfres{max-height:min(46vh,380px);overflow-y:auto;overscroll-behavior:contain;border-top:1px solid var(--line);touch-action:pan-y}.elfres:empty,.elfres[hidden]{display:none}
.elfres button{display:flex;gap:10px;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:transparent;color:inherit;padding:9px 12px;font:13px/1.4 var(--ui-font);cursor:pointer}
.elfres button b{flex:none;color:#6366f1;font-size:12px;min-width:40px}.elfres button.on,.elfres button:hover{background:rgba(99,102,241,.09)}
.elfres mark{background:#fde047;color:#111;border-radius:2px;padding:0 1px}.elfres small{display:block;padding:10px 12px;line-height:1.4}
.eltl .elhit{background:rgba(250,204,21,.45)!important;border-radius:2px}.eltl .elhit.cur{background:rgba(249,115,22,.5)!important;box-shadow:0 0 0 2px rgba(249,115,22,.55)}.elt.elhit{box-shadow:0 0 0 2px #facc15}
.elzw{position:absolute;left:0;right:0;bottom:0;height:clamp(170px,32%,330px);z-index:8;display:flex;flex-direction:column;background:var(--panel);border-top:1px solid var(--line);box-shadow:0 -10px 30px -14px rgba(0,0,0,.45);touch-action:none;padding-bottom:env(safe-area-inset-bottom)}.elzw[hidden]{display:none}
.elzwbar{display:flex;align-items:center;gap:2px;padding:3px 8px;flex:none}.elzwh{flex:1;text-align:center;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#el_zwc{flex:1;min-height:0;width:100%;display:block;touch-action:none;cursor:crosshair}
.elzwf{position:absolute;z-index:5;border:2px solid #6366f1;border-radius:4px;background:rgba(99,102,241,.05);box-shadow:0 0 0 3px rgba(99,102,241,.14);pointer-events:none}
.elzwf i{position:absolute;right:-13px;bottom:-13px;width:26px;height:26px;border-radius:50%;background:#6366f1;border:3px solid #fff;pointer-events:auto;cursor:move;touch-action:none;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.elw.zwon .elnav,.elw.zwon .elsavestatus{display:none}
.elpenk button{flex:1}
.eltb [hidden]{display:none!important}
.eltb.drag{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:var(--panel)!important;will-change:transform;transition:none!important;cursor:grabbing}
.eltb.dock{left:0!important;top:0!important;transform:none!important;width:100%;max-width:100%;border-radius:0;border-width:0 0 1px;justify-content:safe center;padding:4px 10px;box-shadow:0 8px 18px -14px rgba(15,23,42,.55)}
.elw.tbdock .elfind{top:62px}.elw.tbdock .elbody{padding-top:54px}.elw.tbdock .elpages{padding-top:22px}.elw.ro.tbdock .elbody{padding-top:0}
.eltbdock{position:absolute;left:0;right:0;top:0;height:54px;z-index:8;display:grid;place-items:center;font:700 13px var(--ui-font);color:#6366f1;background:rgba(99,102,241,.12);border-bottom:2px dashed #6366f1;opacity:0;pointer-events:none;transition:opacity .15s}.elw.tbhint .eltbdock{opacity:1}
.elth canvas{outline:0!important}.elth.on canvas{box-shadow:0 8px 20px -8px rgba(124,58,237,.55),0 2px 8px -3px rgba(0,0,0,.35)}.elth.on span{color:#fff;background:#7c3aed;border-radius:9px;padding:1px 8px}
.elolt{display:flex;gap:2px;background:var(--panel2,rgba(127,127,127,.12));border-radius:10px;padding:2px;flex:1;margin-right:4px}.elolt button{flex:1;border:0;background:transparent;color:var(--muted);font:700 12px var(--ui-font);padding:6px 4px;border-radius:8px;cursor:pointer}.elolt button.on{background:var(--panel);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.15)}
.eltoc{flex:1;overflow-y:auto;padding:4px 8px 80px;touch-action:pan-y}.eltoc[hidden],.elolist[hidden]{display:none}
.eltocadd{display:flex;align-items:center;gap:6px;width:100%;border:1.5px dashed var(--line);background:transparent;color:#6366f1;font:700 12px var(--ui-font);padding:9px 8px;border-radius:10px;cursor:pointer;margin:4px 0 8px}.eltocadd svg{width:16px;height:16px;flex:none}
.eltoci{display:flex;align-items:center;margin-left:calc(var(--l) * 12px);border-radius:9px}.eltoci>button:first-child{flex:1;min-width:0;display:flex;gap:6px;align-items:baseline;border:0;background:transparent;color:inherit;text-align:left;padding:7px 6px;cursor:pointer;font:600 12.5px/1.3 var(--ui-font)}
.eltoci b{flex:1;min-width:0;font-weight:inherit}.eltoci span{font-size:11px;color:var(--muted)}.eltoci[style*="--l:0"] b{font-weight:800}.eltoci.mine b::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#7c3aed;margin-right:6px;vertical-align:middle}
.eltoci.on{background:rgba(124,58,237,.1)}.eltoci:hover{background:rgba(127,127,127,.08)}.eltocx{border:0;background:transparent;color:var(--muted);width:28px;height:28px;border-radius:8px;cursor:pointer;display:grid;place-items:center;flex:none}.eltocx svg{width:15px;height:15px}
.elctx{display:flex;flex-direction:column;min-width:210px;gap:2px}.elctx button{display:flex;align-items:center;gap:10px;border:0;background:transparent;color:inherit;text-align:left;padding:10px 10px;border-radius:10px;font:600 14px var(--ui-font);cursor:pointer}.elctx button:hover{background:rgba(127,127,127,.12)}.elctx button svg{width:18px;height:18px;flex:none}.elctx small{padding:6px 10px;line-height:1.35}
.ellinc{display:flex;flex-direction:column;gap:2px}
.eltcl{display:flex;flex-direction:column;gap:2px;max-height:48vh;overflow-y:auto}.eltci{display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid var(--line)}.eltci b{flex:1;font:600 14px var(--ui-font)}
.eltcic{width:30px;height:30px;display:grid;place-items:center;flex:none}.eltcic svg{width:20px;height:20px}.eltcic>i{width:18px;height:18px;border-radius:50%;background:var(--ink)}
.eltci>button[data-up],.eltci>button[data-dn]{width:34px;height:34px;border:1px solid var(--line);background:transparent;color:inherit;border-radius:9px;font-size:16px;cursor:pointer}.eltci>button:disabled{opacity:.3}
#el_fit{font-size:17px}
/* full screen: tools only */
.elw.focus .eltop,.elw.focus .elnav,.elw.focus .elsavestatus{display:none}.elw.focus.tbdock .elbody{padding-top:calc(54px + env(safe-area-inset-top))}.elw.focus .eltb.dock{padding-top:calc(4px + env(safe-area-inset-top))}
.elw.focus .elbody{height:100dvh}
/* colourful tools: each tool has its own colour; the active one gets a soft tinted pill */
.eltb [data-tool="pen"]{--ic:#4f46e5}.eltb [data-tool="hl"]{--ic:#ca8a04}.eltb [data-tool="eraser"]{--ic:#db2777}.eltb [data-tool="lasso"]{--ic:#7c3aed}.eltb [data-tool="laser"]{--ic:#dc2626}.eltb [data-tool="tape"]{--ic:#0d9488}.eltb [data-tool="text"]{--ic:#2563eb}.eltb [data-tool="select"]{--ic:#0891b2}
#el_emo{--ic:#ea580c}#el_img{--ic:#16a34a}#el_rul{--ic:#9333ea}#el_zwb{--ic:#0284c7}#el_palm{--ic:#c026d3}#el_sty{--ic:#64748b}#el_undo,#el_redo{--ic:#475569}#el_sideb{--ic:#6366f1}#el_full{--ic:#4338ca}#el_tbc,#el_mini{--ic:#94a3b8}
:root[data-mode="dark"] .eltb [data-tool="pen"]{--ic:#a5b4fc}:root[data-mode="dark"] .eltb [data-tool="hl"]{--ic:#fde047}:root[data-mode="dark"] .eltb [data-tool="text"]{--ic:#93c5fd}:root[data-mode="dark"] .eltb [data-tool="lasso"]{--ic:#c4b5fd}:root[data-mode="dark"] #el_undo,:root[data-mode="dark"] #el_redo,:root[data-mode="dark"] #el_sty{--ic:#cbd5e1}:root[data-mode="dark"] #el_full,:root[data-mode="dark"] #el_sideb{--ic:#a5b4fc}
.eltb .eltb-b{color:var(--ic,inherit)}.eltb .eltb-b:hover{background:color-mix(in srgb,var(--ic,#64748b) 12%,transparent);color:var(--ic,inherit)}
.eltb .eltb-b.on{background:color-mix(in srgb,var(--ic,#7c3aed) 17%,transparent)!important;color:var(--ic,#7c3aed)!important;box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--ic,#7c3aed) 45%,transparent)!important}
.eltb .eltb-b.on svg path[opacity]{opacity:.32}
.eltb.dock{background:linear-gradient(90deg,rgba(99,102,241,.09),transparent 35%,transparent 65%,rgba(236,72,153,.08)),color-mix(in srgb,var(--panel) 94%,transparent)}
/* soft, rounded look everywhere */
.eltb.dock{left:8px!important;top:6px!important;width:calc(100% - 16px);max-width:calc(100% - 16px);border-radius:999px;border-width:1px;padding:4px 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 10px 26px -16px rgba(15,23,42,.6)}
.elw.tbdock .elbody{padding-top:62px}.elw.focus.tbdock .elbody{padding-top:calc(62px + env(safe-area-inset-top))}.elw.focus .eltb.dock{top:calc(6px + env(safe-area-inset-top))!important;padding-top:4px}
.eltb{border-radius:999px}.eltb.vert{border-radius:28px}.eltb .eltb-b{border-radius:50%}.eltb-c{border-radius:50%}
.elpop{border-radius:22px!important}.elpop button,.elctx button,.elsub button{border-radius:14px}.elfind{border-radius:22px}.elfrow input{border-radius:12px}
.elzw{border-radius:24px 24px 0 0;overflow:hidden}.elzwbar button,.elfrow button{border-radius:50%}
.elnav{border-radius:999px!important}.elnav button{border-radius:50%}.elsavestatus{border-radius:999px!important}
.elp{border-radius:10px}.elp>canvas,.elb,.eli,.elhp{border-radius:10px}.elth canvas{border-radius:9px}.elzwf{border-radius:10px}
.elselbox{border-radius:14px}.elselbar{border-radius:999px!important}.elselbar button{border-radius:999px}
.elolt,.elolt button{border-radius:999px}.eltoci,.eltocadd{border-radius:14px}.eltcl .eltci>button[data-up],.eltcl .eltci>button[data-dn]{border-radius:50%}
.elol{border-radius:0 22px 22px 0;margin:6px 0;overflow:hidden}
#el_tbc{width:30px;height:30px;opacity:.75}#el_tbc svg{width:16px;height:16px}#el_tbc:hover{opacity:1}
.elsh{position:absolute;z-index:12;width:2px;margin-left:-1px;background:#2563eb;touch-action:none;cursor:grab;pointer-events:auto}.elsh[hidden]{display:none}
.elsh::after{content:"";position:absolute;left:50%;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.35);box-sizing:border-box}.elsh.a::after{top:-20px}.elsh.b::after{bottom:-20px}
.elsh::before{content:"";position:absolute;left:-20px;right:-20px;top:-34px;bottom:-34px}.elw{-webkit-user-select:none;user-select:none}.elw input,.elw textarea{-webkit-user-select:text;user-select:text}
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
