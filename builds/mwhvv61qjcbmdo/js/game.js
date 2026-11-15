'use strict';
/* ============================================================
   Snake 3D — Cartoon Adventure
   Classic snake in a pseudo-3D cartoon world (canvas, no libs).
   Eat apples to grow longer, chase golden apples for bonuses.
   ============================================================ */

// ---------- constants & state ----------
const GRID = 17;
const STORE_BEST = 'snake3d_best';
const STORE_MUTE = 'snake3d_muted';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const el = id => document.getElementById(id);
const hudScore = el('hudScore'), hudBest = el('hudBest'), hudLen = el('hudLen');
const menuEl = el('menu'), overEl = el('over'), pausedTag = el('pausedTag');

let W = 0, H = 0, DPR = 1;
let state = 'menu'; // menu | playing | paused | over
let dying = false;
let snake = [], prev = [], dir = { x: 0, y: 1 }, dirQueue = [];
let growth = 0, score = 0, best = +(localStorage.getItem(STORE_BEST) || 0);
let applesEaten = 0, tickMs = 160, lastTick = 0;
let food = null, gold = null; // gold: {x, y, until}
let particles = [];
let shake = 0, flash = 0;
let camX = GRID / 2, camY = GRID / 2;
let muted = localStorage.getItem(STORE_MUTE) === '1';
let runId = 0;
const clouds = [];
for (let i = 0; i < 5; i++) clouds.push({ fx: Math.random(), fy: 0.03 + Math.random() * 0.16, s: 0.6 + Math.random() * 0.9, v: 0.004 + Math.random() * 0.006 });

// ---------- tiny helpers ----------
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = n => Math.floor(Math.random() * n);
function sameCell(a, b) { return a.x === b.x && a.y === b.y; }
function cellFree(x, y) {
  if (snake.some(s => s.x === x && s.y === y)) return false;
  if (food && food.x === x && food.y === y) return false;
  if (gold && gold.x === x && gold.y === y) return false;
  return true;
}

// ---------- sound (WebAudio, synthesized — no files) ----------
let AC = null;
function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f0, f1, dur, type, vol, delay) {
  if (muted) return;
  const ac = audio(); if (!ac) return;
  const t = ac.currentTime + (delay || 0);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f0, t);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  g.gain.setValueAtTime(vol || 0.14, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
const sfx = {
  eat()   { tone(740, 1180, 0.12, 'sine', 0.16); },
  gold()  { tone(880, 880, 0.09, 'triangle', 0.16); tone(1174, 1174, 0.09, 'triangle', 0.16, 0.08); tone(1568, 1568, 0.14, 'triangle', 0.16, 0.16); },
  die()   { tone(420, 70, 0.5, 'sawtooth', 0.12); },
  click() { tone(520, 660, 0.06, 'sine', 0.10); },
  turn()  { tone(300, 340, 0.04, 'sine', 0.05); }
};

// ---------- game flow ----------
function spawnFood() {
  let x, y, tries = 0;
  do { x = rnd(GRID); y = rnd(GRID); tries++; } while (!cellFree(x, y) && tries < 500);
  food = { x, y };
}
function reset() {
  snake = [{ x: 8, y: 9 }, { x: 8, y: 8 }, { x: 8, y: 7 }];
  prev = snake.map(s => ({ ...s }));
  dir = { x: 0, y: 1 }; dirQueue = [];
  growth = 0; score = 0; applesEaten = 0; tickMs = 160;
  gold = null; particles = []; dying = false; shake = 0; flash = 0;
  camX = GRID / 2; camY = GRID / 2;
  spawnFood();
  updateHud();
}
function startGame() {
  audio(); sfx.click();
  reset();
  runId++;
  state = 'playing';
  menuEl.classList.add('hidden');
  overEl.classList.add('hidden');
  pausedTag.classList.add('hidden');
  lastTick = performance.now();
}
function setDir(x, y) {
  if (state !== 'playing' || dying) return;
  const last = dirQueue.length ? dirQueue[dirQueue.length - 1] : dir;
  if (last.x === -x && last.y === -y) return; // no reversing
  if (last.x === x && last.y === y) return;   // no-op
  if (dirQueue.length < 3) { dirQueue.push({ x, y }); sfx.turn(); }
}
function tick(now) {
  prev = snake.map(s => ({ ...s }));
  if (dirQueue.length) dir = dirQueue.shift();
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) return die();
  const bodyToCheck = growth > 0 ? snake : snake.slice(0, -1);
  if (bodyToCheck.some(s => s.x === head.x && s.y === head.y)) return die();
  snake.unshift(head);
  if (food && sameCell(head, food)) {
    score += 10; applesEaten++; growth += 1;
    burst(head.x + 0.5, head.y + 0.5, 0.6, ['#ff4757', '#ff6b81', '#ffffff'], 10);
    sfx.eat();
    tickMs = Math.max(80, 160 - applesEaten * 2.5);
    spawnFood();
    if (applesEaten % 5 === 0 && !gold) {
      let x, y, tries = 0;
      do { x = rnd(GRID); y = rnd(GRID); tries++; } while (!cellFree(x, y) && tries < 500);
      if (tries < 500) gold = { x, y, until: now + 7000 };
    }
  } else if (gold && sameCell(head, gold)) {
    score += 50; growth += 2;
    burst(head.x + 0.5, head.y + 0.5, 0.6, ['#ffd32a', '#fff3b0', '#ffa502'], 16);
    sfx.gold();
    gold = null;
  }
  if (growth > 0) growth--; else snake.pop();
  if (gold && now > gold.until) gold = null;
  updateHud();
}
function die() {
  dying = true; shake = 16; flash = 0.55;
  sfx.die();
  if (score > best) { best = score; localStorage.setItem(STORE_BEST, String(best)); }
  const id = runId;
  setTimeout(() => {
    if (id !== runId) return;
    state = 'over'; dying = false;
    el('finalScore').textContent = 'Score: ' + score;
    el('finalBest').textContent = '🏆 Best: ' + best;
    overEl.classList.remove('hidden');
    updateHud();
  }, 650);
}
function updateHud() {
  hudScore.textContent = '🍎 ' + score;
  hudBest.textContent = '🏆 ' + Math.max(best, score);
  hudLen.textContent = '🐍 ' + snake.length;
  el('menuBest').textContent = '🏆 Best: ' + best;
}

