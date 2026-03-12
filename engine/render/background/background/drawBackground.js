import { bgState } from '../backgroundState.js';

let particles = [];
let lastTime = 0;
let lastSize = { w: 0, h: 0 };
// configuration: maximum multipliers applied when slider at 100%
const MAX_DENSITY_MULT = 1.6;   // bumped further for slightly more crowded field
const MAX_VELOCITY_MULT = 1;  // multiplier for particle velocity
const MAX_OPACITY = 1;       // max alpha
let lastDensity = 1; // track current multiplier for reseeding

function createParticle(w, h, velocityScale = 1) {
  const speed = 0.2 + Math.random() * 0.8;
  const angle = (Math.random() - 0.5) * Math.PI * 2;
  const vx = Math.cos(angle) * speed * velocityScale;
  const vy = Math.sin(angle) * speed * velocityScale;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx,
    vy,
    size: 0.5 + Math.random() * 1.6,
    alphaBase: 0.2 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    speed,
    alpha: 0,
  };
}

let drawCount = 0;
export function drawBackground(nowMs) {
  drawCount++;
  const canvas = bgState.canvas;
  if (!canvas) {
    console.debug('[drawBackground] bgState.canvas is not set');
    return false;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.debug('[drawBackground] failed to get 2D context');
    return false;
  }
  // optional debug: log every second
  if (drawCount % 60 === 0) {
    console.debug('[drawBackground] frame', drawCount);
  }

  const w = canvas.width = canvas.clientWidth || canvas.width;
  const h = canvas.height = canvas.clientHeight || canvas.height;

  // (re)seed particles when canvas grows or initially empty
  // default density base (one per ~45k pixels)
  const baseCount = Math.max(8, Math.round((w * h) / 45000));
  // compute actual multipliers from simple linear percent model
  const densityPct = globalThis.BG_PARTICLE_DENSITY_PCT ?? 1;
  const density = densityPct * MAX_DENSITY_MULT;
  const velocityPct = globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1;
  const velocityScale = velocityPct * MAX_VELOCITY_MULT;
  // re‑seed if effective density changes
  if (density !== lastDensity) {
    particles = [];
    console.debug('[drawBackground] density changed, forcing reseed', { lastDensity, density });
  }
  if (!particles.length || lastSize.w !== w || lastSize.h !== h) {
    particles = [];
    const count = Math.max(0, Math.round(baseCount * density));
    for (let i = 0; i < count; i++) particles.push(createParticle(w, h, velocityScale));
    lastSize.w = w; lastSize.h = h;
    console.debug('[drawBackground] seeded particles', { count: particles.length, density, velocityScale });
  }
  lastDensity = density;

  const now = nowMs || performance.now();
  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
  lastTime = now;

  // update particles each frame
  const velScale = velocityPct * MAX_VELOCITY_MULT;
  const opacityScale = (globalThis.BG_PARTICLE_OPACITY_PCT ?? 1) * MAX_OPACITY;
  const themeAlphaBoost = globalThis.THEME_MODE === 'light' ? 1.75 : 1;
  for (let p of particles) {
    p.x += p.vx * velScale;
    p.y += p.vy * velScale;
    if (p.x < -4) p.x = w + 4;
    else if (p.x > w + 4) p.x = -4;
    if (p.y < -4) p.y = h + 4;
    else if (p.y > h + 4) p.y = -4;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 * p.speed + p.phase);
    p.alpha = (p.alphaBase + pulse * 0.14) * opacityScale * themeAlphaBoost;
  }

  // draw background base colour
  const bg = (globalThis.THEME && globalThis.THEME.bg) ? globalThis.THEME.bg : [0,0,0];
  ctx.fillStyle = `rgba(${bg[0]},${bg[1]},${bg[2]},1)`;
  ctx.fillRect(0,0,w,h);

  ctx.save();
  // composite mode depends on light/dark so dark particles are visible on light
  ctx.globalCompositeOperation = globalThis.THEME_MODE === 'light' ? 'multiply' : 'screen';
  // color driven by theme palette if available, otherwise custom RGB sliders
  let color;
  if (globalThis.THEME && globalThis.THEME.particle) {
    const p = globalThis.THEME.particle;
    color = `rgba(${p[0]},${p[1]},${p[2]},1)`;
  } else {
    const custom = globalThis.CUSTOM_RGB;
    color = (custom && custom.length === 3)
      ? `rgba(${custom[0]},${custom[1]},${custom[2]},1)`
      : 'rgba(200,220,255,1)';
  }
  if (drawCount % 60 === 0) console.debug('[drawBackground] particle color', color);


  for (let p of particles) {
    ctx.beginPath();
    // debug override: still render a visible square for dev
    if (window.DEBUG_PARTICLES) {
      ctx.fillStyle = 'rgba(255,0,0,0.8)';
      ctx.globalAlpha = 1;
      ctx.fillRect(p.x, p.y, 6, 6);
      continue;
    }
    const alpha = Math.max(0, Math.min(1, p.alpha * opacityScale * themeAlphaBoost));
    // prepare fill color with alpha
    let fillColor = typeof color === 'string' ? color.replace(/rgba?\(/, 'rgba(') : color;
    if (typeof color === 'string' && color.startsWith('#')) {
      const r = parseInt(color.slice(1,3),16);
      const g = parseInt(color.slice(3,5),16);
      const b = parseInt(color.slice(5,7),16);
      fillColor = `rgba(${r},${g},${b},${alpha})`;
    }
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = alpha;
    // draw a circle with shadow to soften the edges
    // adjust radius back down to avoid huge blobs
    const radius = p.size * 0.5;
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = radius * 2;
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    // clear shadow so it doesn't bleed to other elements
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  if (particles.length === 0) console.debug('[drawBackground] no particles to draw');

  return true;
}
