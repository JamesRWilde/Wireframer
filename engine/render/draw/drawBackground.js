import { getBackgroundCanvas } from '../get/getBackgroundCanvas.js';
import { getBackgroundColors } from '../get/getBackgroundColors.js';
import { seedParticlesIfNeeded } from '../seedParticles.js';
import { updateParticles } from '../updateParticles.js';
import { drawParticles } from './drawParticles.js';
import { initBackgroundWorker } from '../init/initBackgroundWorker.js';
import { isBackgroundWorkerReady } from '../isBackgroundWorkerReady.js';
import { getPendingWorkerParticles } from '../get/getPendingWorkerParticles.js';
import { postToBackgroundWorker } from '../postToBackgroundWorker.js';

let particles = [];
let workerInitialized = false;

export function drawBackground(nowMs) {
  const canvasState = getBackgroundCanvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = getBackgroundColors();

  if (!workerInitialized) {
    initBackgroundWorker();
    workerInitialized = true;
  }

  if (isBackgroundWorkerReady()) {
    const density = globalThis.BG_PARTICLE_DENSITY_PCT ?? 1;
    const speed = globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1;
    const opacity = globalThis.BG_PARTICLE_OPACITY_PCT ?? 1;
    
    postToBackgroundWorker({ 
      type: 'update', 
      timestamp: nowMs ?? performance.now(),
      density, speed, opacity,
      themeMode: globalThis.THEME_MODE ?? 'dark'
    });
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    
    const pending = getPendingWorkerParticles();
    if (pending) {
      const { data, count } = pending;
      ctx.save();
      ctx.globalCompositeOperation = globalThis.THEME_MODE === 'light' ? 'multiply' : 'screen';
      for (let i = 0; i < count; i++) {
        const idx = i * 4;
        ctx.globalAlpha = data[idx + 3] * opacity;
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(data[idx], data[idx + 1], data[idx + 2], 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    
    return true;
  }

  const { velScale, opacityScale, themeAlphaBoost } = seedParticlesIfNeeded(particles, w, h);
  const now = nowMs ?? performance.now();

  updateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = globalThis.THEME_MODE === 'light' ? 'multiply' : 'screen';
  drawParticles(ctx, particles, particleColor, opacityScale, themeAlphaBoost);
  ctx.restore();

  if (particles.length === 0) console.debug('[drawBackground] no particles to draw');
  
  return true;
}
