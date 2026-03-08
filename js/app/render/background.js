'use strict';

function drawBackground(nowMs) {
  const t = nowMs * 0.001;

  BG_PARTICLE_DENSITY += (BG_PARTICLE_DENSITY_TARGET - BG_PARTICLE_DENSITY) * 0.08;
  BG_PARTICLE_VELOCITY += (BG_PARTICLE_VELOCITY_TARGET - BG_PARTICLE_VELOCITY) * 0.12;
  BG_PARTICLE_OPACITY += (BG_PARTICLE_OPACITY_TARGET - BG_PARTICLE_OPACITY) * 0.12;
  reconcileBackgroundParticles();

  const bg = THEME && THEME.bg ? THEME.bg : [0, 0, 0];
  ctx.fillStyle = toRgbCss(bg);
  ctx.fillRect(0, 0, W, H);

  // Particle-based ambient motion is less prone to HDR gradient banding.
  ctx.save();
  ctx.globalCompositeOperation = THEME_MODE === 'light' ? 'multiply' : 'screen';

  const velocityScale = Math.max(0, BG_PARTICLE_VELOCITY);
  const opacityScale = Math.max(0, Math.min(1.8, BG_PARTICLE_OPACITY));
  const themeAlphaBoost = THEME_MODE === 'light' ? 1.75 : 1;

  for (const p of BG_PARTICLES) {
    p.x += p.vx * velocityScale;
    p.y += p.vy * velocityScale;

    if (p.x < -2) p.x = W + 2;
    else if (p.x > W + 2) p.x = -2;

    if (p.y < -2) p.y = H + 2;
    else if (p.y > H + 2) p.y = -2;

    const pulse = 0.5 + 0.5 * Math.sin(t * p.speed + p.phase);
    const alpha = (p.alphaBase + pulse * 0.14) * opacityScale * themeAlphaBoost;

    // Small soft dots read better than 1px squares, especially on HDR/high-density panels.
    ctx.beginPath();
    ctx.fillStyle = rgbA(THEME.particle, alpha);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
