'use strict';
/* ============================================================
   Worm Arena — Sweet Battle
   An original arena worm game: steer a cute worm around a big
   round arena, eat sweets, grow huge, squish rival worms and
   grab their glowing orbs. Single player vs smart AI worms.
   All art is drawn with code — no copied assets.
   ============================================================ */

// ---------- constants ----------
const WORLD_R = 2400;          // arena radius (world units)
const FOOD_COUNT = 320;
const BOT_COUNT = 11;
const STORE = { best: 'wa_best', name: 'wa_name', skin: 'wa_skin', mute: 'wa_mute' };

const SKINS = [
  { name: 'Candy',    colors: ['#ff5d8f', '#ff8fab', '#ffc2d4'] },
  { name: 'Ocean',    colors: ['#2196f3', '#03a9f4', '#4dd0e1'] },
  { name: 'Lemon',    colors: ['#f59e0b', '#facc15', '#fef08a'] },
  { name: 'Grape',    colors: ['#7c3aed', '#a855f7', '#c084fc'] },
  { name: 'Rainbow',  colors: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'] },
  { name: 'Tiger',    colors: ['#f97316', '#1f2937'] },
  { name: 'Panda',    colors: ['#f8fafc', '#111827'] },
  { name: 'Mint',     colors: ['#10b981', '#34d399', '#a7f3d0'] },
  { name: 'Bubble',   colors: ['#ec4899', '#8b5cf6', '#06b6d4'] },
  { name: 'Fire',     colors: ['#dc2626', '#f97316', '#fbbf24'] }
];
const BOT_NAMES = ['Wiggly', 'Noodle', 'Slinky', 'Pretzel', 'Bubbles', 'Ziggy', 'Mochi', 'Pickle',
  'Turbo', 'Pepper', 'Mango', 'Cookie', 'Waffles', 'Sprout', 'Comet', 'Pudding', 'Banana', 'Duchess',
  'Rainbow', 'Sushi', 'Biscuit', 'Toffee', 'Muffin', 'Pickles', 'Noodles', 'Sprinkle'];

const FOOD_TYPES = [
  { e: '🍬', pts: 2, glow: '#ff8fab' }, { e: '🍭', pts: 2, glow: '#c084fc' },
  { e: '🍩', pts: 3, glow: '#f59e0b' }, { e: '🍪', pts: 2, glow: '#d97706' },
  { e: '🍰', pts: 4, glow: '#fda4af' }, { e: '🧁', pts: 4, glow: '#f9a8d4' },
  { e: '🍓', pts: 3, glow: '#fb7185' }, { e: '🍒', pts: 3, glow: '#ef4444' },
  { e: '🍎', pts: 2, glow: '#f87171' }, { e: '🍉', pts: 3, glow: '#4ade80' },
  { e: '🍕', pts: 5, glow: '#fbbf24' }, { e: '🍔', pts: 5, glow: '#fb923c' }
];
const PICKUP_TYPES = [{ kind: 'magnet', e: '🧲', spr: null }, { kind: 'star', e: '⭐', spr: null }];

// ---------- dom ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const el = id => document.getElementById(id);
const hudEl = el('hud'), menuEl = el('menu'), overEl = el('over'), pauseEl = el('pauseMenu');
const boardList = el('boardList'), coinPill = el('coinPill'), lenPill = el('lenPill'), timePill = el('timePill');
const fxBox = el('fxBox'), toastEl = el('toast'), boostBtn = el('boostBtn');
const joyBase = el('joyBase'), joyKnob = el('joyKnob');
const nameInput = el('nameInput'), skinsEl = el('skins');

// ---------- state ----------
let W = 0, H = 0, DPR = 1;
let state = 'menu'; // menu | playing | paused | over
let worms = [], foods = [], pickups = [], particles = [], respawnQueue = [];
let player = null;
let cam = { x: 0, y: 0, scale: 1 };
let viewRect = { x0: -9999, y0: -9999, x1: 9999, y1: 9999 };
let elapsed = 0, reviveUsed = false, pickupTimer = 9, boardTimer = 0, prevRank = 99;
let best = +(localStorage.getItem(STORE.best) || 0);
let playerName = localStorage.getItem(STORE.name) || 'Player';
let playerSkin = clampInt(+(localStorage.getItem(STORE.skin) || 0), 0, SKINS.length - 1);
let muted = localStorage.getItem(STORE.mute) === '1';
let boostHeld = false;
let foodSprites = [];

function clampInt(v, a, b) { return isNaN(v) ? a : Math.max(a, Math.min(b, v)); }
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = n => Math.floor(Math.random() * n);
function angDiff(a, b) { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function fmtTime(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

// ---------- sound (synthesized, no files) ----------
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
  g.gain.setValueAtTime(vol || 0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
const sfx = {
  lastEat: 0,
  eat() { const n = performance.now(); if (n - this.lastEat < 70) return; this.lastEat = n; tone(640 + Math.random() * 240, 980, 0.08, 'sine', 0.09); },
  kill() { tone(300, 620, 0.16, 'triangle', 0.14); tone(620, 940, 0.14, 'triangle', 0.12, 0.1); },
  power() { tone(880, 880, 0.09, 'triangle', 0.13); tone(1174, 1174, 0.09, 'triangle', 0.13, 0.08); tone(1568, 1568, 0.16, 'triangle', 0.13, 0.16); },
  die() { tone(420, 65, 0.55, 'sawtooth', 0.11); },
  click() { tone(520, 660, 0.06, 'sine', 0.09); }
};

// ---------- sprites (pre-rendered for speed) ----------
function makeFoodSprite(ft) {
  const c = document.createElement('canvas'); c.width = c.height = 96;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(48, 48, 4, 48, 48, 46);
  grad.addColorStop(0, ft.glow + 'cc'); grad.addColorStop(1, ft.glow + '00');
  g.fillStyle = grad; g.beginPath(); g.arc(48, 48, 46, 0, Math.PI * 2); g.fill();
  g.font = '52px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 10;
  g.fillText(ft.e, 48, 52); g.fillText(ft.e, 48, 52);
  return c;
}
const orbSprites = {};
function orbSprite(color) {
  if (orbSprites[color]) return orbSprites[color];
  const c = document.createElement('canvas'); c.width = c.height = 48;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(24, 24, 2, 24, 24, 22);
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.35, color); grad.addColorStop(1, color);
  g.fillStyle = grad; g.beginPath(); g.arc(24, 24, 22, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 2; g.stroke();
  orbSprites[color] = c;
  return c;
}
function makePickupSprite(e) {
  const c = document.createElement('canvas'); c.width = c.height = 110;
  const g = c.getContext('2d');
  g.font = '64px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(255,220,80,.95)'; g.shadowBlur = 22;
  g.fillText(e, 55, 58); g.fillText(e, 55, 58);
  return c;
}

// ---------- world ----------
function wormRadius(w) { return 11 + Math.min(17, Math.sqrt(Math.max(0, w.score)) * 0.55); }
function wormTargetLen(w) { return 110 + Math.min(2600, w.score * 1.7); }
function wormSpeed(w) { return w.boost ? 252 : 138; }

function makeWorm(name, skinIdx, isPlayer, startScore) {
  const a = Math.random() * Math.PI * 2, d = Math.random() * WORLD_R * 0.5;
  const w = {
    name, skin: SKINS[skinIdx], skinIdx, isPlayer: !!isPlayer,
    x: Math.cos(a) * d, y: Math.sin(a) * d,
    angle: Math.random() * Math.PI * 2, targetAngle: 0,
    points: [], score: startScore || 0, len: 110, kills: 0,
    alive: true, boost: false, orbDrop: 0,
    protectUntil: performance.now() + (isPlayer ? 2500 : 1500),
    magnetT: 0, doubleT: 0,
    ai: { think: Math.random() * 0.2, boost: false, holdUntil: 0 }
  };
  w.targetAngle = w.angle;
  const n = Math.ceil(w.len / 4);
  for (let i = 0; i <= n; i++) w.points.push({ x: w.x - Math.cos(w.angle) * i * 4, y: w.y - Math.sin(w.angle) * i * 4 });
  return w;
}
function makeBot(usedNames) {
  let name, guard = 0;
  do { name = BOT_NAMES[rnd(BOT_NAMES.length)]; guard++; } while (usedNames && usedNames.has(name) && guard < 20);
  if (usedNames) usedNames.add(name);
  const score = Math.random() < 0.18 ? 260 + rnd(500) : 15 + rnd(160);
  const w = makeWorm(name, rnd(SKINS.length), false, score);
  w.len = wormTargetLen(w);
  return w;
}
function spawnFood(n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (WORLD_R - 70);
    const ti = rnd(FOOD_TYPES.length);
    foods.push({ kind: 'food', x: Math.cos(a) * d, y: Math.sin(a) * d, spr: foodSprites[ti], pts: FOOD_TYPES[ti].pts, r: 15, ph: Math.random() * 6.28 });
  }
}
function addOrb(x, y, color, pts) {
  foods.push({ kind: 'orb', x, y, spr: orbSprite(color), pts: pts || 2, r: 11, ph: Math.random() * 6.28 });
}
function initWorld(withPlayer) {
  worms = []; foods = []; pickups = []; particles = []; respawnQueue = [];
  spawnFood(FOOD_COUNT);
  if (withPlayer) {
    player = makeWorm(playerName || 'Player', playerSkin, true, 0);
    worms.push(player);
  } else player = null;
  const used = new Set();
  for (let i = 0; i < BOT_COUNT; i++) worms.push(makeBot(used));
  pickupTimer = 9;
}
function burst(x, y, colors, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 140;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.5 + Math.random() * 0.4, color: colors[rnd(colors.length)], r: 3 + Math.random() * 4 });
  }
}
function stepParticles(dt) {
  for (const p of particles) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; }
  particles = particles.filter(p => p.life < p.max);
}

