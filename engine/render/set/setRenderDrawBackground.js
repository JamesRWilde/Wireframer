import { getBackgroundCanvas } from '../get/getRenderBackgroundCanvas.js';
import { getBackgroundColors } from '../get/getRenderBackgroundColors.js';
import { setRenderSeedParticles } from './setRenderSeedParticles.js';
import { updateParticles } from '../../../workers/set/updateParticles.js';
import { drawParticles } from './setRenderDrawParticles.js';
import { initRenderBackgroundWorker } from '../init/initRenderBackgroundWorker.js';
import { getRenderIsBackgroundWorkerReady } from '../get/getRenderIsBackgroundWorkerReady.js';
import { getRenderPendingWorkerParticles } from '../get/getRenderPendingWorkerParticles.js';
import { setRenderPostToBackgroundWorker } from './setRenderPostToBackgroundWorker.js';

let particles = [];
let workerInitialized = false;

export function setRenderDrawBackground(nowMs) {
  const canvasState = getBackgroundCanvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = getBackgroundColors();

  if (!workerInitialized) {
    initRenderBackgroundWorker();
    workerInitialized = true;
  }

  if (getRenderIsBackgroundWorkerReady()) {
    const density = globalThis.BG_PARTICLE_DENSITY_PCT ?? 1;
    const speed = globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1;
    const opacity = globalThis.BG_PARTICLE_OPACITY_PCT ?? 1;
    
    setRenderPostToBackgroundWorker({ 
      type: 'update', 
      timestamp: nowMs ?? performance.now(),
      density, speed, opacity,
      themeMode: globalThis.THEME_MODE ?? 'dark'
    });
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    
    const pending = getRenderPendingWorkerParticles();
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

  const { velScale, opacityScale, themeAlphaBoost } = setRenderSeedParticles(particles, w, h);
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
