import { lerpColor } from '../../../../ui/color-utils/lerpColor.js';

export function computeTriangleShadeColor(normal, useSmoothShading) {
  // Safe fallbacks when app hasn't initialized globals yet
  const LIGHT_DIR = globalThis.LIGHT_DIR ?? [0, 0, 1];
  const VIEW_DIR = globalThis.VIEW_DIR ?? [0, 0, 1];
  const THEME = globalThis.THEME ?? { shadeDark: '#000000', shadeBright: '#ffffff' };

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
  const specular = useSmoothShading ? 0.18 * spec : 0.3 * spec;
  // ensure we never produce an extremely dark color that blends
  // into the background; the minimum light value was observed to
  // produce a completely invisible fill when THEME.shadeDark==bg
  let lit = ambient + diffuse + specular;
  lit = Math.max(lit, 0.30);              // enforce visible floor
  lit = Math.max(0, Math.min(1, lit));
  // debug: occasionally log theme to spot bad values
  if (window.DEBUG_LOG_THEME && Math.random() < 0.001) {
    console.log('[computeTriangleShadeColor] theme', THEME, 'nx', nx, 'lit', lit);
  }
  return lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
}
