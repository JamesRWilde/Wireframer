export function drawParticles(ctx, particles, color, opacityScale, themeAlphaBoost) {
  const baseColor = color;

  for (const p of particles) {
    ctx.beginPath();

    if (globalThis.DEBUG_PARTICLES) {
      ctx.fillStyle = 'rgba(255,0,0,0.8)';
      ctx.globalAlpha = 1;
      ctx.fillRect(p.x, p.y, 6, 6);
      continue;
    }

    const alpha = Math.max(0, Math.min(1, p.alpha * opacityScale * themeAlphaBoost));
    let fillColor = typeof baseColor === 'string' ? baseColor.replace(/rgba?\(/, 'rgba(') : baseColor;

    if (typeof baseColor === 'string' && baseColor.startsWith('#')) {
      const r = Number.parseInt(baseColor.slice(1, 3), 16);
      const g = Number.parseInt(baseColor.slice(3, 5), 16);
      const b = Number.parseInt(baseColor.slice(5, 7), 16);
      fillColor = `rgba(${r},${g},${b},${alpha})`;
    }

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = alpha;

    const radius = p.size * 0.5;
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = radius * 2;
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
