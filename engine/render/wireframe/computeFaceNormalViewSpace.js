export function computeFaceNormalViewSpace(T, a, b, c, cx, cy, cz) {
  const ax = T[a][0], ay = T[a][1], az = T[a][2];
  const bx = T[b][0], by = T[b][1], bz = T[b][2];
  const ccx = T[c][0], ccy = T[c][1], ccz = T[c][2];

  const ux = bx - ax, uy = by - ay, uz = bz - az;
  const vx = ccx - ax, vy = ccy - ay, vz = ccz - az;

  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;

  const nl = Math.hypot(nx, ny, nz);
  if (nl < 1e-9) return null;
  nx /= nl; ny /= nl; nz /= nl;

  const faceCenterX = (ax + bx + ccx) / 3;
  const faceCenterY = (ay + by + ccy) / 3;
  const faceCenterZ = (az + bz + ccz) / 3;
  const toCenterX = cx - faceCenterX;
  const toCenterY = cy - faceCenterY;
  const toCenterZ = cz - faceCenterZ;
  const dot = nx * toCenterX + ny * toCenterY + nz * toCenterZ;
  if (dot > 0) {
    nx = -nx; ny = -ny; nz = -nz;
  }

  return [nx, ny, nz];
}
