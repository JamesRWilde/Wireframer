export function workersUpdateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost) {
  for (const p of particles) {
    p.x += p.vx * velScale;
    p.y += p.vy * velScale;

    if (p.x < -4) p.x = w + 4;
    else if (p.x > w + 4) p.x = -4;
    if (p.y < -4) p.y = h + 4;
    else if (p.y > h + 4) p.y = -4;

    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 * p.speed + p.phase);
    p.alpha = (p.alphaBase + pulse * 0.14) * opacityScale * themeAlphaBoost;
  }
}
