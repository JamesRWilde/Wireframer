export function renderEngineCreateParticle(w, h, velocityScale = 1) {
  const speed = 0.2 + Math.random() * 0.8;
  const angle = (Math.random() - 0.5) * Math.PI * 2;
  const vx = Math.cos(angle) * speed * velocityScale;
  const vy = Math.sin(angle) * speed * velocityScale;
  
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx,
    vy,
    size: 0.5 + Math.random() * 1.6,
    alphaBase: 0.2 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    speed,
    alpha: 0,
  };
}
