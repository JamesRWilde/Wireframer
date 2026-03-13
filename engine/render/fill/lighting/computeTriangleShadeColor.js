import { lerpColor } from '../../../../ui/color-utils/lerpColor.js';

export function computeTriangleShadeColor(normal, useSmoothShading) {
  // Use world-space light direction for fixed light source
  const LIGHT_DIR = globalThis.LIGHT_DIR || [0.5, 0.8, 0.6];
  const VIEW_DIR = globalThis.VIEW_DIR ?? [0, 0, -1];
  const THEME = globalThis.THEME ?? { shadeDark: '#000000', shadeBright: '#ffffff' };

  let nx = normal[0];
  let ny = normal[1];
  let nz = normal[2];
  
  // Transform normal from camera/physics space to world space using inverse rotation
  // This ensures the light appears fixed in world space while the object rotates
  const R_INV = globalThis.R_INV;
  if (R_INV) {
    const worldNx = R_INV[0]*nx + R_INV[1]*ny + R_INV[2]*nz;
    const worldNy = R_INV[3]*nx + R_INV[4]*ny + R_INV[5]*nz;
    const worldNz = R_INV[6]*nx + R_INV[7]*ny + R_INV[8]*nz;
    nx = worldNx;
    ny = worldNy;
    nz = worldNz;
  }
  
  // Only the true front face receives light; no normal flipping for realism
  
  const ndotlRaw = nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2];
  const ndotl = Math.max(0, ndotlRaw);
  
  // Blinn-Phong specular with half vector
  const hx = LIGHT_DIR[0] + VIEW_DIR[0];
  const hy = LIGHT_DIR[1] + VIEW_DIR[1];
  const hz = LIGHT_DIR[2] + VIEW_DIR[2];
  const hl = Math.hypot(hx, hy, hz);
  const hnx = hx / hl;
  const hny = hy / hl;
  const hnz = hz / hl;
  const nhRaw = nx * hnx + ny * hny + nz * hnz;
  const nh = Math.max(0, nhRaw);
  const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

  // Balanced lighting: moderate ambient, strong diffuse, subtle specular
  const ambient = 0.26;
  const diffuse = 0.72 * ndotl;
  const specular = useSmoothShading ? 0.18 * spec : 0.30 * spec;
  const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));
  return lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
}
