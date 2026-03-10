'use strict';

let BG_RENDERER = null;
let BG_RENDERER_FAILED = false;
let BG_GPU_LAST_RENDER_MS = -1;
const BG_GPU_MAX_FPS = 60;
const BG_GPU_MIN_INTERVAL_MS = 1000 / BG_GPU_MAX_FPS;

function getBackgroundRenderer() {
  if (BG_RENDERER || BG_RENDERER_FAILED) return BG_RENDERER;
  if (!bgCanvas || typeof createGpuBackgroundRenderer !== 'function') {
    BG_RENDERER_FAILED = true;
    return null;
  }

  BG_RENDERER = createGpuBackgroundRenderer(bgCanvas);
  if (!BG_RENDERER) BG_RENDERER_FAILED = true;
  return BG_RENDERER;
}

function fallbackTo2dBackgroundRenderer(err) {
  if (BG_RENDERER && typeof BG_RENDERER.dispose === 'function') {
    try {
      BG_RENDERER.dispose();
    } catch {
      // Ignore cleanup failures.
    }
  }
  BG_RENDERER = null;
  BG_RENDERER_FAILED = true;
  BG_GPU_LAST_RENDER_MS = -1;
  console.warn('Wireframer: GPU background disabled, falling back to 2D.', err);
}

function drawBackground(nowMs) {
    if (!ctx) {
      console.error('[drawBackground] Canvas context (ctx) is null. Background will not render.');
      return false;
    }
  const t = nowMs * 0.001;

  BG_PARTICLE_DENSITY += (BG_PARTICLE_DENSITY_TARGET - BG_PARTICLE_DENSITY) * 0.08;
  BG_PARTICLE_VELOCITY += (BG_PARTICLE_VELOCITY_TARGET - BG_PARTICLE_VELOCITY) * 0.12;
  BG_PARTICLE_OPACITY += (BG_PARTICLE_OPACITY_TARGET - BG_PARTICLE_OPACITY) * 0.12;
  reconcileBackgroundParticles();

  const velocityScale = Math.max(0, BG_PARTICLE_VELOCITY);
  const opacityScale = Math.max(0, Math.min(1.8, BG_PARTICLE_OPACITY));
  const themeAlphaBoost = THEME_MODE === 'light' ? 1.75 : 1;
  const bg = THEME && THEME.bg ? THEME.bg : [0, 0, 0];
  const particleColor = THEME && THEME.particle ? THEME.particle : [100, 180, 220];
  const renderer = getBackgroundRenderer();

  if (renderer && renderer.mode === 'gpu') {
    try {
      if (BG_GPU_LAST_RENDER_MS < 0 || nowMs - BG_GPU_LAST_RENDER_MS >= BG_GPU_MIN_INTERVAL_MS) {
        renderer.render({
          width: W,
          height: H,
          particles: BG_PARTICLES,
          bg,
          color: particleColor,
          lightMode: THEME_MODE === 'light',
          timeSec: t,
          velocityScale,
          opacityScale: opacityScale * themeAlphaBoost,
        });
        BG_GPU_LAST_RENDER_MS = nowMs;
      }
      // Background rendered on its own canvas layer.
      return true;
    } catch (err) {
      fallbackTo2dBackgroundRenderer(err);
    }
  }

  for (const p of BG_PARTICLES) {
    p.x += p.vx * velocityScale;
    p.y += p.vy * velocityScale;

    if (p.x < -2) p.x = W + 2;
    else if (p.x > W + 2) p.x = -2;

    if (p.y < -2) p.y = H + 2;
    else if (p.y > H + 2) p.y = -2;

    const pulse = 0.5 + 0.5 * Math.sin(t * p.speed + p.phase);
    p.alpha = (p.alphaBase + pulse * 0.14) * opacityScale * themeAlphaBoost;
  }

  ctx.fillStyle = toRgbCss(bg);
  ctx.fillRect(0, 0, W, H);

  // Particle-based ambient motion is less prone to HDR gradient banding.
  ctx.save();
  ctx.globalCompositeOperation = THEME_MODE === 'light' ? 'multiply' : 'screen';
  for (const p of BG_PARTICLES) {
    if (!p.alpha || p.alpha < 0.0005) continue;
    ctx.beginPath();
    ctx.fillStyle = rgbA(particleColor, p.alpha);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Background rendered directly into the main 2D canvas.
  return false;
}
