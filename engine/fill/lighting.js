'use strict';

function resolveTriangleNormal(item, T, triCornerNormals, useSmoothShading) {
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

  let nx;
  let ny;
  let nz;

  if (useSmoothShading) {
    const cn = triCornerNormals[item.triIndex];
    const na = cn[0];
    const nb = cn[1];
    const nc = cn[2];
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

function computeTriangleShadeColor(normal, useSmoothShading) {
  const nx = normal[0];
  const ny = normal[1];
  const nz = normal[2];

  const ndotlRaw = nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2];
  const ndotl = Math.max(0, useSmoothShading ? ndotlRaw : Math.abs(ndotlRaw));

  const hx = LIGHT_DIR[0] + VIEW_DIR[0];
  const hy = LIGHT_DIR[1] + VIEW_DIR[1];
  const hz = LIGHT_DIR[2] + VIEW_DIR[2];
  const hl = Math.hypot(hx, hy, hz);
  const hnx = hx / hl;
  const hny = hy / hl;
  const hnz = hz / hl;
  const nhRaw = nx * hnx + ny * hny + nz * hnz;
  const nh = Math.max(0, useSmoothShading ? nhRaw : Math.abs(nhRaw));
  const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

  const ambient = 0.26;
  const diffuse = 0.72 * ndotl;
  const specular = useSmoothShading ? 0.18 * spec : 0.30 * spec;
  const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));
  return lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
}
