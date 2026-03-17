/**
 * computeTriangleShadeColor.js - Blinn-Phong Shading for Triangles
 *
 * PURPOSE:
 *   Computes the shaded color of a triangle using Blinn-Phong lighting.
 *   Used for per-triangle lighting in fill rendering.
 *
 * ARCHITECTURE ROLE:
 *   Provides a consistent shading response for triangles based on surface normals
 *   and theme colors. Works with smooth and flat shading modes.
 *
 * DATA FORMAT:
 *   - normal: normalized surface normal [nx, ny, nz]
 *   - theme: object containing shadeDark and shadeBright color values
 *
 * @param {number[]} normal - Surface normal [nx, ny, nz]
 * @param {boolean} useSmoothShading - Whether smooth shading is enabled
 * @param {Object} theme - Theme colors { shadeDark, shadeBright }
 * @returns {number[]} RGB color [r, g, b]
 */

"use strict";

import { lerpColor } from '../../ui/color/lerpColor.js';
export function computeTriangleShadeColor(normal, useSmoothShading, theme) {
  const LIGHT_DIR = [-0.532, 0.847, 0];
  const VIEW_DIR = [0, 0, -1];
  const nx = normal[0], ny = normal[1], nz = normal[2];

  // Diffuse lighting: lambertian response based on angle between normal and light.
  const ndotl = Math.max(0, nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2]);

  // Specular (Blinn-Phong) uses the half-vector between light and view directions.
  const hx = LIGHT_DIR[0] + VIEW_DIR[0];
  const hy = LIGHT_DIR[1] + VIEW_DIR[1];
  const hz = LIGHT_DIR[2] + VIEW_DIR[2];
  const hl = Math.hypot(hx, hy, hz);
  const hnx = hx / hl, hny = hy / hl, hnz = hz / hl;
  const nh = Math.max(0, nx * hnx + ny * hny + nz * hnz);
  const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

  // Combine ambient, diffuse, and specular contributions.
  const ambient = 0.26;
  const diffuse = 0.72 * ndotl;
  const specular = useSmoothShading ? 0.18 * spec : 0.3 * spec;
  const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));

  // Interpolate between dark and bright theme colors based on computed lighting.
  return lerpColor(theme.shadeDark || [0, 0, 0], theme.shadeBright || [255, 255, 255], lit);
}