// ============================================================
//  Simulation
// ============================================================
function trimTrail(w) {
  let acc = 0;
  for (let i = 1; i < w.points.length; i++) {
    acc += Math.hypot(w.points[i].x - w.points[i - 1].x, w.points[i].y - w.points[i - 1].y);
    if (acc >= w.len) { w.points.length = i + 1; return; }
  }
}
function stepWorm(w, dt, now) {
  if (!w.isPlayer) botThink(w, dt, now);
  const da = angDiff(w.targetAngle, w.angle);
  const turnRate = 3.6;
  w.angle += clamp(da, -turnRate * dt, turnRate * dt);
  const wantBoost = w.isPlayer ? (boostHeld || keys[' '] || keys['Shift']) : w.ai.boost;
  w.boost = !!wantBoost && w.score > 25 && w.len > 130;
  const speed = wormSpeed(w);
  w.x += Math.cos(w.angle) * speed * dt;
  w.y += Math.sin(w.angle) * speed * dt;
  const p0 = w.points[0];
  if (Math.hypot(w.x - p0.x, w.y - p0.y) >= 4) w.points.unshift({ x: w.x, y: w.y });
  else { p0.x = w.x; p0.y = w.y; }
  w.len += (wormTargetLen(w) - w.len) * Math.min(1, dt * 2.2);
  trimTrail(w);
  if (w.boost) {
    w.score = Math.max(0, w.score - 13 * dt);
    w.orbDrop -= dt;
    if (w.orbDrop <= 0) {
      w.orbDrop = 0.14;
      const tail = w.points[w.points.length - 1];
      addOrb(tail.x, tail.y, w.skin.colors[0], 1);
    }
  }
}
function botThink(w, dt, now) {
  const ai = w.ai;
  ai.think -= dt;
  ai.boost = false;
  const dc = Math.hypot(w.x, w.y);
  if (dc > WORLD_R - 300) { // steer away from the deadly border
    w.targetAngle = Math.atan2(-w.y, -w.x) + (Math.random() - 0.5) * 0.3;
    ai.holdUntil = now + 300;
    return;
  }
  if (ai.think > 0) return;
  ai.think = 0.14 + Math.random() * 0.06;
  const r = wormRadius(w);
  // danger probe: another worm's body right ahead?
  const probeX = w.x + Math.cos(w.angle) * r * 3.4;
  const probeY = w.y + Math.sin(w.angle) * r * 3.4;
  let danger = null;
  for (const o of worms) {
    if (o === w || !o.alive) continue;
    const lim = r + wormRadius(o) + 26;
    for (let i = 3; i < o.points.length; i += 2) {
      const p = o.points[i];
      if (Math.hypot(p.x - probeX, p.y - probeY) < lim) { danger = p; break; }
    }
    if (danger) break;
  }
  if (danger) {
    w.targetAngle = Math.atan2(probeY - danger.y, probeX - danger.x) + (Math.random() < 0.5 ? 0.9 : -0.9);
    ai.boost = w.score > 200;
    return;
  }
  // big bots sometimes hunt smaller worms
  if (w.score > 260 && Math.random() < 0.35) {
    let prey = null, bestD = 700;
    for (const o of worms) {
      if (o === w || !o.alive) continue;
      if (o.score < w.score * 0.55) {
        const d = Math.hypot(o.x - w.x, o.y - w.y);
        if (d < bestD) { bestD = d; prey = o; }
      }
    }
    if (prey) {
      const lead = 0.35, ps = wormSpeed(prey);
      w.targetAngle = Math.atan2(prey.y + Math.sin(prey.angle) * ps * lead - w.y, prey.x + Math.cos(prey.angle) * ps * lead - w.x);
      ai.boost = bestD < 260 && w.score > 320;
      return;
    }
  }
  // otherwise head for the nearest sweet
  let bf = null, bd = 620;
  for (const f of foods) {
    const d = Math.hypot(f.x - w.x, f.y - w.y);
    if (d < bd) { bd = d; bf = f; }
  }
  if (bf) w.targetAngle = Math.atan2(bf.y - w.y, bf.x - w.x);
  else w.targetAngle += (Math.random() - 0.5) * 0.8;
}
function checkDeath(w, now) {
  if (now < w.protectUntil) return;
  const r = wormRadius(w);
  if (Math.hypot(w.x, w.y) > WORLD_R - r * 0.35) { die(w, null); return; }
  for (const o of worms) {
    if (o === w || !o.alive) continue;
    const lim = r * 0.75 + wormRadius(o) * 0.9, lim2 = lim * lim;
    for (let i = 3; i < o.points.length; i += 2) {
      const p = o.points[i];
      const dx = p.x - w.x, dy = p.y - w.y;
      if (dx * dx + dy * dy < lim2) { die(w, o); return; }
    }
  }
}
function die(w, killer) {
  if (!w.alive) return;
  w.alive = false;
  for (let i = 0; i < w.points.length; i += 3) {
    const p = w.points[i];
    addOrb(p.x + (Math.random() - 0.5) * 10, p.y + (Math.random() - 0.5) * 10, w.skin.colors[Math.floor(i / 3) % w.skin.colors.length], 2);
  }
  burst(w.x, w.y, w.skin.colors, 22);
  if (killer && killer !== w) {
    killer.kills++;
    killer.score += 25;
    if (killer.isPlayer) { toast('💥 You squished ' + w.name + '! +25'); sfx.kill(); }
  }
  if (w.isPlayer) gameOver(killer);
  else respawnQueue.push(performance.now() + 2500 + Math.random() * 2500);
}
function eatFood(w, now) {
  const r = wormRadius(w) + 13, r2 = r * r;
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    const dx = f.x - w.x, dy = f.y - w.y;
    if (dx * dx + dy * dy < r2) {
      foods.splice(i, 1);
      let pts = f.pts;
      if (w.isPlayer && w.doubleT > now) pts *= 2;
      w.score += pts;
      if (w.isPlayer) { sfx.eat(); burst(f.x, f.y, ['#ffffff', '#ffd93d'], 4); }
    }
  }
}
function simulate(dt, now) {
  for (let i = respawnQueue.length - 1; i >= 0; i--) {
    if (now >= respawnQueue[i]) { respawnQueue.splice(i, 1); worms.push(makeBot(null)); }
  }
  if (foods.length < FOOD_COUNT && Math.random() < 0.35) spawnFood(1);
  pickupTimer -= dt;
  if (pickupTimer <= 0) {
    pickupTimer = 13 + Math.random() * 8;
    if (pickups.length < 2) {
      const t = PICKUP_TYPES[rnd(PICKUP_TYPES.length)];
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (WORLD_R - 200);
      pickups.push({ kind: t.kind, spr: t.spr, x: Math.cos(a) * d, y: Math.sin(a) * d, r: 22 });
    }
  }
  for (const w of worms) if (w.alive) stepWorm(w, dt, now);
  for (const w of worms) if (w.alive) checkDeath(w, now);
  for (const w of worms) if (w.alive) eatFood(w, now);
  if (player && player.alive) {
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      if (Math.hypot(player.x - p.x, player.y - p.y) < wormRadius(player) + p.r) {
        if (p.kind === 'magnet') { player.magnetT = now + 9000; toast('🧲 Magnet! Sweets fly to you'); }
        else { player.doubleT = now + 12000; toast('⭐ Double coins!'); }
        sfx.power();
        pickups.splice(i, 1);
      }
    }
    if (player.magnetT > now) {
      for (const f of foods) {
        const dx = player.x - f.x, dy = player.y - f.y, d = Math.hypot(dx, dy);
        if (d < 200 && d > 1) { f.x += dx / d * 300 * dt; f.y += dy / d * 300 * dt; }
      }
    }
  }
  stepParticles(dt);
  // prune dead bots so long sessions don't accumulate corpses
  if (worms.length > BOT_COUNT + 6) worms = worms.filter(w => w.alive || w.isPlayer);
}

