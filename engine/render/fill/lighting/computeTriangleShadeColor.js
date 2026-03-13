import { lerpColor } from '../../../../ui/color-utils/lerpColor.js';

export function computeTriangleShadeColor(normal, useSmoothShading) {
  // Safe fallbacks when app hasn't initialized globals yet
  // use the pre-rotated camera-space light direction computed at frame
  // setup; fall back to the world-space vector if not available.
  const LIGHT_DIR = globalThis.LIGHT_DIR_CAM || globalThis.LIGHT_DIR || [0,0,1];
  const VIEW_DIR = globalThis.VIEW_DIR ?? [0, 0, 1];
  const THEME = globalThis.THEME ?? { shadeDark: '#000000', shadeBright: '#ffffff' };

  let nx = normal[0];
  let ny = normal[1];
  let nz = normal[2];
  // for flat shading we want the normal pointing toward the light; since
  // lighting is now in camera space, simply flip if the dot is negative.
  if (!useSmoothShading) {
    const dot = nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2];
    if (dot < 0) {
      nx = -nx; ny = -ny; nz = -nz;
    }
  }
  const ndotlRaw = nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2];
  const ndotl = Math.max(0, ndotlRaw);
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

  // soften the gradient by raising ambient and reducing diffuse weight
  // this prevents most of the model from appearing flat except for a few
  // faces directly facing the light.
  const ambient = 0.40;
  const diffuse = 0.50 * ndotl;
  const specular = useSmoothShading ? 0.10 * spec : 0.15 * spec;
  let lit = ambient + diffuse + specular;
  lit = Math.max(0, Math.min(1, lit));
  return lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
}
