export function resolveTriangleNormal(item, T, triCornerNormals, useSmoothShading) {
  // Engine-owned mesh only
  const [a, b, c] = item.tri;
  const v0 = T[a];
  const v1 = T[b];
  const v2 = T[c];

  const ux = v1[0] - v0[0];
  const uy = v1[1] - v0[1];
  const uz = v1[2] - v0[2];
  const vx = v2[0] - v0[0];
  const vy = v2[1] - v0[1];
  const vz = v2[2] - v0[2];

  let nx, ny, nz;
  if (useSmoothShading) {
    // normals are already provided in camera space by precomputing them from
    // the transformed vertices in drawSolidFillModel.  Just sum the corner
    // normals passed in.
    const cn = triCornerNormals[item.triIndex];
    const na = cn[0], nb = cn[1], nc = cn[2];
    nx = na[0] + nb[0] + nc[0];
    ny = na[1] + nb[1] + nc[1];
    nz = na[2] + nb[2] + nc[2];
  } else {
    nx = uy * vz - uz * vy;
    ny = uz * vx - ux * vz;
    nz = ux * vy - uy * vx;
  }
  const nl = Math.hypot(nx, ny, nz);
  if (nl < 1e-6) return null;
  return [nx / nl, ny / nl, nz / nl];
}