// ---------- particles ----------
function burst(x, y, z, colors, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 1.2 + Math.random() * 2.4;
    particles.push({
      x, y, z,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 2.2 + Math.random() * 2.4,
      life: 0, max: 0.55 + Math.random() * 0.4,
      color: colors[rnd(colors.length)], r: 0.06 + Math.random() * 0.07
    });
  }
}
function stepParticles(dt) {
  for (const p of particles) {
    p.life += dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    p.vz -= 6.5 * dt;
    if (p.z < 0.03) { p.z = 0.03; p.vz *= -0.4; }
  }
  particles = particles.filter(p => p.life < p.max);
}

// ---------- input ----------
const DIRS = { up: { x: 0, y: 1 }, down: { x: 0, y: -1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
window.addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'ArrowUp' || k === 'w' || k === 'W') { setDir(0, 1); e.preventDefault(); }
  else if (k === 'ArrowDown' || k === 's' || k === 'S') { setDir(0, -1); e.preventDefault(); }
  else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { setDir(-1, 0); e.preventDefault(); }
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') { setDir(1, 0); e.preventDefault(); }
  else if (k === ' ') { if (state === 'playing') togglePause(); else if (state === 'menu' || state === 'over') startGame(); e.preventDefault(); }
  else if (k === 'Enter') { if (state === 'menu' || state === 'over') startGame(); }
});
let touchStart = null;
window.addEventListener('touchstart', e => {
  if (e.target.closest('button') || e.target.closest('.overlay')) return;
  const t = e.changedTouches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });
window.addEventListener('touchend', e => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
  else setDir(0, dy < 0 ? 1 : -1); // swipe up = screen up = +y in world
}, { passive: true });
document.querySelectorAll('.padBtn').forEach(b => {
  b.addEventListener('pointerdown', e => {
    e.preventDefault();
    const d = DIRS[b.dataset.dir];
    if (d) setDir(d.x, d.y);
  });
});
el('btnPlay').addEventListener('click', startGame);
el('btnAgain').addEventListener('click', startGame);
function togglePause() {
  if (state === 'playing' && !dying) { state = 'paused'; pausedTag.classList.remove('hidden'); }
  else if (state === 'paused') { state = 'playing'; pausedTag.classList.add('hidden'); lastTick = performance.now(); }
}
el('btnPause').addEventListener('click', () => { sfx.click(); togglePause(); });
const btnSound = el('btnSound');
function paintSound() { btnSound.textContent = muted ? '🔇' : '🔊'; }
btnSound.addEventListener('click', () => {
  muted = !muted;
  localStorage.setItem(STORE_MUTE, muted ? '1' : '0');
  paintSound();
  if (!muted) sfx.click();
});
paintSound();
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') togglePause(); });