// ============================================================
//  Game flow & HUD
// ============================================================
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 2100);
}
function startGame() {
  audio(); sfx.click();
  playerName = (nameInput.value || 'Player').trim().slice(0, 12) || 'Player';
  localStorage.setItem(STORE.name, playerName);
  initWorld(true);
  reviveUsed = false; elapsed = 0; prevRank = 99;
  state = 'playing';
  menuEl.classList.add('hidden'); overEl.classList.add('hidden'); pauseEl.classList.add('hidden');
  hudEl.classList.remove('hidden'); boostBtn.classList.remove('hidden');
  cam.x = player.x; cam.y = player.y;
  updateHud();
}
function gameOver(killer) {
  state = 'over';
  if (Math.floor(player.score) > best) { best = Math.floor(player.score); localStorage.setItem(STORE.best, String(best)); }
  sfx.die();
  el('stScore').textContent = Math.floor(player.score);
  el('stLen').textContent = Math.floor(player.len);
  el('stKills').textContent = player.kills;
  el('stTime').textContent = fmtTime(elapsed);
  el('finalBest').textContent = '🏆 Best: ' + best;
  el('killedBy').textContent = killer ? ('💀 Squished by ' + killer.name) : '💀 You hit the arena border';
  el('btnRevive').classList.toggle('hidden', reviveUsed);
  overEl.classList.remove('hidden');
  hudEl.classList.add('hidden'); boostBtn.classList.add('hidden');
}
function revivePlayer() {
  if (reviveUsed || state !== 'over' || !player) return;
  reviveUsed = true; sfx.click();
  const keepScore = Math.floor(player.score * 0.6);
  const name = player.name, sk = player.skinIdx, kills = player.kills;
  const idx = worms.indexOf(player);
  player = makeWorm(name, sk, true, keepScore);
  player.kills = kills;
  player.protectUntil = performance.now() + 3500;
  if (idx >= 0) worms[idx] = player; else worms.push(player);
  state = 'playing';
  overEl.classList.add('hidden');
  hudEl.classList.remove('hidden'); boostBtn.classList.remove('hidden');
  cam.x = player.x; cam.y = player.y;
  toast('❤️ Second chance — good luck!');
}
function pauseGame() { if (state !== 'playing') return; state = 'paused'; pauseEl.classList.remove('hidden'); }
function resumeGame() { if (state !== 'paused') return; state = 'playing'; pauseEl.classList.add('hidden'); sfx.click(); }
function quitToMenu() {
  sfx.click();
  state = 'menu';
  pauseEl.classList.add('hidden'); overEl.classList.add('hidden');
  hudEl.classList.add('hidden'); boostBtn.classList.add('hidden');
  el('menuBest').textContent = '🏆 Best: ' + best;
  initWorld(false);
  menuEl.classList.remove('hidden');
}
function updateHud() {
  if (!player) return;
  coinPill.textContent = '🪙 ' + Math.floor(player.score);
  lenPill.textContent = '📏 ' + Math.floor(player.len);
  timePill.textContent = '⏱ ' + fmtTime(elapsed);
  const now = performance.now();
  let fx = '';
  if (player.magnetT > now) fx += '<div class="fxChip">🧲 ' + Math.ceil((player.magnetT - now) / 1000) + 's</div>';
  if (player.doubleT > now) fx += '<div class="fxChip">⭐ 2x ' + Math.ceil((player.doubleT - now) / 1000) + 's</div>';
  fxBox.innerHTML = fx;
  const sorted = worms.filter(w => w.alive).sort((a, b) => b.score - a.score);
  let html = '';
  sorted.slice(0, 8).forEach((w, i) => {
    html += '<li class="' + (w.isPlayer ? 'me' : '') + '"><b>' + (i + 1) + '. ' + esc(w.name) + '</b><span>' + Math.floor(w.score) + '</span></li>';
  });
  const rank = sorted.indexOf(player);
  if (rank >= 8 && player.alive) {
    html += '<li class="me"><b>' + (rank + 1) + '. ' + esc(player.name) + '</b><span>' + Math.floor(player.score) + '</span></li>';
  }
  boardList.innerHTML = html;
  if (player.alive && rank >= 0) {
    if (rank < 3 && prevRank >= 3) toast(rank === 0 ? '👑 You are #1!' : '🏆 You are #' + (rank + 1) + '!');
    prevRank = rank;
  }
}

