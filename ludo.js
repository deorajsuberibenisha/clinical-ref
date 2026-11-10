/* Ludo for Bhutan Clinical Reference — an original implementation of the traditional board game (public-domain rules).
   Modes: online with connections (Firestore "games"), against the computer, and pass-and-play on one device.
   Extras: live voice chat between players (WebRTC, signalled through Firestore), tokens ("wallets") earned by playing and
   spent on power rolls (choose the dice number), optional house rules. Loaded only when Ludo is opened. */
(function () {
  "use strict";
  const ST = [0, 13, 26, 39], STARS = [8, 21, 34, 47], SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
  const COLORS = [["Red", "#e53935", "#ffcdd2"], ["Green", "#2e9d4f", "#c8e6c9"], ["Yellow", "#f2b705", "#fff3c4"], ["Blue", "#1e78d8", "#cfe3fb"]];
  const SEAT = {2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3]}, JOIN_ORDER = [0, 2, 1, 3];
  const DEF_SET = {six: true, quick: false, block: true, star: false, power: true, capBonus: true, timer: 30};
  const RULES = [
    ["six", "Need a 6 to leave base", "Off: a 1 or a 6 brings a piece out."],
    ["quick", "Quick start", "Every player starts with one piece already on its start square."],
    ["block", "Blockades", "Two pieces of one colour on a square form a wall nobody can pass or land on."],
    ["star", "Star jump", "Land exactly on a ★ to jump ahead to the next ★."],
    ["capBonus", "Capture bonus roll", "Capturing a piece gives another roll."],
    ["power", "Power rolls", "Spend 1 token to choose your dice number (up to 2 times a game)."]];
  const PATH = (() => { const p = []; for (let c = 1; c <= 5; c++) p.push([6, c]); for (let r = 5; r >= 0; r--) p.push([r, 6]); p.push([0, 7], [0, 8]); for (let r = 1; r <= 5; r++) p.push([r, 8]); for (let c = 9; c <= 14; c++) p.push([6, c]); p.push([7, 14], [8, 14]); for (let c = 13; c >= 9; c--) p.push([8, c]); for (let r = 9; r <= 14; r++) p.push([r, 8]); p.push([14, 7], [14, 6]); for (let r = 13; r >= 9; r--) p.push([r, 6]); for (let c = 5; c >= 0; c--) p.push([8, c]); p.push([7, 0], [6, 0]); return p; })();
  const BASE = [[0, 0], [0, 9], [9, 9], [9, 0]];
  const absOf = (c, s) => (ST[c] + s) % 52;
  const clone = o => JSON.parse(JSON.stringify(o));
  const H = s => (typeof esc === "function" ? esc(s) : String(s == null ? "" : s).replace(/[&<>"]/g, m => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[m])));
  const fv = () => COMM.fb.firestore.FieldValue;
  const db = () => COMM.db;
  /* guests: anyone with an invite link can play without an account, under a name they type */
  let GUEST = null;
  const guestOf = () => { let g = store.get("ludoGuest", null); if (!g || !/^g_[a-z0-9]{6,16}$/.test(g.id || "")) { g = {id: "g_" + Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, "x").padEnd(8, "x"), name: ""}; store.set("ludoGuest", g); } return g; };
  const meId = () => (COMM.user && COMM.user.uid) || (GUEST && GUEST.id);
  const myName = () => (store.get("ludoNick", "") || (GUEST && GUEST.name) || (COMM.profile && COMM.profile.name) || "Player").slice(0, 40);
  /* traditional proverbs for the winner's moment */
  const WIN_Q = [["Fall seven times, stand up eight.", "Japanese proverb"], ["Well begun is half done.", "Aristotle"], ["Fortune favours the bold.", "Latin proverb"], ["Slow and steady wins the race.", "Aesop"], ["A smooth sea never made a skilled sailor.", "English proverb"], ["Little by little, one travels far.", "Spanish proverb"], ["Perseverance conquers all things.", "Latin proverb"], ["The best time to plant a tree was twenty years ago. The second best time is now.", "Proverb"], ["Where there is a will, there is a way.", "English proverb"], ["A journey of a thousand miles begins with a single step.", "Laozi"], ["Patience is bitter, but its fruit is sweet.", "Proverb"], ["Victory belongs to the most persevering.", "Napoleon Bonaparte"]];
  const NICK_A = ["Lucky", "Swift", "Brave", "Clever", "Mighty", "Happy", "Golden", "Thunder", "Royal", "Sunny", "Bold", "Jolly"], NICK_B = ["Takin", "Snow Leopard", "Tiger", "Yak", "Raven", "Crane", "Dragon", "Red Panda", "Eagle", "Hornbill", "Bear", "Monal"];
  const randNick = () => NICK_A[Math.floor(Math.random() * NICK_A.length)] + " " + NICK_B[Math.floor(Math.random() * NICK_B.length)];
  const nickField = (id, val) => `<label for="${id}"><b>Your nickname</b> <span class="small muted">(keep the suggestion or type your own)</span></label><div class="lurl"><input id="${id}" maxlength="24" value="${H(val)}" autocomplete="nickname" style="font-size:17px"><button type="button" class="btn btn-ghost" data-shuffle="${id}" aria-label="Suggest another nickname" title="Suggest another">🎲</button></div>`;
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-shuffle]"); if (b) { const i = document.getElementById(b.dataset.shuffle); if (i) { i.value = randNick(); i.focus(); } } });
  const linkOf = gid => location.origin + location.pathname + "#ludo/" + gid;
  async function shareLink(gid) {
    const url = linkOf(gid), text = `🎲 Play Ludo with me! Tap to join (no account needed): ${url}`;
    if (navigator.share) { try { await navigator.share({title: "Ludo game", text, url}); return; } catch (e) { if (e && e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(url); lToast("Invite link copied — paste it in WhatsApp, Messenger or any chat."); } catch (e) { prompt("Copy this invite link:", url); }
  }
  const lToast = (t, bad) => { if (!t) return; const e = document.createElement("div"); e.className = "ltoast" + (bad ? " bad" : ""); e.textContent = t; document.body.appendChild(e); setTimeout(() => e.classList.add("out"), 3200); setTimeout(() => e.remove(), 3700); };

  /* ---------- engine (pure) ---------- */
  function newState(players, set, extra) {
    const pc = {}; players.forEach(p => { pc[p.c] = [-1, -1, -1, -1]; if (set.quick) pc[p.c][0] = 0; });
    return Object.assign({players, set, pc, turn: 0, dice: 0, rolled: false, sixes: 0, ranks: [], status: "playing", log: "", pw: {}, ver: 0, mv: null}, extra || {});
  }
  const pDone = (S, p) => (S.pc[p.c] || []).every(x => x === 56);
  function others(S, c, a) { const out = []; S.players.forEach(p => { if (p.c === c || p.left) return; (S.pc[p.c] || []).forEach((q, j) => { if (q >= 0 && q <= 50 && absOf(p.c, q) === a) out.push({c: p.c, i: j}); }); }); return out; }
  function blocked(S, c, a) { if (!S.set.block) return false; const o = others(S, c, a), by = {}; o.forEach(x => by[x.c] = (by[x.c] || 0) + 1); return Object.values(by).some(n => n >= 2); }
  function legal(S, c, d) {
    const out = [], P = S.pc[c] || [];
    P.forEach((p, i) => {
      let to;
      if (p === 56) return;
      if (p === -1) { if (d === 6 || (!S.set.six && d === 1)) to = 0; else return; }
      else { to = p + d; if (to > 56) return; }
      const a0 = p === -1 ? 0 : p + 1;
      for (let s = a0; s <= Math.min(to, 50); s++) if (blocked(S, c, absOf(c, s))) return;
      if (out.some(m => m.from === p && m.to === to)) return;   /* identical pieces: one choice is enough */
      out.push({i, from: p, to});
    });
    return out;
  }
  function apply(S, c, mv) {
    let to = mv.to, jumped = false; const caps = [];
    if (S.set.star && to <= 50 && STARS.includes(absOf(c, to)) && to + 13 <= 50 && !blocked(S, c, absOf(c, to + 13))) { to += 13; jumped = true; }
    S.pc[c][mv.i] = to;
    if (to <= 50 && !SAFE.has(absOf(c, to))) others(S, c, absOf(c, to)).forEach(x => { S.pc[x.c][x.i] = -1; caps.push(x); });
    return {to, jumped, caps, home: to === 56};
  }
  function nextTurn(S, from) { const n = S.players.length; for (let k = 1; k <= n; k++) { const i = (from + k) % n, p = S.players[i]; if (!p.left && !pDone(S, p)) return i; } return -1; }
  function checkEnd(S) {
    S.players.forEach(p => { if (pDone(S, p) && !S.ranks.includes(p.uid)) S.ranks.push(p.uid); });
    const act = S.players.filter(p => !p.left && !pDone(S, p));
    if (act.length <= 1 && S.players.filter(p => !p.left || pDone(S, p)).length >= 1) { act.forEach(p => S.ranks.push(p.uid)); S.status = "done"; S.rolled = false; return true; }
    return false;
  }
  /* roll: returns the new state; "auto" means the client should move at once (one choice) */
  function doRoll(S, d) {
    const p = S.players[S.turn], c = p.c; S.dice = d; S.mv = null;
    S.sixes = d === 6 ? (S.sixes || 0) + 1 : 0;
    if (S.sixes >= 3) { S.log = `${p.name} rolled three 6s: turn lost`; S.sixes = 0; S.rolled = false; S.turn = nextTurn(S, S.turn); return S; }
    const mv = legal(S, c, d);
    if (!mv.length) { S.log = `${p.name} rolled ${d}: no move`; S.rolled = false; S.sixes = 0; S.turn = nextTurn(S, S.turn); return S; }
    S.rolled = true; S.log = `${p.name} rolled ${d}`; return S;
  }
  function doMove(S, mv) {
    const p = S.players[S.turn], c = p.c, r = apply(S, c, mv);
    const names = r.caps.map(x => (S.players.find(q => q.c === x.c) || {}).name).filter(Boolean);
    S.mv = {c, i: mv.i, from: mv.from, to: r.to, caps: r.caps, j: r.jumped ? 1 : 0, k: Date.now()};
    S.log = r.caps.length ? `${p.name} captured ${names.join(" and ")}!` : r.home ? `${p.name} brought a piece home` : r.jumped ? `${p.name} jumped star to star ★` : `${p.name} moved ${S.dice}`;
    const ended = checkEnd(S);
    const extra = !ended && !pDone(S, p) && (S.dice === 6 || r.home || (r.caps.length && S.set.capBonus));
    S.rolled = false;
    if (!ended) { if (extra) S.log += " · roll again"; else { S.sixes = 0; S.turn = nextTurn(S, S.turn); } }
    return S;
  }
  /* computer player: weighs finishing, capturing, safety and progress */
  function danger(S, c, step) {
    if (step < 0 || step > 50) return 0; const a = absOf(c, step); if (SAFE.has(a)) return 0; let n = 0;
    S.players.forEach(p => { if (p.c === c || p.left) return; (S.pc[p.c] || []).forEach(q => { if (q < 0 || q > 50) return; const qa = absOf(p.c, q); const dist = (a - qa + 52) % 52; if (dist >= 1 && dist <= 6 && q + dist <= 50) n++; }); });
    return n;
  }
  function botPick(S, c, moves, level) {
    if (level === "easy" && Math.random() < 0.45) return moves[Math.floor(Math.random() * moves.length)];
    let best = moves[0], bs = -1e9;
    moves.forEach(m => { const T = clone(S), r = apply(T, c, m); let s = 0;
      if (r.home) s += 120; if (r.caps.length) s += 80 * r.caps.length; if (m.from === -1) s += 45; if (r.jumped) s += 35;
      if (r.to > 50 && m.from <= 50) s += 40; if (r.to <= 50 && SAFE.has(absOf(c, r.to))) s += 22;
      s -= danger(T, c, r.to) * 30; if (m.from >= 0) s += danger(S, c, m.from) * 24; s += r.to * 0.6 + Math.random() * 3;
      if (s > bs) { bs = s; best = m; } });
    return best;
  }

  /* ---------- sounds and haptics ---------- */
  let AC = null; const snd = (type) => { if (store.get("ludoSnd", true) === false) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime;
    const tone = (f, d, at, ty, v) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = ty || "sine"; o.frequency.value = f; g.gain.setValueAtTime(v || 0.12, t + at); g.gain.exponentialRampToValueAtTime(0.0001, t + at + d); o.connect(g); g.connect(AC.destination); o.start(t + at); o.stop(t + at + d + 0.02); };
    if (type === "roll") for (let k = 0; k < 6; k++) tone(180 + Math.random() * 260, 0.05, k * 0.06, "square", 0.05);
    else if (type === "hop") tone(620, 0.06, 0, "triangle", 0.08);
    else if (type === "cap") { tone(520, 0.12, 0, "sawtooth", 0.09); tone(260, 0.25, 0.1, "sawtooth", 0.09); }
    else if (type === "home") [523, 659, 784].forEach((f, k) => tone(f, 0.14, k * 0.1, "triangle", 0.1));
    else if (type === "win") [523, 659, 784, 1046, 784, 1046].forEach((f, k) => tone(f, 0.18, k * 0.13, "triangle", 0.12));
    else if (type === "turn") tone(880, 0.1, 0, "sine", 0.08);
  } catch (e) {} };
  const buzz = ms => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };

  /* ---------- board drawing ---------- */
  const cell = (r, c) => [c + 0.5, r + 0.5];
  function piecePos(c, step, i) {
    if (step === -1) { const [r0, c0] = BASE[c]; const o = [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]][i]; return [c0 + o[1] + 0.5, r0 + o[0] + 0.5]; }
    if (step <= 50) { const [r, cc] = PATH[absOf(c, step)]; return cell(r, cc); }
    if (step <= 55) { const k = step - 51; return c === 0 ? cell(7, 1 + k) : c === 1 ? cell(1 + k, 7) : c === 2 ? cell(7, 13 - k) : cell(13 - k, 7); }
    const ctr = [[6.55, 7.5], [7.5, 6.55], [8.45, 7.5], [7.5, 8.45]][c], off = [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]][i];
    return [ctr[0] + off[0] * 0.8, ctr[1] + off[1] * 0.8];
  }
  function boardSVG() {
    let g = "";
    const sq = (r, c, fill, extra) => `<rect x="${c}" y="${r}" width="1" height="1" fill="${fill}" stroke="var(--lb-line)" stroke-width="0.03"${extra || ""}/>`;
    PATH.forEach(([r, c], a) => { const st = ST.indexOf(a); g += sq(r, c, st >= 0 ? COLORS[st][1] : "var(--lb-cell)"); if (STARS.includes(a)) g += `<text x="${c + 0.5}" y="${r + 0.73}" text-anchor="middle" font-size="0.62" fill="var(--lb-star)">★</text>`; if (st >= 0) g += `<text x="${c + 0.5}" y="${r + 0.72}" text-anchor="middle" font-size="0.55" fill="#fff">➜</text>`.replace("➜", ["→", "↓", "←", "↑"][st]); });
    for (let k = 0; k < 5; k++) { g += sq(7, 1 + k, COLORS[0][1]); g += sq(1 + k, 7, COLORS[1][1]); g += sq(7, 13 - k, COLORS[2][1]); g += sq(13 - k, 7, COLORS[3][1]); }
    BASE.forEach(([r0, c0], c) => { g += `<rect x="${c0}" y="${r0}" width="6" height="6" rx="0.35" fill="${COLORS[c][1]}"/><rect x="${c0 + 0.75}" y="${r0 + 0.75}" width="4.5" height="4.5" rx="0.5" fill="var(--lb-base)"/>`;
      [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]].forEach(o => g += `<circle cx="${c0 + o[1] + 0.5}" cy="${r0 + o[0] + 0.5}" r="0.62" fill="${COLORS[c][2]}" stroke="${COLORS[c][1]}" stroke-width="0.08"/>`); });
    g += `<polygon points="6,6 6,9 7.5,7.5" fill="${COLORS[0][1]}"/><polygon points="6,6 9,6 7.5,7.5" fill="${COLORS[1][1]}"/><polygon points="9,6 9,9 7.5,7.5" fill="${COLORS[2][1]}"/><polygon points="6,9 9,9 7.5,7.5" fill="${COLORS[3][1]}"/><circle cx="7.5" cy="7.5" r="0.42" fill="var(--lb-base)" opacity=".9"/><text x="7.5" y="7.72" text-anchor="middle" font-size="0.6">🏠</text>`;
    return `<svg class="lboard" viewBox="-0.1 -0.1 15.2 15.2" role="img" aria-label="Ludo board"><rect x="-0.1" y="-0.1" width="15.2" height="15.2" rx="0.5" fill="var(--lb-bg)"/>${g}<g class="lpcs"></g></svg>`;
  }
  const DOTS = {1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9]};
  const diceFace = d => `<span class="ldf">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<i${(DOTS[d] || []).includes(k) ? ' class="on"' : ""}></i>`).join("")}</span>`;

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById("ludocss")) return;
    const s = document.createElement("style"); s.id = "ludocss";
    s.textContent = `
