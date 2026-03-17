import {canvas}from '@engine/get/render/background/canvas.js';
import {colors}from '@engine/get/render/background/colors.js';
import { seedParticles }from '@engine/set/render/seedParticles.js';
import { workersUpdateParticles }from '@workers/workersUpdateParticles.js';
import {particles}from '@engine/set/render/draw/particles.js';
import { backgroundWorker }from '@engine/init/render/backgroundWorker.js';
import { isBackgroundWorkerReady }from '@engine/get/render/isBackgroundWorkerReady.js';
import { pendingWorkerParticles }from '@engine/get/render/pendingWorkerParticles.js';
import { postToBackgroundWorker }from '@engine/set/render/postToBackgroundWorker.js';

let particles = [];
let workerInitialized = false;

export function background(nowMs) {
  const canvasState = getBackgroundCanvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = getBackgroundColors();

  if (!workerInitialized) {
    backgroundWorker();
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
    
    const pending = pendingWorkerParticles();
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

  const { velScale, opacityScale, themeAlphaBoost } = seedParticles(particles, w, h);
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
