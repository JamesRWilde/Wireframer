import { lerpColor } from '../../../../ui/color-utils/lerpColor.js';

// View-space light direction: top-left ceiling light
// In view space: X=-0.5 (left), Y=0.8 (up), Z=0 (no depth bias)
// Normalized: magnitude = sqrt(0.25 + 0.64) = sqrt(0.89) ≈ 0.943
const LIGHT_DIR_VIEW = [-0.532, 0.847, 0];

export function computeTriangleShadeColor(normal, useSmoothShading) {
  const THEME = globalThis.THEME ?? { shadeDark: '#000000', shadeBright: '#ffffff' };

  // Normal is already in view space from resolveTriangleNormal
  const nx = normal[0];
  const ny = normal[1];
  const nz = normal[2];
  
  const ndotl = Math.max(0, nx * LIGHT_DIR_VIEW[0] + ny * LIGHT_DIR_VIEW[1] + nz * LIGHT_DIR_VIEW[2]);
  
  // Blinn-Phong specular with half vector (view dir in view space is [0,0,-1])
  const VIEW_DIR = [0, 0, -1];
  const hx = LIGHT_DIR_VIEW[0] + VIEW_DIR[0];
  const hy = LIGHT_DIR_VIEW[1] + VIEW_DIR[1];
  const hz = LIGHT_DIR_VIEW[2] + VIEW_DIR[2];
  const hl = Math.hypot(hx, hy, hz);
  const hnx = hx / hl;
  const hny = hy / hl;
  const hnz = hz / hl;
  const nh = Math.max(0, nx * hnx + ny * hny + nz * hnz);
  const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

  // Balanced lighting: moderate ambient, strong diffuse, subtle specular
  const ambient = 0.26;
  const diffuse = 0.72 * ndotl;
  const specular = useSmoothShading ? 0.18 * spec : 0.3 * spec;
  const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));
  return lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
}
