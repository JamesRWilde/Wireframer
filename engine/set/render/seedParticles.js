import { createParticle } from '../init/createParticle.js';

const MAX_DENSITY_MULT = 1.6;
const MAX_VELOCITY_MULT = 1;

let lastSize = { w: 0, h: 0 };
let lastDensity = 1;

export function seedParticles(particles, w, h) {
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
      particles.push(InitRenderEngineCreateParticle(w, h, velocityScale));
    }
    lastSize = { w, h };
    lastDensity = density;
  }

  const velScale = velocityPct * MAX_VELOCITY_MULT;
  const opacityScale = (globalThis.BG_PARTICLE_OPACITY_PCT ?? 1) * 1;
  const themeAlphaBoost = globalThis.THEME_MODE === 'light' ? 1.75 : 1;

  return { velScale, opacityScale, themeAlphaBoost };
}
