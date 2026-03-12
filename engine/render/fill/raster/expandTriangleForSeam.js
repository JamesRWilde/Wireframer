export function expandTriangleForSeam(tri2d, seamExpandPx) {
  const ax = tri2d[0][0];
  const ay = tri2d[0][1];
  const bx = tri2d[1][0];
  const by = tri2d[1][1];
  const cx = tri2d[2][0];
  const cy = tri2d[2][1];

  if (!(seamExpandPx > 0)) {
    return [[ax, ay], [bx, by], [cx, cy]];
  }

  const mx = (ax + bx + cx) / 3;
  const my = (ay + by + cy) / 3;

  function expandPoint(px, py) {
    let dx = px - mx;
    let dy = py - my;
    const dl = Math.hypot(dx, dy);
    if (dl <= 1e-6) return [px, py];
    dx /= dl;
    dy /= dl;
    return [px + dx * seamExpandPx, py + dy * seamExpandPx];
  }

  return [expandPoint(ax, ay), expandPoint(bx, by), expandPoint(cx, cy)];
}
