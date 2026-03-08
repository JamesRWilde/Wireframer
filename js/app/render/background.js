'use strict';

function drawBackground(nowMs) {
  const t = nowMs * 0.001;

  // Keep the scene floor neutral black so only particles/geometry carry color.
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, W, H);

  // Particle-based ambient motion is less prone to HDR gradient banding.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const p of BG_PARTICLES) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -2) p.x = W + 2;
    else if (p.x > W + 2) p.x = -2;

    if (p.y < -2) p.y = H + 2;
    else if (p.y > H + 2) p.y = -2;

    const pulse = 0.5 + 0.5 * Math.sin(t * p.speed + p.phase);
    const alpha = p.alphaBase + pulse * 0.14;

    // Small soft dots read better than 1px squares, especially on HDR/high-density panels.
    ctx.beginPath();
    ctx.fillStyle = rgbA(THEME.particle, alpha);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
