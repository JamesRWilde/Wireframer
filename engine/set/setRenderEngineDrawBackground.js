import { getBackgroundCanvas } from '../get/getRenderEngineBackgroundCanvas.js';
import { getBackgroundColors } from '../get/getRenderEngineBackgroundColors.js';
import { setRenderEngineSeedParticles } from './setRenderEngineSeedParticles.js';
import { setWorkersUpdateParticles } from '../../workers/setWorkersUpdateParticles.js';
import { drawParticles } from './setRenderEngineDrawParticles.js';
import { initRenderEngineBackgroundWorker } from '../init/initRenderEngineBackgroundWorker.js';
import { getRenderEngineIsBackgroundWorkerReady } from '../get/getRenderEngineIsBackgroundWorkerReady.js';
import { getRenderEnginePendingWorkerParticles } from '../get/getRenderEnginePendingWorkerParticles.js';
import { setRenderEnginePostToBackgroundWorker } from './setRenderEnginePostToBackgroundWorker.js';

let particles = [];
let workerInitialized = false;

export function setRenderEngineDrawBackground(nowMs) {
  const canvasState = getBackgroundCanvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = getBackgroundColors();

  if (!workerInitialized) {
    InitRenderEngineBackgroundWorker();
    workerInitialized = true;
  }

  if (GetRenderEngineIsBackgroundWorkerReady()) {
    const density = globalThis.BG_PARTICLE_DENSITY_PCT ?? 1;
    const speed = globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1;
    const opacity = globalThis.BG_PARTICLE_OPACITY_PCT ?? 1;
    
    SetRenderEnginePostToBackgroundWorker({ 
      type: 'update', 
      timestamp: nowMs ?? performance.now(),
      density, speed, opacity,
      themeMode: globalThis.THEME_MODE ?? 'dark'
    });
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    
    const pending = GetRenderEnginePendingWorkerParticles();
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

  const { velScale, opacityScale, themeAlphaBoost } = SetRenderEngineSeedParticles(particles, w, h);
  const now = nowMs ?? performance.now();

  SetWorkersUpdateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = globalThis.THEME_MODE === 'light' ? 'multiply' : 'screen';
  drawParticles(ctx, particles, particleColor, opacityScale, themeAlphaBoost);
  ctx.restore();

  if (particles.length === 0) console.debug('[drawBackground] no particles to draw');
  
  return true;
}