// ---------- resize ----------
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);

// ============================================================
//  Rendering — pseudo-3D: perspective projection + painter sort
// ============================================================
const TILT = 1.05, COS = Math.cos(TILT), SIN = Math.sin(TILT);
const FOCAL = 20, CAMD = 15;
function project(x, y, z) {
  const dx = x - camX, dy = y - camY;
  const sy = dy * COS - z * SIN;
  const depth = dy * SIN + z * COS;
  const s = FOCAL / (FOCAL + CAMD + depth);
  const u = Math.min(W / 10.8, H / 6.6);
  return { x: W / 2 + dx * s * u, y: H * 0.56 - sy * s * u, s, u };
}
function poly(points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
}
function drawSphere(x, y, z, r, cLight, cDark) {
  const p = project(x, y, z);
  const rp = r * p.s * p.u;
  const g = ctx.createRadialGradient(p.x - rp * 0.35, p.y - rp * 0.42, rp * 0.15, p.x, p.y, rp * 1.05);
  g.addColorStop(0, cLight); g.addColorStop(1, cDark);
  ctx.beginPath(); ctx.arc(p.x, p.y, rp, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();
  return { p, rp };
}
function drawShadow(x, y, r, alpha) {
  const p = project(x, y, 0);
  const rx = r * p.s * p.u, ry = rx * 0.36;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(20,60,25,' + alpha + ')'; ctx.fill();
}
function cloud(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
  ctx.arc(x + s * 0.45, y + s * 0.08, s * 0.38, 0, Math.PI * 2);
  ctx.arc(x - s * 0.45, y + s * 0.10, s * 0.34, 0, Math.PI * 2);
  ctx.arc(x + s * 0.05, y - s * 0.18, s * 0.36, 0, Math.PI * 2);
  ctx.fill();
}
function drawGround() {
  const x0 = -0.7, x1 = GRID + 0.7, y0 = -0.7, y1 = GRID + 0.7, d = 1.0;
  // floating-island soil faces
  poly([project(x0, y0, 0), project(x1, y0, 0), project(x1, y0, -d), project(x0, y0, -d)], '#9a6a42'); // south
  poly([project(x0, y0, 0), project(x0, y1, 0), project(x0, y1, -d), project(x0, y0, -d)], '#86603a'); // west
  poly([project(x1, y0, 0), project(x1, y1, 0), project(x1, y1, -d), project(x1, y0, -d)], '#7d5833'); // east
  // island top base (rim around the checkerboard)
  poly([project(x0, y0, 0), project(x1, y0, 0), project(x1, y1, 0), project(x0, y1, 0)], '#5cb85c');
  // grass checkerboard
  for (let j = GRID - 1; j >= 0; j--) {
    for (let i = 0; i < GRID; i++) {
      const c = (i + j) % 2 === 0 ? '#63c74d' : '#57b83e';
      poly([project(i, j, 0), project(i + 1, j, 0), project(i + 1, j + 1, 0), project(i, j + 1, 0)], c);
    }
  }
}
function drawHedge(cx, cy, w, h, height) {
  const xa = cx - w / 2, xb = cx + w / 2, ya = cy - h / 2, yb = cy + h / 2;
  poly([project(xa, ya, 0), project(xb, ya, 0), project(xb, ya, height), project(xa, ya, height)], '#2e7d32'); // south face
  poly([project(xa, ya, height), project(xb, ya, height), project(xb, yb, height), project(xa, yb, height)], '#43a047'); // top
  // leafy bumps along the top
  const n = Math.max(3, Math.round(Math.max(w, h) / 1.6));
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n;
    const bx = w >= h ? xa + w * f : cx;
    const by = w >= h ? cy : ya + h * f;
    const p = project(bx, by, height + 0.10);
    ctx.beginPath(); ctx.arc(p.x, p.y, 0.17 * p.s * p.u, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? '#4caf50' : '#66bb6a'; ctx.fill();
  }
}
function drawApple(x, y, isGold, t) {
  const bob = Math.sin(t * 3 + x) * 0.05;
  const z = 0.36 + bob;
  let light = '#ff8a7a', dark = '#d90429';
  if (isGold) {
    const left = gold ? gold.until - performance.now() : 9999;
    if (left < 2000 && Math.floor(t * 6) % 2 === 0) { light = '#fff3b0'; dark = '#f59e0b'; }
    else { light = '#ffe066'; dark = '#e8890c'; }
  }
  const res = drawSphere(x, y, z, 0.36, light, dark);
  const p = res.p, rp = res.rp;
  ctx.strokeStyle = '#7c4a21'; ctx.lineWidth = Math.max(rp * 0.13, 1.5); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(p.x, p.y - rp * 0.8);
  ctx.quadraticCurveTo(p.x + rp * 0.1, p.y - rp * 1.15, p.x + rp * 0.3, p.y - rp * 1.2); ctx.stroke();
  ctx.save();
  ctx.translate(p.x + rp * 0.42, p.y - rp * 1.05); ctx.rotate(-0.5);
  ctx.beginPath(); ctx.ellipse(0, 0, rp * 0.34, rp * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#37b24d'; ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(p.x - rp * 0.34, p.y - rp * 0.38, rp * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
  if (isGold) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + i * 2.1;
      const sx = p.x + Math.cos(a) * rp * 1.25, sy = p.y + Math.sin(a) * rp * 0.9;
      const r = rp * 0.10 * (1 + 0.3 * Math.sin(t * 5 + i));
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(r, 1), 0, Math.PI * 2); ctx.fill();
    }
  }
}
function drawBody(x, y, idx) {
  const alt = idx % 2 === 0;
  drawSphere(x, y, 0.47, 0.47, alt ? '#8bf35a' : '#7ae04b', alt ? '#2f9e44' : '#27923c');
}
function drawHead(x, y, t) {
  const R = 0.55;
  const res = drawSphere(x, y, R, R, '#9bf065', '#2f9e44');
  const p = res.p, rp = res.rp;
  const ahead = project(x + dir.x * 0.5, y + dir.y * 0.5, R);
  let fx = ahead.x - p.x, fy = ahead.y - p.y;
  const fl = Math.hypot(fx, fy) || 1; fx /= fl; fy /= fl;
  const px = -fy, py = fx; // screen-space perpendicular
  // tongue flick
  const flick = (t % 1.7) < 0.55 ? 1 : 0;
  if (flick && state !== 'over') {
    const bx = p.x + fx * rp * 0.92, by = p.y + fy * rp * 0.92;
    const tx = p.x + fx * rp * 1.5, ty = p.y + fy * rp * 1.5;
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = Math.max(rp * 0.09, 1.5); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(tx, ty);
    ctx.moveTo(tx, ty); ctx.lineTo(tx + (fx + px * 0.5) * rp * 0.28, ty + (fy + py * 0.5) * rp * 0.28);
    ctx.moveTo(tx, ty); ctx.lineTo(tx + (fx - px * 0.5) * rp * 0.28, ty + (fy - py * 0.5) * rp * 0.28);
    ctx.stroke();
  }
  // eyes
  for (const sgn of [-1, 1]) {
    const ex = p.x + fx * rp * 0.34 + px * sgn * rp * 0.38;
    const ey = p.y + fy * rp * 0.34 + py * sgn * rp * 0.38 - rp * 0.30;
    ctx.beginPath(); ctx.arc(ex, ey, rp * 0.30, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + fx * rp * 0.10, ey + fy * rp * 0.10, rp * 0.155, 0, Math.PI * 2); ctx.fillStyle = '#1f2937'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + fx * rp * 0.10 - rp * 0.05, ey + fy * rp * 0.10 - rp * 0.06, rp * 0.05, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  }
  // rosy cheeks
  ctx.fillStyle = 'rgba(255,120,150,0.35)';
  for (const sgn of [-1, 1]) {
    const cxp = p.x + px * sgn * rp * 0.62 + fx * rp * 0.05;
    const cyp = p.y + py * sgn * rp * 0.62 + fy * rp * 0.05 + rp * 0.08;
    ctx.beginPath(); ctx.ellipse(cxp, cyp, rp * 0.16, rp * 0.11, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function interpPoints(alpha) {
  const pts = [];
  const grew = snake.length > prev.length;
  for (let i = 0; i < snake.length; i++) {
    let oi = grew ? i - 1 : i;
    if (oi < 0) oi = 0;
    if (oi > prev.length - 1) oi = prev.length - 1;
    const o = prev[oi], c = snake[i];
    pts.push({ x: lerp(o.x, c.x, alpha) + 0.5, y: lerp(o.y, c.y, alpha) + 0.5 });
  }
  return pts;
}
function render(now) {
  const t = now / 1000;
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#4facfe'); sky.addColorStop(0.55, '#aee3ff'); sky.addColorStop(1, '#dff7e3');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // drifting clouds
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (const c of clouds) {
    const cx = ((c.fx + t * c.v) % 1.25 - 0.12) * W;
    cloud(cx, c.fy * H, c.s * Math.min(W, H) / 9);
  }
  // camera: gentle follow of the head
  const alpha = (state === 'playing' && !dying) ? clamp((now - lastTick) / tickMs, 0, 1) : 1;
  const pts = interpPoints(alpha);
  if (pts.length) {
    camX = lerp(camX, GRID / 2 + (pts[0].x - GRID / 2) * 0.22, 0.05);
    camY = lerp(camY, GRID / 2 + (pts[0].y - GRID / 2) * 0.22, 0.05);
  }
  ctx.save();
  if (shake > 0.2) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  drawGround();
  // soft shadows under everything
  for (const p of pts) drawShadow(p.x, p.y, 0.42, 0.20);
  if (food) drawShadow(food.x + 0.5, food.y + 0.5, 0.30, 0.22);
  if (gold) drawShadow(gold.x + 0.5, gold.y + 0.5, 0.30, 0.22);
  // depth-sorted objects (far first)
  const objs = [];
  objs.push({ d: GRID + 0.3, f: () => drawHedge(GRID / 2, GRID + 0.3, GRID + 1.4, 0.6, 0.55) });
  objs.push({ d: -0.3, f: () => drawHedge(GRID / 2, -0.3, GRID + 1.4, 0.6, 0.55) });
  objs.push({ d: GRID / 2, f: () => drawHedge(-0.3, GRID / 2, 0.6, GRID + 1.4, 0.55) });
  objs.push({ d: GRID / 2, f: () => drawHedge(GRID + 0.3, GRID / 2, 0.6, GRID + 1.4, 0.55) });
  if (food) objs.push({ d: food.y + 0.5, f: () => drawApple(food.x + 0.5, food.y + 0.5, false, t) });
  if (gold) objs.push({ d: gold.y + 0.5, f: () => drawApple(gold.x + 0.5, gold.y + 0.5, true, t) });
  for (let i = pts.length - 1; i >= 1; i--) {
    const p = pts[i], idx = i;
    objs.push({ d: p.y, f: () => drawBody(p.x, p.y, idx) });
  }
  if (pts.length) objs.push({ d: pts[0].y + 0.01, f: () => drawHead(pts[0].x, pts[0].y, t) });
  objs.sort((a, b) => b.d - a.d);
  for (const o of objs) o.f();
  // particles float above everything
  for (const p of particles) {
    const pr = project(p.x, p.y, p.z);
    ctx.globalAlpha = Math.max(1 - p.life / p.max, 0);
    ctx.beginPath(); ctx.arc(pr.x, pr.y, Math.max(p.r * pr.s * pr.u, 1), 0, Math.PI * 2);
    ctx.fillStyle = p.color; ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (flash > 0.01) {
    ctx.fillStyle = 'rgba(239,68,68,' + (flash * 0.5) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}

// ---------- main loop ----------
let lastFrame = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  if (state === 'playing' && !dying && now - lastTick >= tickMs) {
    tick(now);
    lastTick = now;
  }
  stepParticles(dt);
  shake = shake > 0.2 ? shake * Math.pow(0.001, dt) : 0;
  flash = flash > 0.01 ? flash * Math.pow(0.02, dt) : 0;
  render(now);
}

// ---------- go ----------
reset();
resize();
requestAnimationFrame(loop);