// ============================================================
//  Input
// ============================================================
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  if (e.key === 'Enter' && state === 'menu') startGame();
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (state === 'playing') pauseGame(); else if (state === 'paused') resumeGame(); }
});
window.addEventListener('keyup', e => { keys[e.key] = false; });
function keyboardSteer() {
  if (!player || state !== 'playing') return;
  let dx = 0, dy = 0;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
  if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
  if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
  if (dx || dy) player.targetAngle = Math.atan2(dy, dx);
}
window.addEventListener('mousemove', e => {
  if (state !== 'playing' || !player || joyId !== null) return;
  const dx = e.clientX - W / 2, dy = e.clientY - H / 2;
  if (Math.hypot(dx, dy) > 14) player.targetAngle = Math.atan2(dy, dx);
});
// virtual joystick (left side of the screen)
let joyId = null, joyCX = 0, joyCY = 0;
window.addEventListener('touchstart', e => {
  for (const t of e.changedTouches) {
    if (t.target.closest('button') || t.target.closest('.overlay') || t.target.closest('input')) continue;
    if (state === 'playing' && joyId === null && t.clientX < W * 0.55) {
      joyId = t.identifier; joyCX = t.clientX; joyCY = t.clientY;
      joyBase.style.left = joyCX + 'px'; joyBase.style.top = joyCY + 'px';
      joyKnob.style.transform = 'translate(-50%,-50%)';
      joyBase.classList.remove('hidden');
    }
  }
}, { passive: true });
window.addEventListener('touchmove', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === joyId && player) {
      let dx = t.clientX - joyCX, dy = t.clientY - joyCY;
      const d = Math.hypot(dx, dy), max = 46;
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      joyKnob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
      if (d > 10) player.targetAngle = Math.atan2(t.clientY - joyCY, t.clientX - joyCX);
    }
  }
}, { passive: true });
function joyEnd(e) {
  for (const t of e.changedTouches) if (t.identifier === joyId) { joyId = null; joyBase.classList.add('hidden'); }
}
window.addEventListener('touchend', joyEnd);
window.addEventListener('touchcancel', joyEnd);
// boost button
function boostOn(e) { e.preventDefault(); boostHeld = true; boostBtn.classList.add('on'); }
function boostOff() { boostHeld = false; boostBtn.classList.remove('on'); }
boostBtn.addEventListener('touchstart', boostOn, { passive: false });
boostBtn.addEventListener('touchend', boostOff);
boostBtn.addEventListener('mousedown', boostOn);
window.addEventListener('mouseup', boostOff);
// buttons & menu wiring
el('btnPlay').addEventListener('click', startGame);
el('btnAgain').addEventListener('click', startGame);
el('btnRevive').addEventListener('click', revivePlayer);
el('btnResume').addEventListener('click', resumeGame);
el('btnRestart').addEventListener('click', startGame);
el('btnQuit').addEventListener('click', quitToMenu);
el('btnMenu2').addEventListener('click', quitToMenu);
el('btnPause').addEventListener('click', () => { sfx.click(); pauseGame(); });
el('btnHow').addEventListener('click', () => { sfx.click(); el('howCard').classList.toggle('hidden'); });
const btnMute = el('btnMute');
function paintMute() { btnMute.textContent = muted ? '🔇' : '🔊'; }
btnMute.addEventListener('click', () => {
  muted = !muted;
  localStorage.setItem(STORE.mute, muted ? '1' : '0');
  paintMute();
  if (!muted) sfx.click();
});
paintMute();
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
window.addEventListener('contextmenu', e => { if (e.target === canvas) e.preventDefault(); });
function buildSkins() {
  skinsEl.innerHTML = '';
  SKINS.forEach((sk, i) => {
    const b = document.createElement('button');
    b.className = 'skinChip' + (i === playerSkin ? ' sel' : '');
    b.setAttribute('aria-label', sk.name);
    b.innerHTML = '<span class="dots">' + sk.colors.slice(0, 3).map(c => '<i style="background:' + c + '"></i>').join('') + '</span>';
    b.addEventListener('click', () => { playerSkin = i; localStorage.setItem(STORE.skin, String(i)); sfx.click(); buildSkins(); });
    skinsEl.appendChild(b);
  });
}
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);

