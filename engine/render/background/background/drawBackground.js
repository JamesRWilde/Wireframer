import { getBackgroundCanvas } from './getBackgroundCanvas.js';
import { getBackgroundColors } from './getBackgroundColors.js';
import { seedParticlesIfNeeded } from './seedParticles.js';
import { updateParticles } from './updateParticles.js';
import { drawParticles } from './drawParticles.js';

let particles = [];

export function drawBackground(nowMs) {

  const canvasState = getBackgroundCanvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  const { bgColor, particleColor } = getBackgroundColors();

  const { velScale, opacityScale, themeAlphaBoost } = seedParticlesIfNeeded(particles, w, h);
  const now = nowMs ?? performance.now();

  updateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost);

  // draw background base colour
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = globalThis.THEME_MODE === 'light' ? 'multiply' : 'screen';

  drawParticles(ctx, particles, particleColor, opacityScale, themeAlphaBoost);

  ctx.restore();

  if (particles.length === 0) console.debug('[drawBackground] no particles to draw');
  return true;
}
