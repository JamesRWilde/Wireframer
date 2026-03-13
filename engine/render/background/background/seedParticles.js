const MAX_DENSITY_MULT = 1.6;   // bumped further for slightly more crowded field
const MAX_VELOCITY_MULT = 1;  // multiplier for particle velocity

let lastSize = { w: 0, h: 0 };
let lastDensity = 1;

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

export function seedParticlesIfNeeded(particles, w, h) {
  const baseCount = Math.max(8, Math.round((w * h) / 45000));
  const densityPct = globalThis.BG_PARTICLE_DENSITY_PCT ?? 1;
  const density = densityPct * MAX_DENSITY_MULT;
  const velocityPct = globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1;
  const velocityScale = velocityPct * MAX_VELOCITY_MULT;

  const mustReseed = density !== lastDensity;
  const sizeChanged = lastSize.w !== w || lastSize.h !== h;
  if (mustReseed || !particles.length || sizeChanged) {
    particles.length = 0;
    const count = Math.max(0, Math.round(baseCount * density));
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(w, h, velocityScale));
    }
    lastSize = { w, h };
    lastDensity = density;
  }

  const velScale = velocityPct * MAX_VELOCITY_MULT;
  const opacityScale = (globalThis.BG_PARTICLE_OPACITY_PCT ?? 1) * 1;
  const themeAlphaBoost = globalThis.THEME_MODE === 'light' ? 1.75 : 1;

  return { velScale, opacityScale, themeAlphaBoost };
}