// ============================================================
//  Rendering
// ============================================================
function drawWorm(w, now) {
  const r = wormRadius(w);
  const pts = w.points;
  const blink = now < w.protectUntil && Math.floor(now / 140) % 2 === 0;
  ctx.save();
  if (blink) ctx.globalAlpha = 0.45;
  const stepPts = r > 20 ? 2 : 1;
  for (let i = pts.length - 1; i >= 1; i -= stepPts) {
    const p = pts[i];
    if (p.x < viewRect.x0 || p.x > viewRect.x1 || p.y < viewRect.y0 || p.y > viewRect.y1) continue;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = w.skin.colors[Math.floor(i / 3) % w.skin.colors.length]; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.13)'; ctx.lineWidth = 1.6; ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let i = pts.length - 1; i >= 1; i -= 6) {
    const p = pts[i];
    if (p.x < viewRect.x0 || p.x > viewRect.x1 || p.y < viewRect.y0 || p.y > viewRect.y1) continue;
    ctx.beginPath(); ctx.arc(p.x - r * 0.32, p.y - r * 0.34, r * 0.52, 0, Math.PI * 2); ctx.fill();
  }
  // head
  const hx = w.x, hy = w.y;
  ctx.beginPath(); ctx.arc(hx, hy, r * 1.06, 0, Math.PI * 2);
  ctx.fillStyle = w.skin.colors[0]; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.6; ctx.stroke();
  const ca = Math.cos(w.angle), sa = Math.sin(w.angle);
  const px = -sa, py = ca;
  if (w.boost) { // little red tongue while boosting
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = Math.max(r * 0.14, 1.5); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx + ca * r * 0.95, hy + sa * r * 0.95);
    ctx.lineTo(hx + ca * r * 1.55, hy + sa * r * 1.55);
    ctx.stroke();
  }
  for (const sgn of [-1, 1]) { // big cartoon eyes
    const ex = hx + ca * r * 0.30 + px * sgn * r * 0.44;
    const ey = hy + sa * r * 0.30 + py * sgn * r * 0.44;
    ctx.beginPath(); ctx.arc(ex, ey, r * 0.34, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + ca * r * 0.12, ey + sa * r * 0.12, r * 0.17, 0, Math.PI * 2); ctx.fillStyle = '#1f2937'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + ca * r * 0.12 - r * 0.05, ey + sa * r * 0.12 - r * 0.06, r * 0.055, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  }
  ctx.beginPath(); // smile
  ctx.arc(hx + ca * r * 0.40, hy + sa * r * 0.40, r * 0.36, w.angle + 0.55, w.angle + Math.PI - 0.55);
  ctx.strokeStyle = 'rgba(20,40,20,0.55)'; ctx.lineWidth = Math.max(r * 0.09, 1.2); ctx.stroke();
  ctx.restore();
}
function render(now) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2a1a5e'); g.addColorStop(0.6, '#1e1b4b'); g.addColorStop(1, '#150f33');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  let focus = null;
  if (player && player.alive) focus = player;
  else { let bs = -1; for (const w of worms) if (w.alive && w.score > bs) { bs = w.score; focus = w; } }
  if (focus) {
    cam.x = lerp(cam.x, focus.x, 0.08);
    cam.y = lerp(cam.y, focus.y, 0.08);
    const zf = clamp(30 / (wormRadius(focus) + 16), 0.55, 1.12);
    cam.scale = lerp(cam.scale, (Math.min(W, H) / 720) * zf, 0.05);
  }
  const s = cam.scale;
  const vw = W / s, vh = H / s;
  viewRect = { x0: cam.x - vw / 2 - 70, y0: cam.y - vh / 2 - 70, x1: cam.x + vw / 2 + 70, y1: cam.y + vh / 2 + 70 };
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-cam.x, -cam.y);
  // dotted playfield pattern
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  const step = 110;
  for (let gx = Math.floor(viewRect.x0 / step) * step; gx < viewRect.x1; gx += step) {
    for (let gy = Math.floor(viewRect.y0 / step) * step; gy < viewRect.y1; gy += step) {
      ctx.beginPath(); ctx.arc(gx, gy, 5, 0, Math.PI * 2); ctx.fill();
    }
  }
  // dark danger zone outside the arena + glowing red border
  ctx.beginPath();
  ctx.rect(viewRect.x0, viewRect.y0, viewRect.x1 - viewRect.x0, viewRect.y1 - viewRect.y0);
  ctx.arc(0, 0, WORLD_R, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(90,0,25,0.38)'; ctx.fill('evenodd');
  ctx.beginPath(); ctx.arc(0, 0, WORLD_R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(239,68,68,0.35)'; ctx.lineWidth = 36; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, WORLD_R, 0, Math.PI * 2);
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 13; ctx.stroke();
  // sweets & orbs
  for (const f of foods) {
    if (f.x < viewRect.x0 || f.x > viewRect.x1 || f.y < viewRect.y0 || f.y > viewRect.y1) continue;
    const bob = Math.sin(now / 280 + f.ph) * 1.4;
    const sz = f.kind === 'orb' ? 30 : 42;
    ctx.drawImage(f.spr, f.x - sz / 2, f.y - sz / 2 + bob, sz, sz);
  }
  // power-up pickups
  for (const p of pickups) {
    if (p.x < viewRect.x0 || p.x > viewRect.x1 || p.y < viewRect.y0 || p.y > viewRect.y1) continue;
    const pulse = 1 + Math.sin(now / 200) * 0.12;
    ctx.beginPath(); ctx.arc(p.x, p.y, 31 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,215,0,0.75)'; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.drawImage(p.spr, p.x - 30, p.y - 30, 60, 60);
  }
  // worms (player on top)
  for (const w of worms) if (w.alive && !w.isPlayer) drawWorm(w, now);
  if (player && player.alive) drawWorm(player, now);
  // particles
  for (const p of particles) {
    ctx.globalAlpha = Math.max(1 - p.life / p.max, 0);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color; ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(5,0,20,0.42)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ============================================================
//  Main loop & go
// ============================================================
let lastFrame = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  if (state === 'playing' || state === 'menu' || state === 'over') {
    if (state === 'playing') { keyboardSteer(); elapsed += dt; }
    simulate(dt, now);
    if (state === 'playing') {
      boardTimer -= dt;
      if (boardTimer <= 0) { boardTimer = 0.2; updateHud(); }
    }
  }
  render(now);
}
foodSprites = FOOD_TYPES.map(makeFoodSprite);
PICKUP_TYPES.forEach(t => { t.spr = makePickupSprite(t.e); });
buildSkins();
nameInput.value = playerName;
el('menuBest').textContent = '🏆 Best: ' + best;
initWorld(false);
resize();
requestAnimationFrame(loop);