.ludoroot{--lb-bg:#fffdf7;--lb-cell:#ffffff;--lb-line:#d9d2c3;--lb-base:#fffaf0;--lb-star:#9a8a6a;max-width:760px;margin:0 auto}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .ludoroot{--lb-bg:#1e2326;--lb-cell:#2a3034;--lb-line:#3c444a;--lb-base:#252b2f;--lb-star:#c9b98f}}
:root[data-theme=dark] .ludoroot{--lb-bg:#1e2326;--lb-cell:#2a3034;--lb-line:#3c444a;--lb-base:#252b2f;--lb-star:#c9b98f}
.lhero{border-radius:22px;padding:18px;color:#fff;background:linear-gradient(135deg,#e53935,#f2b705 40%,#2e9d4f 70%,#1e78d8);box-shadow:0 14px 34px -18px rgba(0,0,0,.6);position:relative;overflow:hidden}
.lhero h1{margin:0;font-size:30px;letter-spacing:.5px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.25)}.lhero p{margin:4px 0 0;opacity:.95;font-size:13.5px}
.lwal{position:absolute;right:14px;top:14px;background:rgba(0,0,0,.28);backdrop-filter:blur(6px);border-radius:99px;padding:6px 12px;font-weight:800;font-size:14px}
.lmodes{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:10px;margin:14px 0}
.lmode{display:flex;gap:12px;align-items:center;text-align:left;padding:14px;border-radius:18px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;cursor:pointer;box-shadow:0 6px 18px -14px rgba(0,0,0,.5)}
.lmode .lmi{flex:none;width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:24px;background:var(--c);color:#fff}.lmode b{display:block;font-size:15px}.lmode small{color:var(--muted);font-size:12.5px;line-height:1.35}
.lgame{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:var(--panel);margin:6px 0;color:var(--ink);text-decoration:none}.lgame .lgt{flex:1;min-width:0}.lgame small{color:var(--muted)}
.lpill{font-size:12px;font-weight:800;padding:4px 10px;border-radius:99px;background:var(--panel2)}.lpill.go{background:#2e9d4f;color:#fff}.lpill.wait{background:#f2b705;color:#3a2c00}
.lplay{display:flex;flex-direction:column;gap:10px}
.ltop{display:flex;align-items:center;gap:8px}.ltop h2{margin:0;flex:1;font-size:18px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (max-width:560px){.lplay>.ltop{gap:5px}.lplay>.ltop h2{font-size:0;flex:1}.lplay>.ltop .lbtn{padding:7px 10px}.lplay>.ltop .lback{padding:7px 12px}}
.lseats{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lseat{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:14px;background:var(--panel);border:2px solid var(--line);min-width:0;position:relative;transition:border-color .2s,box-shadow .2s,transform .2s}
.lseat.now{border-color:var(--pc);box-shadow:0 0 0 4px color-mix(in srgb,var(--pc) 25%,transparent);transform:translateY(-1px)}
.lseat .ldot{flex:none;width:30px;height:30px;border-radius:50%;background:var(--pc);display:grid;place-items:center;color:#fff;font-weight:800;font-size:13px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)}
.lseat .lsn{flex:1;min-width:0}.lseat b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lseat small{font-size:11.5px;color:var(--muted)}
.lseat.talk .ldot{animation:ltalk .6s ease-in-out infinite alternate}@keyframes ltalk{to{box-shadow:0 0 0 6px color-mix(in srgb,var(--pc) 45%,transparent)}}
.lseat .lrank{font-size:18px}.lemo{position:absolute;right:6px;top:-14px;font-size:28px;animation:lemo 2.2s ease forwards;pointer-events:none}@keyframes lemo{0%{transform:scale(.3) translateY(10px);opacity:0}15%{transform:scale(1.2);opacity:1}80%{opacity:1}100%{transform:translateY(-26px);opacity:0}}
.lbwrap{position:relative;width:min(100%,calc(100vh - 360px),640px);width:min(100%,calc(100dvh - 360px),640px);min-width:min(100%,280px);margin:0 auto;aspect-ratio:1}
.lplay .lseats .lseat{order:var(--o)}
@media (max-width:520px){.lplay{gap:7px}.lseat{padding:5px 8px}.lseat .ldot{width:26px;height:26px}.ldice{width:64px;height:64px}.ldf{grid-template-columns:repeat(3,11px);grid-template-rows:repeat(3,11px);gap:3px}}
.lboard{width:100%;height:100%;display:block;border-radius:16px;box-shadow:0 18px 40px -22px rgba(0,0,0,.55)}
.lp{transition:transform .15s ease-out;cursor:pointer}.lp circle.b{filter:drop-shadow(0 .06px .08px rgba(0,0,0,.5))}
.lp.can circle.ring{animation:lring .8s ease-in-out infinite alternate}@keyframes lring{from{r:.5;opacity:.95}to{r:.62;opacity:.35}}
.lbar{display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap}
.ldice{width:76px;height:76px;border-radius:18px;border:0;background:linear-gradient(145deg,#fff,#eee);box-shadow:0 8px 0 #c9c2b2,0 14px 22px -8px rgba(0,0,0,.5);display:grid;place-items:center;cursor:pointer;transition:transform .1s}
.ldice:active{transform:translateY(4px);box-shadow:0 4px 0 #c9c2b2}.ldice[disabled]{opacity:.55;cursor:default}
.ldice.spin{animation:lspin .5s ease-in-out}@keyframes lspin{0%{transform:rotate(0) scale(1)}40%{transform:rotate(200deg) scale(.86)}100%{transform:rotate(360deg) scale(1)}}
.ldice.mine{outline:4px solid var(--pc);outline-offset:3px}
.ldf{display:grid;grid-template-columns:repeat(3,13px);grid-template-rows:repeat(3,13px);gap:4px}.ldf i{border-radius:50%}.ldf i.on{background:#222;box-shadow:inset 0 -2px 0 rgba(255,255,255,.25)}
.lmsg{text-align:center;font-weight:700;min-height:22px;font-size:14px}
.lbtn{border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;font-weight:700;font-size:13px;padding:8px 12px;border-radius:99px;cursor:pointer}.lbtn.on{background:#2e9d4f;color:#fff;border-color:#2e9d4f}.lbtn.red{background:#e53935;color:#fff;border-color:#e53935}
.ltools{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.lemos{display:flex;gap:4px;justify-content:center}.lemos button{border:0;background:var(--panel2);border-radius:12px;font-size:22px;padding:4px 7px;cursor:pointer}
.ltimer{height:5px;border-radius:99px;background:var(--panel2);overflow:hidden}.ltimer i{display:block;height:100%;background:var(--pc,#2e9d4f);transition:width 1s linear}
.lpick{display:flex;gap:8px;justify-content:center}.lpick button{width:46px;height:46px;border-radius:12px;border:1px solid var(--line);background:#fff;cursor:pointer;display:grid;place-items:center}.lpick .ldf{grid-template-columns:repeat(3,7px);grid-template-rows:repeat(3,7px);gap:2px}
.lset{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}.lset span{display:block;font-size:12px;color:var(--muted)}
.lwin{text-align:center;padding:18px;border-radius:20px;background:linear-gradient(135deg,color-mix(in srgb,#f2b705 22%,var(--panel)),var(--panel));border:1px solid var(--line)}.lwin h2{margin:4px 0;font-size:24px}
.lconf{position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden}.lconf i{position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;animation:lfall 2.6s linear forwards}@keyframes lfall{to{transform:translateY(105vh) rotate(720deg)}}
.lrules li{margin:5px 0}
@media (min-width:900px) and (min-aspect-ratio:5/4){.ludoroot{max-width:1180px}.lplay{display:grid;grid-template-columns:minmax(0,1fr) 320px;column-gap:20px;row-gap:10px;align-items:start}.lplay>*{grid-column:2}.lplay>.ltop{grid-column:1/-1}.lplay>.lbwrap{grid-column:1;grid-row:2/span 9;width:min(100%,calc(100dvh - 110px));min-width:420px}.lplay .lseats{grid-template-columns:1fr}.lplay .lbar{justify-content:flex-start}.lplay .lmsg{text-align:left}}
:fullscreen .ludoroot,.ludoroot:fullscreen{background:var(--bg);padding:12px;overflow:auto}
.lcel{position:fixed;inset:0;z-index:99;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:radial-gradient(circle at 50% 40%,color-mix(in srgb,var(--wc) 55%,#1a0d2e) 0,#120a1f 70%);overflow:hidden;animation:lcin .45s ease-out;transition:opacity .45s}.lcel.out{opacity:0}@keyframes lcin{from{opacity:0}}
.lrays{position:absolute;left:50%;top:40%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;background:repeating-conic-gradient(rgba(255,255,255,.13) 0 6deg,transparent 6deg 18deg);animation:lray 16s linear infinite;pointer-events:none}@keyframes lray{to{transform:rotate(360deg)}}
.lflower{width:min(78vw,52vh,420px);height:auto;position:relative;filter:drop-shadow(0 18px 40px rgba(0,0,0,.45))}
.lspin{animation:lray 24s linear infinite;transform-origin:0 0}
.lpet{transform:rotate(var(--r)) scale(0);transform-origin:0 0;animation:lbloom .9s cubic-bezier(.2,1.6,.4,1) forwards;animation-delay:var(--d)}@keyframes lbloom{to{transform:rotate(var(--r)) scale(1)}}
.lctr{transform:scale(0);transform-origin:0 0;animation:lpop .6s cubic-bezier(.2,1.8,.4,1) 1s forwards}@keyframes lpop{to{transform:scale(1)}}
.lcelt{position:relative;text-align:center;color:#fff;padding:0 18px;animation:lup .7s ease-out 1.1s both}@keyframes lup{from{opacity:0;transform:translateY(24px)}}
.lcelt h1{margin:4px 0;font-size:clamp(26px,7vw,44px);line-height:1.1;background:linear-gradient(90deg,#fff59d,#ffffff,#ffd54f);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 2px 20px rgba(255,215,64,.35)}
.lcelt p{margin:4px 0;font-size:15px;opacity:.95}.lcels{font-weight:800;color:#ffe082}.lcrown{font-size:44px;animation:lcrown 1.6s ease-in-out infinite alternate}@keyframes lcrown{to{transform:translateY(-8px) rotate(-6deg)}}
.lcelb{margin-top:14px;border:0;border-radius:99px;padding:13px 34px;font:inherit;font-weight:800;font-size:16px;color:#3a2600;background:linear-gradient(135deg,#ffe082,#ffb300);box-shadow:0 10px 28px -8px rgba(255,179,0,.7);cursor:pointer}
.lquote{margin:12px auto 2px;max-width:440px;padding:12px 16px;border-radius:16px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(6px);font-size:17px;font-style:italic;line-height:1.4;animation:lup .7s ease-out 1.8s both}.lquote small{display:block;margin-top:4px;font-style:normal;font-size:12.5px;opacity:.85}
.lfw{position:absolute;width:0;height:0;pointer-events:none}.lfw i{position:absolute;width:7px;height:7px;border-radius:50%;animation:lfwb 1.3s ease-out forwards;box-shadow:0 0 8px currentColor}@keyframes lfwb{0%{transform:translate(0,0);opacity:1}80%{opacity:1}100%{transform:translate(var(--x),calc(var(--y) + 30px));opacity:0}}
.lmode.lbig{width:100%;margin-top:14px;padding:16px;background:linear-gradient(135deg,color-mix(in srgb,#8e24aa 14%,var(--panel)),color-mix(in srgb,#1e78d8 10%,var(--panel)));border-color:color-mix(in srgb,#8e24aa 40%,var(--line))}.lmode.lbig b{font-size:16.5px}.lgo{margin-left:auto;flex:none;font-weight:800;color:#fff;background:#8e24aa;padding:8px 14px;border-radius:99px;font-size:14px}
.lshare{border-radius:18px;padding:14px;background:linear-gradient(135deg,color-mix(in srgb,#8e24aa 16%,var(--panel)),var(--panel));border:1px solid color-mix(in srgb,#8e24aa 40%,var(--line));margin:10px 0}.lshare b{font-size:15.5px}.lurl{display:flex;gap:6px;margin-top:8px}.lurl input{flex:1;min-width:0;font-size:13px;padding:9px 10px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--ink)}
.lmode.lparty{background:linear-gradient(135deg,color-mix(in srgb,#ff6f00 18%,var(--panel)),color-mix(in srgb,#e91e63 12%,var(--panel)));border-color:color-mix(in srgb,#ff6f00 45%,var(--line))}.lmode.lparty .lmi{background:linear-gradient(135deg,#ff6f00,#e91e63)}.lmode.lparty .lgo{background:linear-gradient(135deg,#ff6f00,#e91e63)}
.lteams{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:10px;margin:10px 0}
.lteam{border-radius:16px;padding:12px;background:linear-gradient(180deg,color-mix(in srgb,var(--pc) 16%,var(--panel)),var(--panel));border:2px solid color-mix(in srgb,var(--pc) 55%,var(--line));display:flex;flex-direction:column;gap:8px}
.lteamh{display:flex;align-items:center;gap:8px}.lteamh .ldot{width:18px;height:18px;border-radius:50%;background:var(--pc)}.lteamh b{flex:1}.ltm{display:flex;flex-wrap:wrap;gap:5px;min-height:28px}.ltm span{font-size:12.5px;font-weight:700;padding:4px 9px;border-radius:99px;background:var(--panel);border:1px solid var(--line)}
.lnext{color:var(--pc)}
.lback{display:inline-flex;align-items:center;gap:4px;padding:8px 14px;border-radius:99px;background:var(--panel);border:1px solid var(--line);color:var(--ink);text-decoration:none;font-weight:800;font-size:14px;box-shadow:0 4px 12px -8px rgba(0,0,0,.5)}
.lvn{display:inline-flex;align-items:center;gap:6px}.lvn.rec{background:#e53935;color:#fff;border-color:#e53935;animation:lrec 1s ease-in-out infinite alternate}@keyframes lrec{to{box-shadow:0 0 0 6px rgba(229,57,53,.25)}}
.lnote{position:absolute;left:8px;bottom:-12px;font-size:11px;font-weight:800;background:#1e78d8;color:#fff;border-radius:99px;padding:2px 8px;border:0;cursor:pointer;z-index:2}
.ltoast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:95;background:#222;color:#fff;padding:10px 16px;border-radius:14px;font-size:14px;font-weight:600;box-shadow:0 10px 30px -10px rgba(0,0,0,.6);max-width:88vw;text-align:center;transition:opacity .4s}.ltoast.bad{background:#c62828}.ltoast.out{opacity:0}`;
    document.head.appendChild(s);
  }

  /* ---------- wallet (tokens) ---------- */
  const WAL = {n: null, unsub: null}, MIN_TOK = -10;   /* power rolls may take the balance down to −10 */
  const tkOf = () => online() && WAL.n != null ? {tk: WAL.n} : {};
  function walletRef(uid) { return db().collection("wallets").doc(uid || meId()); }
  function walletWatch(cb) {
    if (!online()) return;
    if (WAL.unsub) WAL.unsub();
    WAL.unsub = walletRef().onSnapshot(d => { if (!d.exists) { walletRef().set({tokens: 10, claimed: [], ts: fv().serverTimestamp()}).catch(() => {}); WAL.n = 10; } else WAL.n = d.data().tokens || 0; cb && cb(); $$(".lwalN").forEach(e => e.textContent = WAL.n); }, () => {});
  }
  async function spendToken() { const ref = walletRef(); await db().runTransaction(async t => { const d = await t.get(ref); const n = d.exists ? d.data().tokens || 0 : 0; if (n <= MIN_TOK) throw new Error(`You're at ${MIN_TOK} tokens — play games to earn more.`); t.update(ref, {tokens: n - 1}); }); }
  async function claimReward(gid, S) {
    if (!online()) return 0;
    const me = meId(), ref = walletRef(), humans = S.players.filter(p => !p.bot).length; if (humans < 2 || !S.players.some(p => p.uid === me)) return 0;
    let got = 0;
    await db().runTransaction(async t => { const d = await t.get(ref); if (!d.exists) return; const w = d.data(); if ((w.claimed || []).includes(gid)) return; got = S.ranks[0] === me ? 5 : 1; t.update(ref, {tokens: (w.tokens || 0) + got, claimed: fv().arrayUnion(gid), last: gid}); });
    return got;
  }
  const online = () => typeof COMM !== "undefined" && COMM.state === "in" && COMM.db && COMM.user && COMM.profile;

  /* ---------- home ---------- */
  let CUR = null;   /* the running game controller */
  function mount(root, arg) {
    css(); if (CUR) { CUR.stop(); CUR = null; }
    if (!arg) return home(root);
    if (arg === "cpu" || arg === "pass") return setupLocal(root, arg);
    if (online()) { GUEST = null; return playOnline(root, arg); }
    if (!(typeof COMM !== "undefined" && COMM.db)) { root.innerHTML = `<div class="ltop"><a class="lback" href="#ludo">‹ Back</a></div><div class="card">Online play needs an internet connection. Try again when you're online.</div>`; return; }
    guestGate(root, arg);
  }
  function guestGate(root, gid) {
    const g = guestOf();
    root.innerHTML = `<div class="ltop"><a class="lback" href="#ludo">‹ Ludo</a></div><div class="lhero" style="margin-top:8px"><h1>🎲 You're invited!</h1><p>Join this Ludo game — no account needed.</p></div>
      <div class="card">${nickField("lg_nm", g.name || randNick())}
      <button class="btn" id="lg_go" style="width:100%;margin-top:12px">Join the game</button>
      <p class="small muted" style="margin:10px 0 0">Have an account? <a href="#chat">Sign in</a> to earn tokens and play with your connections.</p></div>`;
    const inp = root.querySelector("#lg_nm"), go1 = () => { const n = inp.value.trim().replace(/\s+/g, " "); if (n.length < 2) { lToast("Type your name (at least 2 letters).", true); inp.focus(); return; } g.name = n.slice(0, 24); store.set("ludoGuest", g); GUEST = g; playOnline(root, gid); };
    root.querySelector("#lg_go").onclick = go1; inp.addEventListener("keydown", e => { if (e.key === "Enter") go1(); });
    if (!g.name) setTimeout(() => inp.focus(), 200);
  }
  function home(root) {
    root.innerHTML = `<div class="ltop" style="margin-bottom:8px"><a class="lback" href="#chat" aria-label="Back to Chat">‹ Chat</a><span style="flex:1"></span><a class="lback" href="#home" aria-label="Home">⌂ Home</a></div><div class="lhero"><h1>🎲 Ludo</h1><p>Play with your connections online, with live voice, or practise against the computer.</p>${online() ? `<span class="lwal">🪙 <span class="lwalN">${WAL.n ?? "…"}</span> tokens</span>` : ""}</div>
      <button class="lmode lbig" id="lm_link" style="--c:#8e24aa"><span class="lmi">🔗</span><span><b>Create a game &amp; share the link</b><small>Send it on WhatsApp, Messenger or any chat — anyone can join from anywhere, even without an account</small></span><span class="lgo">Start ›</span></button>
      <button class="lmode lbig lparty" id="lm_party"><span class="lmi">🎉</span><span><b>Ludo Party — 10 to 20 players</b><small>Everyone joins one of 4 colour teams by link and takes turns rolling for the team. A whole-ward game!</small></span><span class="lgo">Party ›</span></button>
      <div class="lmodes">
        <button class="lmode" id="lm_on" style="--c:#2e9d4f"><span class="lmi">👥</span><span><b>Invite connections</b><small>Pick 1–3 colleagues · they get a notification</small></span></button>
        <button class="lmode" id="lm_cpu" style="--c:#1e78d8"><span class="lmi">🤖</span><span><b>Play vs computer</b><small>1–3 computer players · easy or clever</small></span></button>
        <button class="lmode" id="lm_pass" style="--c:#e53935"><span class="lmi">📱</span><span><b>Pass and play</b><small>2–4 people on this device</small></span></button>
        <button class="lmode" id="lm_rules" style="--c:#f2b705"><span class="lmi">📜</span><span><b>Rules and tokens</b><small>How to play, house rules, power rolls</small></span></button></div>
      <h2 style="font-size:17px;margin:14px 0 6px">Your online games</h2><div id="lg_list"><div class="muted small">${online() ? "Loading…" : "Sign in to the app to play online."}</div></div>
      ${online() && COMM.isAdmin ? `<details class="card" style="margin-top:14px"><summary><b>Give tokens</b> (administrator)</summary><div class="small muted" style="margin:6px 0">Add tokens to a member's wallet.</div><button class="lbtn" id="lg_give">Choose people…</button> <input id="lg_amt" type="number" min="1" max="100" value="10" style="width:80px"> tokens<div id="lg_gm" class="small"></div></details>` : ""}`;
    const on = (id, f) => { const e = root.querySelector("#" + id); if (e) e.onclick = f; };
    on("lm_cpu", () => go("#ludo/cpu")); on("lm_pass", () => go("#ludo/pass")); on("lm_rules", rulesSheet);
    const needIn = () => { lToast("Sign in to the app to create an online game. Friends you invite can join without an account.", true); setTimeout(() => go("#chat"), 1400); };
    on("lm_on", () => { if (!online()) return needIn(); peopleSheet("add", uids => createOnline(uids.slice(0, 3)).catch(e => lToast(commErr(e), true))); });
    on("lm_party", async e => { if (!online()) return needIn(); const b = e.currentTarget; b.disabled = true; try { await createParty(); } catch (er) { lToast(commErr(er), true); } b.disabled = false; });
    on("lm_link", async e => { if (!online()) return needIn(); const b = e.currentTarget; b.disabled = true; try { await createOnline([]); } catch (er) { lToast(commErr(er), true); } b.disabled = false; });
    on("lg_give", () => peopleSheet("add", async uids => { const n = Math.max(1, Math.min(100, +root.querySelector("#lg_amt").value || 0)), m = root.querySelector("#lg_gm");
      try { for (const u of uids) await db().runTransaction(async t => { const r = walletRef(u), d = await t.get(r); if (d.exists) t.update(r, {tokens: (d.data().tokens || 0) + n}); else t.set(r, {tokens: 10 + n, claimed: [], ts: fv().serverTimestamp()}); }); m.textContent = `Gave ${n} tokens to ${uids.length} member${uids.length > 1 ? "s" : ""}.`; } catch (e) { m.textContent = commErr(e); } }));
    if (!online()) return;
    walletWatch();
    const list = root.querySelector("#lg_list"), me = meId();
    const un = db().collection("games").where("uids", "array-contains", me).onSnapshot(s => {
      const gs = []; s.forEach(d => gs.push({id: d.id, ...d.data()})); gs.sort((a, b) => tsMs(b.turnAt || b.created) - tsMs(a.turnAt || a.created));
      if (!list.isConnected) { un(); return; }
      list.innerHTML = gs.length ? gs.slice(0, 20).map(g => { const mine = g.status === "playing" && g.players[g.turn] && g.players[g.turn].uid === me, joined = (g.players || []).some(p => p.uid === me);
        const st = g.status === "lobby" ? (joined ? `<span class="lpill wait">Waiting</span>` : `<span class="lpill go">Join</span>`) : g.status === "playing" ? (mine ? `<span class="lpill go">Your turn</span>` : `<span class="lpill">Playing</span>`) : `<span class="lpill">${g.ranks && g.ranks[0] === me ? "🏆 Won" : "Finished"}</span>`;
        return `<a class="lgame" href="#ludo/${g.id}"><span style="font-size:24px">🎲</span><span class="lgt"><b>${H((g.players || []).map(p => p.name.split(" ")[0]).join(" · ") || "Game")}</b><br><small>${g.status === "lobby" ? "Lobby" : H(g.log || "")}</small></span>${st}</a>`; }).join("") : `<div class="cempty"><b>No online games yet</b><span>Tap “Play with connections”, or the 🎲 button in any chat.</span></div>`;
    }, e => list.innerHTML = `<div class="warn small">${H(commErr(e))}</div>`);
    CUR = {stop: un};
  }
  function rulesSheet() {
    const sh = document.createElement("div"); sh.className = "sheet";
    sh.innerHTML = `<div class="sheetin"><div class="pshead"><h3>How to play</h3><button class="iconbtn" id="lr_x" aria-label="Close">✕</button></div><ul class="lrules small">
      <li>Each player has 4 pieces. Roll a <b>6</b> to bring a piece onto your start square (house rule: 1 or 6).</li>
      <li>Move clockwise around the board, then up your coloured home lane to 🏠. You need the <b>exact</b> number to finish.</li>
      <li><b>Roll again</b> after a 6, after bringing a piece home, and after a capture. Three 6s in a row lose the turn.</li>
      <li>Land on an opponent to <b>capture</b> it: it goes back to base. Start squares and ★ squares are <b>safe</b>.</li>
      <li>First to bring all 4 pieces home wins; the others play on for 2nd and 3rd place.</li>
      <li><b>Turn timer</b> (online): if a player waits too long, the app plays for them.</li></ul>
      <h4>House rules (the host chooses)</h4><ul class="lrules small">${RULES.map(r => `<li><b>${r[1]}</b>: ${r[2]}</li>`).join("")}</ul>
      <h4>🪙 Tokens</h4><ul class="lrules small"><li>Everyone starts with <b>10 tokens</b>.</li><li>Finish an online game with at least two people: <b>+5</b> for the winner, <b>+1</b> for everyone else.</li><li>Spend <b>1 token</b> on a <b>power roll</b>: choose the dice number yourself (up to 2 per game, when the host allows it). You can borrow down to <b>−10</b> tokens; win or play games to climb back.</li><li>👑 <b>Token leader's edge</b>: in an online game, the person with the most tokens starts with one piece already out.</li><li>Guests (joined by link without an account) play free but don't collect tokens.</li><li>The administrator can give tokens.</li></ul>
      <h4>🎉 Ludo Party (10–20 players)</h4><ul class="lrules small"><li>Everyone opens the party link, picks a nickname and joins one of 4 colour teams (up to 8 each, 20 in all).</li><li>Teams take turns as in normal Ludo; inside a team, members take it in turn to roll, so everyone plays.</li><li>If the person whose roll it is doesn't respond, the host's phone rolls for them.</li><li>Voice notes work in parties; live voice is for 4-player games. Party games are for fun and don't add tokens.</li></ul>
      <button class="btn" id="lr_ok" style="width:100%">Got it</button></div>`;
    document.body.appendChild(sh); const x = () => sh.remove(); sh.querySelector("#lr_x").onclick = x; sh.querySelector("#lr_ok").onclick = x; sh.addEventListener("click", e => { if (e.target === sh) x(); });
  }
  function settingsHTML(set, edit, local) {
    if (local) return RULES.filter(r => r[0] !== "power").map(([k, t, d]) => `<div class="lset"><div><b>${t}</b><span>${d}</span></div><label class="sw"><input type="checkbox" data-rs="${k}"${set[k] ? " checked" : ""}><span></span></label></div>`).join("");
    return RULES.map(([k, t, d]) => `<div class="lset"><div><b>${t}</b><span>${d}</span></div>${edit ? `<label class="sw"><input type="checkbox" data-rs="${k}"${set[k] ? " checked" : ""}><span></span></label>` : `<b>${set[k] ? "On" : "Off"}</b>`}</div>`).join("")
      + `<div class="lset"><div><b>Turn timer</b><span>Seconds per turn before the app plays for the player</span></div>${edit ? `<select data-rs="timer">${[0, 20, 30, 45, 60].map(v => `<option value="${v}"${+set.timer === v ? " selected" : ""}>${v ? v + " s" : "Off"}</option>`).join("")}</select>` : `<b>${set.timer ? set.timer + " s" : "Off"}</b>`}</div>`;
  }
  const readSet = (root, set) => { $$("[data-rs]", root).forEach(e => set[e.dataset.rs] = e.type === "checkbox" ? e.checked : +e.value); return set; };

  /* ---------- local games (computer or pass-and-play) ---------- */
  function setupLocal(root, mode) {
    const saved = store.get("ludoLocal", null);
    root.innerHTML = `<div class="ltop"><a class="lback" href="#ludo" aria-label="Back to Ludo">‹ Back</a><h2>${mode === "cpu" ? "Play vs computer" : "Pass and play"}</h2></div>
      <div class="card"><div class="lset"><div><b>Players</b><span>${mode === "cpu" ? "You plus computer players" : "People sharing this device"}</span></div><select id="ll_n">${[2, 3, 4].map(n => `<option value="${n}"${n === 4 && mode === "cpu" ? " selected" : ""}>${n}</option>`).join("")}</select></div>
      ${mode === "cpu" ? `<div class="lset"><div><b>Computer level</b><span>Clever players capture and play safe</span></div><select id="ll_lv"><option value="easy">Easy</option><option value="hard" selected>Clever</option></select></div>` : `<div id="ll_names"></div>`}
      ${settingsHTML(Object.assign({}, DEF_SET, {power: false, timer: 0}), true, true)}
      <div class="btnrow"><button class="btn" id="ll_go">Start game</button>${saved && saved.mode === mode && saved.S.status === "playing" ? `<button class="btn btn-ghost" id="ll_res">Resume last game</button>` : ""}</div></div>`;
    const nSel = root.querySelector("#ll_n"), namesEl = root.querySelector("#ll_names");
    const drawNames = () => { if (!namesEl) return; const n = +nSel.value; namesEl.innerHTML = SEAT[n].map((c, k) => `<div class="lset"><div><b style="color:${COLORS[c][1]}">${COLORS[c][0]}</b></div><input data-nm="${k}" value="${H(store.get("ludoNm" + k, "Player " + (k + 1)))}" maxlength="20" style="max-width:160px"></div>`).join(""); };
    nSel.onchange = drawNames; drawNames();
    root.querySelector("#ll_go").onclick = () => {
      const n = +nSel.value, set = readSet(root, Object.assign({}, DEF_SET, {power: false, timer: 0})), lv = (root.querySelector("#ll_lv") || {}).value || "hard";
      const myName = online() ? (COMM.profile.name || "You").split(" ").slice(0, 2).join(" ") : "You";
      const botNames = ["Dorji Bot", "Pema Bot", "Tashi Bot"];
      const players = SEAT[n].map((c, k) => mode === "cpu" ? (k === 0 ? {uid: "me", name: myName, c} : {uid: "bot" + k, name: botNames[k - 1], c, bot: true, lv}) : {uid: "p" + k, name: (root.querySelector(`[data-nm="${k}"]`).value.trim() || "Player " + (k + 1)).slice(0, 20), c});
      if (mode === "pass") players.forEach((p, k) => store.set("ludoNm" + k, p.name));
      runLocal(root, mode, newState(players, set));
    };
    const rs = root.querySelector("#ll_res"); if (rs) rs.onclick = () => runLocal(root, mode, saved.S);
  }
  function runLocal(root, mode, S) {
    const ctl = game(root, {
      me: p => mode === "pass" ? !p.bot : p.uid === "me",
      act: async fn => { const n = fn(clone(S)); if (n) { S = n; S.ver = (S.ver || 0) + 1; store.set("ludoLocal", {mode, S}); ctl.show(S); } },
      title: mode === "cpu" ? "vs computer" : "Pass and play", local: true, mode,
      again: () => setupLocal(root, mode)
    });
    CUR = ctl; ctl.show(S);
  }

  /* ---------- online games ---------- */
  async function createOnline(uids, chatId) {
    const me = meId(), p = COMM.profile || {}, set = Object.assign({}, DEF_SET);
    const ref = await db().collection("games").add({host: me, uids: [...new Set([me, ...uids])].slice(0, 4), players: [Object.assign({uid: me, name: myName(), c: 0}, tkOf())], status: "lobby", link: true, set, pc: {}, turn: 0, dice: 0, rolled: false, sixes: 0, ranks: [], log: "", pw: {}, ver: 0, chat: chatId || "", created: fv().serverTimestamp(), turnAt: fv().serverTimestamp()});
    go("#ludo/" + ref.id); return ref.id;
  }
  /* start from a chat: invites the chat's members and posts a join card in the chat */
  async function fromChat(chatId, room, post) {
    if (!online()) return;
    const me = meId(), mem = ((room && room.members) || []).filter(u => u !== me);
    const pickAndGo = async uids => { const id = await createOnlineNoGo(uids, chatId); try { await post(`🎲 Ludo — I started a game. Tap to join!\napp:#ludo/${id}`); } catch (e) {} go("#ludo/" + id); };
    if (mem.length <= 3) return pickAndGo(mem);
    peopleSheet("add", uids => pickAndGo(uids.filter(u => mem.includes(u)).slice(0, 3)));
  }
  /* Ludo Party: 4 colour teams, up to 8 people each and 20 in all; team members take turns to roll */
  const PARTY_MAX = 20, TEAM_MAX = 8;
  async function createParty() {
    const me = meId(), set = Object.assign({}, DEF_SET, {power: false, timer: 20, block: false, capBonus: true});
    const players = COLORS.map((col, k) => ({uid: "team" + k, name: col[0] + " team", c: k, next: 0, members: k === 0 ? [{uid: me, name: myName()}] : []}));
    const ref = await db().collection("games").add({host: me, uids: [me], mode: "party", link: true, players, status: "lobby", set, pc: {}, turn: 0, dice: 0, rolled: false, sixes: 0, ranks: [], log: "", pw: {}, ver: 0, chat: "", created: fv().serverTimestamp(), turnAt: fv().serverTimestamp()});
    go("#ludo/" + ref.id); return ref.id;
  }
  const roller = t => t && t.members && t.members.length ? t.members[(t.next || 0) % t.members.length] : null;
  async function createOnlineNoGo(uids, chatId) { const me = meId(), p = COMM.profile || {};
    const ref = await db().collection("games").add({host: me, uids: [...new Set([me, ...uids])].slice(0, 4), players: [Object.assign({uid: me, name: myName(), c: 0}, tkOf())], status: "lobby", link: true, set: Object.assign({}, DEF_SET), pc: {}, turn: 0, dice: 0, rolled: false, sixes: 0, ranks: [], log: "", pw: {}, ver: 0, chat: chatId || "", created: fv().serverTimestamp(), turnAt: fv().serverTimestamp()});
    return ref.id; }
  function playOnline(root, gid) {
    const ref = db().collection("games").doc(gid), me = meId(); let S = null, ctl = null, voice = null, claimed = false;
    /* voice notes: record up to 15 s, the others hear it automatically (each player can switch auto-play off) */
    const VN = {rec: null, chunks: [], t0: 0, seen: new Set(), since: Date.now(), last: {}};
    const vnPlay = data => { try { const a = new Audio(data); a.play().catch(() => lToast("Tap ▶ on the player to hear the voice note.")); } catch (e) {} };
    const vnUn = ref.collection("vm").orderBy("t", "desc").limit(8).onSnapshot(s => s.docChanges().forEach(ch => { if (ch.type !== "added") return; const d = ch.doc.data(), id = ch.doc.id; if (VN.seen.has(id)) return; VN.seen.add(id);
      const t = d.t && d.t.toMillis ? d.t.toMillis() : Date.now(); VN.last[d.u] = d.d; if (ctl) ctl.note(d.u, () => vnPlay(d.d));
      if (d.u !== me && t > VN.since - 2000 && store.get("ludoAutoVN", true) !== false) { vnPlay(d.d); buzz(20); } }), () => {});
    const vnRec = async () => {
      if (VN.rec) { VN.rec.stop(); return; }
      if (!window.MediaRecorder) throw new Error("Voice notes are not supported on this browser.");
      const st = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}});
      const mt = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || "";
      const r = new MediaRecorder(st, mt ? {mimeType: mt, audioBitsPerSecond: 24000} : {}); VN.rec = r; VN.chunks = []; VN.t0 = Date.now();
      r.ondataavailable = e => { if (e.data.size) VN.chunks.push(e.data); };
      r.onstop = () => { st.getTracks().forEach(t => t.stop()); clearTimeout(VN.cap); const blob = new Blob(VN.chunks, {type: r.mimeType || mt || "audio/webm"}); VN.rec = null; if (ctl) ctl.show(S);
        if (Date.now() - VN.t0 < 500) return; const fr = new FileReader(); fr.onload = () => { const data = String(fr.result); if (data.length > 650000) { lToast("Voice note too long.", true); return; } ref.collection("vm").add({u: me, d: data, t: fv().serverTimestamp()}).catch(e => lToast(commErr(e), true)); }; fr.readAsDataURL(blob); };
      r.start(); VN.cap = setTimeout(() => { if (VN.rec) VN.rec.stop(); }, 15000); if (ctl) ctl.show(S);
    };
    root.innerHTML = `<div class="muted small" style="padding:20px">Opening the game…</div>`;
    walletWatch(() => ctl && ctl.show(S));
    const act = fn => db().runTransaction(async t => { const d = await t.get(ref); if (!d.exists) throw new Error("This game was deleted."); const cur = d.data(); const n = fn(clone(cur)); if (!n) return;
      /* party: when a team's turn ends, the next team member will roll for it next time */
      if (n.mode === "party" && cur.status === "playing" && n.turn !== cur.turn && n.players[cur.turn] && (n.players[cur.turn].members || []).length) { const t = n.players[cur.turn]; t.next = ((t.next || 0) + 1) % t.members.length; }
      const turnChanged = n.turn !== cur.turn || n.status !== cur.status; n.ver = (cur.ver || 0) + 1; const upd = {}; ["players", "uids", "link", "status", "set", "pc", "turn", "dice", "rolled", "sixes", "ranks", "log", "pw", "ver", "mv", "edge"].forEach(k => { if (n[k] !== undefined) upd[k] = n[k]; }); if (turnChanged || n.rolled !== cur.rolled) upd.turnAt = fv().serverTimestamp(); t.update(ref, upd); }).catch(e => lToast(commErr(e), true));
    const lobby = () => {
      const joined = S.players.some(p => p.uid === me), host = S.host === me;
      root.innerHTML = `<div class="ltop"><a class="lback" href="#ludo" aria-label="Back to Ludo">‹ Back</a><h2>Ludo lobby</h2><button class="lbtn" id="lo_rules">Rules</button></div>
        ${joined && S.link ? `<div class="lshare"><b>🔗 Invite friends with this link</b><div class="small muted" style="margin-top:2px">Send it anywhere. Each person plays on their own phone — no account needed. Up to 4 players.</div><div class="lurl"><input readonly value="${H(linkOf(gid))}" id="lo_url" aria-label="Invite link"><button class="btn" id="lo_link">Share</button><button class="btn btn-ghost" id="lo_copy">Copy</button></div></div>` : ""}
        <div class="card"><b>Players (${S.players.length}/4)</b><div class="lseats" style="margin-top:8px">${S.players.map(p => `<div class="lseat" style="--pc:${COLORS[p.c][1]}"><span class="ldot">${p.bot ? "🤖" : H(p.name[0] || "?")}</span><span class="lsn"><b>${H(p.name)}</b><small>${COLORS[p.c][0]}${p.uid === S.host ? " · host" : ""}${p.guest ? " · guest" : ""}</small></span>${host && p.uid !== me ? `<button class="iconbtn" data-kick="${H(p.uid)}" aria-label="Remove">✕</button>` : ""}</div>`).join("")}</div>
        <p class="small muted">${S.uids.length - 1} invited${S.link ? " · invite link is on" : ""}. ${joined ? "Waiting for the host to start." : "Tap Join to take a seat."}</p>
        ${joined ? "" : `<div style="margin-top:10px">${nickField("lo_nick", store.get("ludoNick", "") || (GUEST && GUEST.name) || (COMM.profile && COMM.profile.name) || randNick())}</div>`}
        <div class="btnrow">${joined ? "" : `<button class="btn" id="lo_join">Join game</button>`}${host ? `<button class="btn" id="lo_start"${S.players.length < 2 ? " disabled" : ""}>Start game</button><button class="btn btn-ghost" id="lo_bot"${S.players.length >= 4 ? " disabled" : ""}>＋ Computer player</button>` : ""}${joined && !host ? `<button class="btn btn-ghost" id="lo_leave">Leave</button>` : ""}${host ? `<button class="btn btn-ghost" id="lo_del">Cancel game</button>` : ""}</div></div>
        <div class="card"><b>House rules</b>${settingsHTML(S.set, host)}</div>`;
      const on = (id, f) => { const e = root.querySelector("#" + id); if (e) e.onclick = f; };
      on("lo_rules", rulesSheet);
      on("lo_join", () => { const ni = root.querySelector("#lo_nick"), nv = ni ? ni.value.trim().replace(/\s+/g, " ").slice(0, 24) : ""; if (ni && nv.length < 2) { lToast("Choose a nickname (at least 2 letters).", true); ni.focus(); return; } if (nv) { if (GUEST) { GUEST.name = nv; store.set("ludoGuest", GUEST); } else store.set("ludoNick", nv); } return act(G => { if (G.status !== "lobby" || G.players.some(p => p.uid === me) || G.players.length >= 4) return null; if (!G.uids.includes(me) && !GUEST) { if (!G.link || G.uids.length >= 4) throw new Error("This game is full."); G.uids.push(me); } const used = G.players.map(p => p.c), c = JOIN_ORDER.find(x => !used.includes(x)); G.players.push(Object.assign({uid: me, name: myName(), c}, GUEST ? {guest: true} : tkOf())); return G; }); });
      on("lo_link", () => shareLink(gid));
      on("lo_copy", async () => { const i = root.querySelector("#lo_url"); try { await navigator.clipboard.writeText(linkOf(gid)); lToast("Invite link copied."); } catch (e) { i.focus(); i.select(); document.execCommand && document.execCommand("copy"); lToast("Invite link copied."); } });
      on("lo_leave", () => act(G => { G.players = G.players.filter(p => p.uid !== me); return G; }).then(() => go("#ludo")));
      on("lo_bot", () => act(G => { if (G.players.length >= 4) return null; const used = G.players.map(p => p.c), c = JOIN_ORDER.find(x => !used.includes(x)); G.players.push({uid: "bot" + c, name: ["Dorji Bot", "Pema Bot", "Tashi Bot", "Karma Bot"][c], c, bot: true, lv: "hard"}); return G; }));
      $$("[data-kick]", root).forEach(b => b.onclick = () => act(G => { G.players = G.players.filter(p => p.uid !== b.dataset.kick); return G; }));
      $$("[data-rs]", root).forEach(e => e.onchange = () => act(G => { G.set = readSet(root, Object.assign({}, G.set)); return G; }));
      on("lo_del", async () => { try { await ref.delete(); go("#ludo"); } catch (e) { lToast(commErr(e), true); } });
      on("lo_start", () => act(G => { if (G.players.length < 2) return null; G.players.sort((a, b) => a.c - b.c);
        /* 2 players sit opposite each other */
        if (G.players.length === 2) { G.players[0].c = 0; G.players[1].c = 2; }
        const N = newState(G.players, G.set);
        /* token leader's edge: the human with the most tokens (a clear leader) starts with one piece already out */
        const tks = G.players.filter(p => !p.bot && typeof p.tk === "number").sort((a, b) => b.tk - a.tk), lead = tks.length >= 2 && tks[0].tk > tks[1].tk ? tks[0] : null;
        if (lead) { if (N.pc[lead.c][0] === -1) N.pc[lead.c][0] = 0; else if (N.pc[lead.c][1] === -1) N.pc[lead.c][1] = 0; }
        Object.assign(G, {pc: N.pc, turn: 0, status: "playing", dice: 0, rolled: false, sixes: 0, ranks: [], edge: lead ? lead.uid : "", log: "Game started — " + G.players[0].name + " goes first" + (lead ? ` · 👑 ${lead.name} (most tokens) starts with a piece out` : ""), pw: {}}); return G; }));
    };
    const partyLobby = () => {
      const host = S.host === me, myT = S.players.findIndex(t => (t.members || []).some(m => m.uid === me)), total = S.players.reduce((a, t) => a + (t.members || []).length, 0);
      root.innerHTML = `<div class="ltop"><a class="lback" href="#ludo" aria-label="Back to Ludo">‹ Back</a><h2>🎉 Ludo Party</h2><button class="lbtn" id="lo_rules">Rules</button></div>
        <div class="lshare"><b>🔗 Invite everyone with this link</b><div class="small muted" style="margin-top:2px">Share it in your ward or class group. ${total}/${PARTY_MAX} players · no account needed.</div><div class="lurl"><input readonly value="${H(linkOf(gid))}" id="lo_url" aria-label="Invite link"><button class="btn" id="lo_link">Share</button><button class="btn btn-ghost" id="lo_copy">Copy</button></div></div>
        ${myT < 0 ? `<div class="card">${nickField("lo_nick", store.get("ludoNick", "") || (GUEST && GUEST.name) || (COMM.profile && COMM.profile.name) || randNick())}<p class="small muted" style="margin:8px 0 0">Then pick a team below.</p></div>` : ""}
        <div class="lteams">${S.players.map((t, k) => { const ms = t.members || [], full = ms.length >= TEAM_MAX || (myT < 0 && total >= PARTY_MAX);
          return `<div class="lteam" style="--pc:${COLORS[t.c][1]}"><div class="lteamh"><span class="ldot"></span><b>${H(t.name)}</b><small>${ms.length}/${TEAM_MAX}</small></div><div class="ltm">${ms.map(m => `<span>${H(m.name)}${m.uid === S.host ? " ⭐" : ""}${m.guest ? " ·g" : ""}</span>`).join("") || `<i class="muted small">No one yet</i>`}</div><button class="btn btn-sm${myT === k ? " btn-ghost" : ""}" data-team="${k}"${myT === k || full ? " disabled" : ""}>${myT === k ? "✓ Your team" : myT >= 0 ? "Switch here" : "Join " + COLORS[t.c][0]}</button></div>`; }).join("")}</div>
        ${host ? `<div class="btnrow"><button class="btn" id="lo_start"${S.players.filter(t => (t.members || []).length).length < 2 ? " disabled" : ""}>Start the party</button><button class="btn btn-ghost" id="lo_del">Cancel</button></div><p class="small muted">Needs at least 2 teams with players. Empty teams are left out.</p>` : `<p class="small muted" style="text-align:center">Waiting for the host to start…</p>`}
        ${myT >= 0 && !host ? `<div class="btnrow"><button class="btn btn-ghost" id="lo_leave">Leave the party</button></div>` : ""}
        <div class="card"><b>House rules</b>${settingsHTML(S.set, host)}</div>`;
      const on = (id, f) => { const e = root.querySelector("#" + id); if (e) e.onclick = f; };
      on("lo_rules", rulesSheet); on("lo_link", () => shareLink(gid));
      on("lo_copy", async () => { try { await navigator.clipboard.writeText(linkOf(gid)); lToast("Invite link copied."); } catch (e) { const i = root.querySelector("#lo_url"); i.select(); lToast("Long-press the link to copy it."); } });
      $$("[data-team]", root).forEach(b => b.onclick = () => { const ni = root.querySelector("#lo_nick"), nv = ni ? ni.value.trim().replace(/\s+/g, " ").slice(0, 24) : ""; if (ni && nv.length < 2) { lToast("Choose a nickname (at least 2 letters).", true); ni.focus(); return; }
        if (nv) { if (GUEST) { GUEST.name = nv; store.set("ludoGuest", GUEST); } else store.set("ludoNick", nv); }
        const k = +b.dataset.team; act(G => { if (G.status !== "lobby") return null; let mine = null; G.players.forEach(t => { t.members = (t.members || []).filter(m => { if (m.uid === me) { mine = m; return false; } return true; }); });
          const tot = G.players.reduce((a, t) => a + t.members.length, 0); if (!mine && tot >= PARTY_MAX) throw new Error("The party is full (20 players)."); if (G.players[k].members.length >= TEAM_MAX) throw new Error("That team is full.");
          G.players[k].members.push(Object.assign({uid: me, name: mine ? mine.name : myName()}, GUEST ? {guest: true} : {})); return G; }); });
      on("lo_leave", () => act(G => { G.players.forEach(t => t.members = (t.members || []).filter(m => m.uid !== me)); return G; }).then(() => go("#ludo")));
      on("lo_del", async () => { try { await ref.delete(); go("#ludo"); } catch (e) { lToast(commErr(e), true); } });
      $$("[data-rs]", root).forEach(e => e.onchange = () => act(G => { G.set = readSet(root, Object.assign({}, G.set)); return G; }));
      on("lo_start", () => act(G => { G.players = G.players.filter(t => (t.members || []).length); if (G.players.length < 2) return null; G.players.forEach(t => t.next = 0);
        const N = newState(G.players, G.set); Object.assign(G, {pc: N.pc, turn: 0, status: "playing", dice: 0, rolled: false, sixes: 0, ranks: [], log: `Party started — ${roller(G.players[0]).name} rolls first for ${G.players[0].name}`, pw: {}}); return G; }));
    };
    const party = () => S && S.mode === "party";
    const un = ref.onSnapshot(d => {
      if (!d.exists) { root.innerHTML = `<div class="card">This game no longer exists. <a href="#ludo">Back to Ludo</a></div>`; return; }
      S = d.data(); S.id = gid;
      if (S.status === "lobby") { if (ctl) { ctl.stop(); ctl = null; } if (party()) partyLobby(); else lobby(); return; }
      if (!ctl) {
        ctl = game(root, {me: p => party() ? !!(roller(p) && roller(p).uid === me) : p.uid === me, mine: p => party() ? (p.members || []).some(m => m.uid === me) : p.uid === me, party: party(), roller, act, title: party() ? "Party" : "Online", gid, host: S.host === me, hostId: S.host, online: true,
          voice: party() ? null : () => { if (voice) { voice.stop(); voice = null; } else { voice = Voice(ref, me, S.players.filter(p => !p.bot && p.uid !== me).map(p => p.uid), (uid, on) => ctl && ctl.talk(uid, on)); voice.start().catch(e => { lToast(e.message || "Microphone not available.", true); voice = null; ctl.show(S); }); } ctl.show(S); },
          voiceOn: () => !!voice, mute: () => voice && voice.mute(), muted: () => voice && voice.muted,
          vnRec: () => vnRec().catch(e => lToast(e.message || "Microphone not available.", true)), vnRecording: () => !!VN.rec,
          emo: e => ref.update({emo: {u: me, e, k: Date.now()}}).catch(() => {}),
          again: async () => { const id = await createOnlineNoGo(S.uids.filter(u => u !== me), S.chat); go("#ludo/" + id); },
          leave: () => act(G => { const p = G.players.find(x => x.uid === me); if (!p || G.status !== "playing") return null; p.left = true; if (G.players[G.turn].uid === me) { G.rolled = false; G.turn = nextTurn(G, G.turn); } G.log = p.name + " left the game"; checkEnd(G); return G; }).then(() => go("#ludo"))});
      }
      ctl.show(S); Object.keys(VN.last).forEach(u => ctl.note(u, () => vnPlay(VN.last[u])));
      if (S.status === "done" && !claimed) { claimed = true; claimReward(gid, S).then(n => { if (n) { lToast(`🪙 +${n} token${n > 1 ? "s" : ""} added to your wallet.`); } }).catch(() => {}); }
    }, e => { root.innerHTML = `<div class="warn">${H(commErr(e))}</div><p><a href="#ludo">Back to Ludo</a></p>`; });
    CUR = {stop: () => { un(); vnUn(); if (VN.rec) VN.rec.stop(); if (ctl) ctl.stop(); if (voice) voice.stop(); voice = null; }};
  }

  /* ---------- the game screen (shared by local and online) ---------- */
  function game(root, o) {
    root.innerHTML = `<div class="lplay"><div class="ltop"><a class="lback" href="#ludo" aria-label="Back to Ludo">‹ Back</a><h2>Ludo <small class="muted" style="font-size:12px;font-weight:600">${H(o.title)}</small></h2>
      ${o.voice ? `<button class="lbtn" id="lx_voice">🎙️ Voice</button><button class="lbtn" id="lx_mute" hidden>🔇 Mute</button>` : ""}${document.documentElement.requestFullscreen ? `<button class="lbtn" id="lx_fs" aria-label="Full screen" title="Full screen">⛶</button>` : ""}<button class="lbtn" id="lx_snd" aria-label="Sound">${store.get("ludoSnd", true) === false ? "🔈" : "🔊"}</button><button class="lbtn" id="lx_more" aria-label="More">⋯</button></div>
      <div class="lseats" id="lx_seats"></div>
      <div class="ltimer" id="lx_tm" hidden><i></i></div>
      <div class="lbwrap" id="lx_bw">${boardSVG()}</div>
      <div class="lmsg" id="lx_msg"></div>
      <div class="lbar"><button class="ldice" id="lx_dice" aria-label="Roll the dice">${diceFace(6)}</button><div class="ltools">${o.online ? `<button class="lbtn lvn" id="lx_vn">🎤 Voice note</button><button class="lbtn" id="lx_vna"></button>` : ""}<button class="lbtn" id="lx_pow" hidden>🎯 Power roll · <span class="lwalN">${WAL.n ?? 0}</span>🪙</button></div></div>
      <div class="lpick" id="lx_pick" hidden></div>
      ${o.online ? `<div class="lemos">${["👏", "😂", "😮", "😡", "🔥", "😭", "🙏", "💪"].map(e => `<button data-emo="${e}">${e}</button>`).join("")}</div>` : ""}
      <div id="lx_end"></div></div>`;
    const svg = root.querySelector(".lboard"), pcs = svg.querySelector(".lpcs"), msgEl = root.querySelector("#lx_msg"), diceB = root.querySelector("#lx_dice");
    let S = null, shown = {}, animating = false, pendingShow = null, stopped = false, botT = null, autoT = null, tick = null, lastMvKey = 0, lastEmo = 0, talking = {}, lastTurnKey = "", notes = {}, api = null;
    /* pieces */
    const pieceEls = {};
    const drawPieces = () => {
      pcs.innerHTML = ""; Object.keys(pieceEls).forEach(k => delete pieceEls[k]);
      S.players.forEach(p => (S.pc[p.c] || []).forEach((st, i) => { const k = p.c + "_" + i; const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "lp"); g.dataset.c = p.c; g.dataset.i = i;
        g.innerHTML = `<circle class="ring" r="0.5" fill="none" stroke="#fff" stroke-width="0.09" opacity="0"/><circle class="b" r="0.36" fill="${COLORS[p.c][1]}" stroke="#fff" stroke-width="0.09"/><circle r="0.14" fill="rgba(255,255,255,.55)" cx="-0.08" cy="-0.1"/>`;
        pcs.appendChild(g); pieceEls[k] = g; if (!(k in shown)) shown[k] = st; }));
    };
    const place = () => {
      /* stack pieces that share a square */
      const at = {}; Object.keys(pieceEls).forEach(k => { const [c, i] = k.split("_").map(Number), st = shown[k]; const [x, y] = piecePos(c, st, i); const key = st === -1 || st === 56 ? k : x.toFixed(2) + "," + y.toFixed(2); (at[key] = at[key] || []).push(k); });
      Object.values(at).forEach(ks => ks.forEach((k, n) => { const [c, i] = k.split("_").map(Number); let [x, y] = piecePos(c, shown[k], i); const sc = ks.length > 1 ? 0.72 : 1; if (ks.length > 1) { x += (n % 2 ? 0.2 : -0.2); y += (n > 1 ? 0.2 : -0.2) * (ks.length > 2 ? 1 : 0); } pieceEls[k].style.transform = `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px) scale(${sc})`; }));
    };
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    async function animate(mv) {
      animating = true; const k = mv.c + "_" + mv.i, from = shown[k];
      if (from === -1 || from == null) { shown[k] = 0; place(); snd("hop"); await sleep(170); }
      const target = mv.j ? mv.to - 13 : mv.to;
      for (let s = Math.max(0, from === -1 ? 0 : from) + 1; s <= target; s++) { shown[k] = s; place(); snd("hop"); await sleep(130); }
      if (mv.j) { await sleep(120); shown[k] = mv.to; place(); snd("home"); await sleep(260); }
      shown[k] = mv.to; place();
      if (mv.caps && mv.caps.length) { await sleep(120); snd("cap"); buzz([40, 40, 80]); mv.caps.forEach(x => shown[x.c + "_" + x.i] = -1); place(); await sleep(300); }
      if (mv.to === 56) { snd("home"); buzz(60); }
      animating = false;
    }
    const seats = () => {
      const now = S.status === "playing" ? S.players[S.turn] : null;
      root.querySelector("#lx_seats").innerHTML = S.players.map(p => { const home = (S.pc[p.c] || []).filter(x => x === 56).length, rk = S.ranks.indexOf(p.uid);
        return `<div class="lseat${now && now.uid === p.uid ? " now" : ""}${talking[p.uid] ? " talk" : ""}" data-seat="${H(p.uid)}" style="--pc:${COLORS[p.c][1]};--o:${[0, 1, 3, 2][p.c]}"><span class="ldot">${p.bot ? "🤖" : H((p.name || "?")[0])}</span><span class="lsn"><b>${S.edge === p.uid ? "👑 " : ""}${H(p.name)}${o.me(p) && !o.local ? " (you)" : ""}</b><small>${p.left ? "left" : `🏠 ${home}/4`}${p.members ? ` · ${p.members.map((m, j) => { const fn = H(String(m.name).replace(/^dr\.?\s+/i, "").split(" ")[0]); return j === (p.next || 0) % p.members.length ? `<b class="lnext">🎲 ${fn}</b>` : fn; }).join(", ")}` : ""}${typeof p.tk === "number" ? ` · 🪙${p.tk}` : ""}${p.guest ? " · guest" : ""}${S.pw && S.pw[p.uid] ? ` · 🎯${S.pw[p.uid]}` : ""}</small></span>${rk >= 0 ? `<span class="lrank">${["🥇", "🥈", "🥉", "4️⃣"][rk]}</span>` : ""}</div>`; }).join("");
      if (api) Object.keys(notes).forEach(u => api.note(u, notes[u]));
    };
    const myTurn = () => S.status === "playing" && S.players[S.turn] && o.me(S.players[S.turn]) && !S.players[S.turn].bot;
    const controlsBot = () => S.status === "playing" && S.players[S.turn] && S.players[S.turn].bot && (o.local || o.host);
    function render() {
      if (stopped) return;
      seats();
      const cur = S.status === "playing" ? S.players[S.turn] : null, mine = myTurn();
      root.style.setProperty("--pc", cur ? COLORS[cur.c][1] : "#2e9d4f");
      diceB.innerHTML = diceFace(S.dice || 6); diceB.classList.toggle("mine", !!mine && !S.rolled); diceB.disabled = !mine || S.rolled || animating;
      const moves = mine && S.rolled ? legal(S, cur.c, S.dice) : [];
      Object.values(pieceEls).forEach(g => { const c = +g.dataset.c, i = +g.dataset.i, can = moves.some(m => m.i === i && cur && cur.c === c) || (moves.length && cur && cur.c === c && moves.some(m => m.from === S.pc[c][i])); g.classList.toggle("can", can); g.querySelector(".ring").setAttribute("opacity", can ? "1" : "0"); });
      msgEl.innerHTML = S.status === "done" ? "" : mine ? (S.rolled ? `<span style="color:${COLORS[cur.c][1]}">Tap a glowing piece</span>` : `<span style="color:${COLORS[cur.c][1]}">${o.local && o.mode === "pass" ? H(cur.name) + ", your" : "Your"} turn${o.party ? " — rolling for " + H(cur.name) : ""} — tap the dice</span>`) + (S.log ? `<div class="small muted">${H(S.log)}</div>` : "") : cur ? `${o.party && o.roller(cur) ? H(o.roller(cur).name) + " is rolling for " + H(cur.name) : H(cur.name) + "'s turn"}${S.log ? `<div class="small muted">${H(S.log)}</div>` : ""}` : "";
      const pw = root.querySelector("#lx_pow"); if (pw) pw.hidden = !(mine && !S.rolled && S.set.power && !o.local && (S.pw[cur.uid] || 0) < 2 && WAL.n != null && WAL.n > MIN_TOK && !GUEST);
      const vn = root.querySelector("#lx_vn"), vna = root.querySelector("#lx_vna");
      if (vn) { const r = o.vnRecording(); vn.classList.toggle("rec", r); vn.textContent = r ? "⏹ Tap to send" : "🎤 Voice note"; }
      if (vna) { const on = store.get("ludoAutoVN", true) !== false; vna.textContent = on ? "📢 Auto-play on" : "🔕 Auto-play off"; vna.classList.toggle("on", on); }
      const vb = root.querySelector("#lx_voice"), mb = root.querySelector("#lx_mute"); if (vb) { const vo = o.voiceOn(); vb.classList.toggle("on", vo); vb.textContent = vo ? "🎙️ In voice · Leave" : "🎙️ Join voice"; mb.hidden = !vo; mb.textContent = o.muted() ? "🔇 Unmute" : "🎤 Mute"; mb.classList.toggle("red", !!o.muted()); }
      if (S.emo && S.emo.k > lastEmo) { lastEmo = S.emo.k; if (Date.now() - S.emo.k < 8000) { const st = root.querySelector(`[data-seat="${CSS.escape(S.emo.u)}"]`); if (st) { const e = document.createElement("span"); e.className = "lemo"; e.textContent = S.emo.e; st.appendChild(e); setTimeout(() => e.remove(), 2300); } } }
      const tk = S.turn + ":" + S.ver; if (mine && lastTurnKey !== tk && !S.rolled) { snd("turn"); if (!o.local) buzz(30); } lastTurnKey = tk;
      endPanel(); timers();
    }
    function endPanel() {
      const el = root.querySelector("#lx_end"); if (S.status !== "done") { el.innerHTML = ""; return; }
      if (el.dataset.done) return; el.dataset.done = 1;
      const win = S.players.find(p => p.uid === S.ranks[0]) || {}, iWon = (o.mine ? o.mine(win) : o.me(win)) && !win.bot;
      el.innerHTML = `<div class="lwin"><div style="font-size:46px">🏆</div><h2>${H(win.name || "")} wins!</h2><p class="small">${S.ranks.map((u, k) => `${["🥇", "🥈", "🥉", "4️⃣"][k]} ${H((S.players.find(p => p.uid === u) || {}).name || "")}`).join(" &nbsp; ")}</p>${o.online ? `<p class="small muted">Tokens: +5 for the winner, +1 for everyone else (games with 2 or more people).</p>` : ""}<div class="btnrow" style="justify-content:center"><button class="btn" id="lx_again">Play again</button><a class="btn btn-ghost" href="#ludo">Ludo home</a></div></div>`;
      el.querySelector("#lx_again").onclick = () => o.again && o.again();
      snd("win"); if (o.local) store.set("ludoLocal", null);
      const youWon = iWon || (o.local && o.mode === "pass");
      celebrate(win.name || "", COLORS[win.c != null ? win.c : 0][1], youWon && o.mode !== "pass", o.online ? (iWon ? "🪙 +5 tokens for winning" : "🪙 +1 token for playing") : o.mode === "pass" ? `🏆 ${H(win.name || "")} — champion of this device!` : win.bot ? "The computer won this time. Try again — you can beat it!" : "");
    }
    function timers() {
      clearTimeout(botT); clearTimeout(autoT); clearInterval(tick);
      const tm = root.querySelector("#lx_tm"); if (S.status !== "playing") { tm.hidden = true; return; }
      if (controlsBot() && !animating) { const p = S.players[S.turn]; botT = setTimeout(() => { if (stopped) return; if (!S.rolled) roll(); else { const mv = legal(S, p.c, S.dice); if (mv.length) move(botPick(S, p.c, mv, p.lv)); } }, S.rolled ? 650 : 850); return; }
      /* auto-move when there is only one choice */
      if (myTurn() && S.rolled && !animating) { const mv = legal(S, S.players[S.turn].c, S.dice); if (mv.length === 1) autoT = setTimeout(() => move(mv[0]), 650); }
      /* online turn timer */
      const lim = +S.set.timer || 0; if (!o.online || !lim) { tm.hidden = true; return; }
      tm.hidden = false; const bar = tm.querySelector("i"), start = S.turnAt && S.turnAt.toMillis ? S.turnAt.toMillis() : Date.now();
      const upd = () => { const left = Math.max(0, lim - (Date.now() - start) / 1000); bar.style.width = (left / lim * 100) + "%";
        const cur = S.players[S.turn]; if (!cur) return;
        const late = (Date.now() - start) / 1000;
        /* the player's own app plays for them at 0; if their app is closed, another player's app takes over after 10 more seconds */
        /* party: the host's app stands in for an absent team member */
        const helper = o.party ? null : S.players.find(p => !p.bot && !p.left && p.uid !== cur.uid), hostHelps = o.party && o.host && !o.me(cur);
        if ((o.me(cur) && late > lim) || (helper && o.me(helper) && late > lim + 10) || (hostHelps && late > lim + 6)) { clearInterval(tick); autoPlay(); } };
      upd(); tick = setInterval(upd, 1000);
    }
    function autoPlay() { o.act(G => { if (G.status !== "playing") return null; const p = G.players[G.turn]; if (!G.rolled) { doRoll(G, 1 + Math.floor(Math.random() * 6)); if (G.rolled) { const mv = legal(G, p.c, G.dice); doMove(G, botPick(G, p.c, mv, "hard")); } G.log += " (auto)"; return G; } const mv = legal(G, p.c, G.dice); if (!mv.length) return null; doMove(G, botPick(G, p.c, mv, "hard")); G.log += " (auto)"; return G; }); }
    function roll(chosen) {
      if (!S || S.status !== "playing" || S.rolled) return;
      diceB.classList.remove("spin"); void diceB.offsetWidth; diceB.classList.add("spin"); snd("roll"); buzz(15);
      let f = 0; const anim = setInterval(() => diceB.innerHTML = diceFace(1 + (f++ % 6)), 70);
      setTimeout(() => { clearInterval(anim); const d = chosen || 1 + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 * 6);
        o.act(G => { if (G.status !== "playing" || G.rolled || G.turn !== S.turn) return null; if (chosen) { G.pw = G.pw || {}; G.pw[G.players[G.turn].uid] = (G.pw[G.players[G.turn].uid] || 0) + 1; } return doRoll(G, d); }); }, 480);
    }
    function move(mv) { clearTimeout(autoT); o.act(G => { if (G.status !== "playing" || !G.rolled) return null; const p = G.players[G.turn]; const ok = legal(G, p.c, G.dice).find(m => m.i === mv.i || (m.from === mv.from && m.to === mv.to)); if (!ok) return null; return doMove(G, ok); }); }
    diceB.onclick = () => { if (myTurn() && !S.rolled) roll(); };
    svg.addEventListener("click", e => { const g = e.target.closest(".lp"); if (!g || !myTurn() || !S.rolled) return; const c = +g.dataset.c, i = +g.dataset.i, cur = S.players[S.turn]; if (c !== cur.c) return; const st = S.pc[c][i]; const mv = legal(S, c, S.dice).find(m => m.from === st); if (mv) move(mv); });
    const pw = root.querySelector("#lx_pow"), pick = root.querySelector("#lx_pick");
    if (pw) pw.onclick = () => { pick.hidden = !pick.hidden; pick.innerHTML = [1, 2, 3, 4, 5, 6].map(d => `<button data-pd="${d}" aria-label="Roll ${d}">${diceFace(d)}</button>`).join(""); };
    pick.addEventListener("click", async e => { const b = e.target.closest("[data-pd]"); if (!b) return; pick.hidden = true; try { await spendToken(); roll(+b.dataset.pd); } catch (er) { lToast(er.message || commErr(er), true); } });
    root.querySelector("#lx_snd").onclick = e => { const on = store.get("ludoSnd", true) === false; store.set("ludoSnd", on); e.currentTarget.textContent = on ? "🔊" : "🔈"; };
    root.querySelector("#lx_more").onclick = () => { const sh = document.createElement("div"); sh.className = "sheet";
      sh.innerHTML = `<div class="sheetin"><h3>Game</h3><div class="card small"><b>House rules</b>${settingsHTML(S.set, false)}</div><div class="btnrow"><button class="btn btn-ghost" id="lm_r">How to play</button>${o.leave && S.status === "playing" ? `<button class="btn btn-ghost" id="lm_l">Leave game</button>` : ""}${o.local ? `<button class="btn btn-ghost" id="lm_n">New game</button>` : ""}<button class="btn" id="lm_x">Close</button></div></div>`;
      document.body.appendChild(sh); const x = () => sh.remove(); sh.addEventListener("click", e => { if (e.target === sh) x(); }); sh.querySelector("#lm_x").onclick = x; sh.querySelector("#lm_r").onclick = () => { x(); rulesSheet(); };
      const l = sh.querySelector("#lm_l"); if (l) l.onclick = () => { if (!l.dataset.arm) { l.dataset.arm = 1; l.textContent = "Tap again to leave"; return; } x(); o.leave(); };
      const n = sh.querySelector("#lm_n"); if (n) n.onclick = () => { x(); store.set("ludoLocal", null); o.again(); }; };
    const vb = root.querySelector("#lx_voice"); if (vb) vb.onclick = () => o.voice();
    const fs = root.querySelector("#lx_fs"); if (fs) fs.onclick = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else document.documentElement.requestFullscreen({navigationUI: "hide"}).catch(() => lToast("Full screen is not available here.", true)); };
    const vnB = root.querySelector("#lx_vn"); if (vnB) vnB.onclick = () => o.vnRec();
    const vnA = root.querySelector("#lx_vna"); if (vnA) vnA.onclick = () => { store.set("ludoAutoVN", store.get("ludoAutoVN", true) === false); render(); };
    const mb = root.querySelector("#lx_mute"); if (mb) mb.onclick = () => { o.mute(); render(); };
    $$("[data-emo]", root).forEach(b => b.onclick = () => o.emo(b.dataset.emo));
    return api = {
      async show(n) {
        if (stopped || !n) return;
        if (animating) { pendingShow = n; return; }
        const first = !S, prev = S; S = clone(n); S.turnAt = n.turnAt;
        if (first || !pcs.children.length || (prev && prev.players.length !== S.players.length)) { shown = {}; S.players.forEach(p => (S.pc[p.c] || []).forEach((st, i) => shown[p.c + "_" + i] = st)); drawPieces(); place(); lastMvKey = S.mv ? S.mv.k : 0; render(); return; }
        if (S.mv && S.mv.k !== lastMvKey) { lastMvKey = S.mv.k; render(); diceB.disabled = true; await animate(S.mv); }
        S.players.forEach(p => (S.pc[p.c] || []).forEach((st, i) => shown[p.c + "_" + i] = st)); place(); render();
        if (pendingShow) { const q = pendingShow; pendingShow = null; this.show(q); }
      },
      note(uid, play) { notes[uid] = play; if (!S) return; const el = root.querySelector(`[data-seat="${CSS.escape(uid)}"]`); if (!el) return; let b = el.querySelector(".lnote"); if (!b) { b = document.createElement("button"); b.className = "lnote"; el.appendChild(b); } b.textContent = "▶ voice"; b.onclick = e => { e.stopPropagation(); play(); }; },
      talk(uid, on) { talking[uid] = on; const el = root.querySelector(`[data-seat="${CSS.escape(uid)}"]`); if (el) el.classList.toggle("talk", on); },
      stop() { stopped = true; clearTimeout(botT); clearTimeout(autoT); clearInterval(tick); }
    };
  }
  /* the winner's moment: full-screen blooming flower, spinning rays, trophy, fireworks and confetti */
  function celebrate(name, col, isMe, sub) {
    $$(".lcel").forEach(e => e.remove());
    const petals = Array.from({length: 14}, (_, k) => `<ellipse class="lpet" cx="0" cy="-58" rx="22" ry="56" fill="url(#lpg${k % 2})" style="--r:${k * (360 / 14)}deg;--d:${(k * 0.06).toFixed(2)}s"/>`).join("");
    const inner = Array.from({length: 10}, (_, k) => `<ellipse class="lpet" cx="0" cy="-34" rx="14" ry="34" fill="url(#lpg2)" style="--r:${k * 36 + 18}deg;--d:${(0.5 + k * 0.05).toFixed(2)}s"/>`).join("");
    const w = document.createElement("div"); w.className = "lcel"; w.style.setProperty("--wc", col);
    w.innerHTML = `<div class="lrays"></div><svg class="lflower" viewBox="-130 -130 260 260" aria-hidden="true"><defs>
        <radialGradient id="lpg0" cx="50%" cy="85%" r="90%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffb3c7"/><stop offset="1" stop-color="#e91e63"/></radialGradient>
        <radialGradient id="lpg1" cx="50%" cy="85%" r="90%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffd59e"/><stop offset="1" stop-color="#ff7a00"/></radialGradient>
        <radialGradient id="lpg2" cx="50%" cy="85%" r="90%"><stop offset="0" stop-color="#fff8e1"/><stop offset="1" stop-color="#ffb300"/></radialGradient>
        <radialGradient id="lpc"><stop offset="0" stop-color="#fff59d"/><stop offset=".6" stop-color="#ffca28"/><stop offset="1" stop-color="#e65100"/></radialGradient></defs>
        <g class="lspin">${petals}${inner}</g><circle class="lctr" r="30" fill="url(#lpc)"/><text y="13" text-anchor="middle" font-size="36" class="lctr">🏆</text></svg>
      <div class="lcelt"><div class="lcrown">👑</div><h1>${isMe ? "You are the champion!" : H(name) + " wins!"}</h1><p>${isMe ? "Brilliant game — every piece home first. Be proud!" : "What a game! Congratulate the winner 👏"}</p>${sub ? `<p class="lcels">${sub}</p>` : ""}${(() => { const q = WIN_Q[Math.floor(Math.random() * WIN_Q.length)]; return `<blockquote class="lquote">“${H(q[0])}”<small>— ${H(q[1])}</small></blockquote>`; })()}<button class="lcelb">Continue</button></div>`;
    document.body.appendChild(w);
    const close = () => { w.classList.add("out"); setTimeout(() => w.remove(), 450); };
    w.querySelector(".lcelb").onclick = close; w.addEventListener("click", e => { if (e.target === w) close(); });
    /* fireworks */
    const fw = () => { if (!w.isConnected) return; const b = document.createElement("div"); b.className = "lfw"; b.style.left = 10 + Math.random() * 80 + "vw"; b.style.top = 8 + Math.random() * 45 + "vh"; const cs = ["#ff4081", "#ffd740", "#69f0ae", "#40c4ff", "#ff6e40", "#e040fb", col];
      for (let k = 0; k < 22; k++) { const i = document.createElement("i"); const a = k / 22 * Math.PI * 2, d = 60 + Math.random() * 70; i.style.setProperty("--x", Math.cos(a) * d + "px"); i.style.setProperty("--y", Math.sin(a) * d + "px"); i.style.background = cs[Math.floor(Math.random() * cs.length)]; b.appendChild(i); }
      w.appendChild(b); setTimeout(() => b.remove(), 1400); };
    for (let k = 0; k < 14; k++) setTimeout(fw, 300 + k * 420);
    confetti(); setTimeout(confetti, 1600); if (isMe) setTimeout(confetti, 3200);
    buzz(isMe ? [80, 60, 80, 60, 200] : 60);
  }
  function confetti() { const w = document.createElement("div"); w.className = "lconf"; const cs = COLORS.map(c => c[1]); for (let k = 0; k < 90; k++) { const i = document.createElement("i"); i.style.left = Math.random() * 100 + "vw"; i.style.background = cs[k % 4]; i.style.animationDelay = Math.random() * 0.9 + "s"; i.style.animationDuration = 2 + Math.random() * 1.6 + "s"; w.appendChild(i); } document.body.appendChild(w); setTimeout(() => w.remove(), 4200); }

  /* ---------- live voice: WebRTC mesh between the human players, signalled through games/{id}/rtc ---------- */
  function Voice(gref, me, peers, onTalk) {
    const rtc = gref.collection("rtc"), ICE = {iceServers: [{urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]}]};
    const conns = {}, unsubs = [], audios = {}, meters = [], sid = Math.random().toString(36).slice(2, 10);
    let local = null, muted = false, stopped = false, actx = null;
    const pairId = u => [me, u].sort().join("__");
    const meter = (stream, uid) => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const src = actx.createMediaStreamSource(stream), an = actx.createAnalyser(); an.fftSize = 512; src.connect(an); const buf = new Uint8Array(an.frequencyBinCount); let on = false;
      const iv = setInterval(() => { an.getByteFrequencyData(buf); const v = buf.reduce((a, b) => a + b, 0) / buf.length; const now = v > 18 && !(uid === me && muted); if (now !== on) { on = now; onTalk(uid, on); } }, 160); meters.push(iv); } catch (e) {} };
    async function connect(u) {
      if (conns[u] || stopped) return;
      const pc = new RTCPeerConnection(ICE), offerer = me < u, doc = rtc.doc(pairId(u)); conns[u] = pc;
      local.getTracks().forEach(t => pc.addTrack(t, local));
      pc.ontrack = e => { let a = audios[u]; if (!a) { a = audios[u] = new Audio(); a.autoplay = true; a.playsInline = true; document.body.appendChild(a); } a.srcObject = e.streams[0]; a.play().catch(() => {}); meter(e.streams[0], u); };
      pc.onicecandidate = e => { if (e.candidate) doc.set({[offerer ? "co" : "ca"]: fv().arrayUnion(JSON.stringify(e.candidate.toJSON()))}, {merge: true}).catch(() => {}); };
      pc.onconnectionstatechange = () => { if (["failed", "closed"].includes(pc.connectionState)) { delete conns[u]; } };
      const seen = new Set();
      if (offerer) {
        await doc.set({sid, offer: null, answer: null, co: [], ca: []});
        const off = await pc.createOffer(); await pc.setLocalDescription(off); await doc.update({offer: {type: off.type, sdp: off.sdp}});
      }
      unsubs.push(doc.onSnapshot(async d => { if (!d.exists || stopped) return; const x = d.data();
        try {
          if (offerer && x.sid === sid && x.answer && !pc.currentRemoteDescription) await pc.setRemoteDescription(x.answer);
          if (!offerer && x.offer && x.sid && (!pc.remoteDescription || pc._sid !== x.sid)) {
            if (pc._sid && pc._sid !== x.sid) { pc.close(); delete conns[u]; return connect(u); }
            pc._sid = x.sid; await pc.setRemoteDescription(x.offer); const ans = await pc.createAnswer(); await pc.setLocalDescription(ans); await doc.update({answer: {type: ans.type, sdp: ans.sdp}});
          }
          const cands = (offerer ? x.ca : x.co) || [];
          if (pc.remoteDescription) for (const c of cands) if (!seen.has(c)) { seen.add(c); await pc.addIceCandidate(JSON.parse(c)).catch(() => {}); }
        } catch (e) {}
      }));
    }
    return {
      get muted() { return muted; },
      async start() {
        if (!navigator.mediaDevices || !window.RTCPeerConnection) throw new Error("Voice needs a newer browser.");
        local = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true}});
        meter(local, me);
        await rtc.doc("p_" + me).set({on: true, sid, ts: fv().serverTimestamp()});
        /* connect to everyone already in voice, and to anyone who joins later */
        unsubs.push(rtc.onSnapshot(s => s.forEach(d => { if (!d.id.startsWith("p_")) return; const u = d.id.slice(2); if (u !== me && peers.includes(u) && d.data().on) connect(u).catch(() => {}); })));
      },
      mute() { muted = !muted; if (local) local.getAudioTracks().forEach(t => t.enabled = !muted); },
      stop() { stopped = true; unsubs.forEach(f => f()); meters.forEach(clearInterval); Object.values(conns).forEach(pc => pc.close()); Object.values(audios).forEach(a => a.remove()); if (local) local.getTracks().forEach(t => t.stop()); rtc.doc("p_" + me).delete().catch(() => {}); peers.forEach(u => { if (me < u) rtc.doc(pairId(u)).delete().catch(() => {}); }); onTalk(me, false); }
    };
  }

  window.Ludo = {mount, fromChat, createOnline, stop: () => { if (CUR) { CUR.stop(); CUR = null; } if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }, _engine: {newState, legal, apply, doRoll, doMove, botPick, PATH}};
})();
