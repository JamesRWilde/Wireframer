/**
 * computeTriangleShadeColor.js - Triangle Lighting Calculation
 * 
 * PURPOSE:
 *   Computes the shaded color for a triangle using Blinn-Phong lighting.
 *   Combines ambient, diffuse, and specular components for realistic shading.
 * 
 * ARCHITECTURE ROLE:
 *   Called by fill renderer for each triangle to determine its color.
 *   Uses view-space normals from resolveTriangleNormal.
 * 
 * LIGHTING MODEL:
 *   - Ambient: Constant base illumination (0.26)
 *   - Diffuse: Light-dependent shading based on surface angle (0.72 * NdotL)
 *   - Specular: Highlight based on view angle (Blinn-Phong with half vector)
 *   - Final color: Interpolation between theme shadeDark and shadeBright
 */

import { lerpColor } from '../../../ui/lerpColor.js';

/**
 * View-space light direction: top-left ceiling light
 * In view space: X=-0.5 (left), Y=0.8 (up), Z=0 (no depth bias)
 * Normalized: magnitude = sqrt(0.25 + 0.64) = sqrt(0.89) ≈ 0.943
 */
const LIGHT_DIR_VIEW = [-0.532, 0.847, 0];

/**
 * computeTriangleShadeColor - Computes shaded color for a triangle
 * 
 * @param {Array<number>} normal - Surface normal in view space [nx, ny, nz]
 * @param {boolean} useSmoothShading - Whether smooth shading is enabled
 * 
 * @returns {Array<number>} RGB color array [r, g, b] with values 0-255
 * 
 * The function:
 * 1. Computes NdotL for diffuse lighting
 * 2. Computes Blinn-Phong specular with half vector
 * 3. Combines ambient, diffuse, and specular components
 * 4. Interpolates between theme shade colors based on lighting
 */
export function computeTriangleShadeColor(normal, useSmoothShading) {
  // Get theme colors with fallbacks
  const THEME = globalThis.THEME ?? { shadeDark: '#000000', shadeBright: '#ffffff' };

  // Extract normal components (already in view space)
  const nx = normal[0];
  const ny = normal[1];
  const nz = normal[2];
  
  // Compute diffuse term: N dot L (clamped to positive)
  const ndotl = Math.max(0, nx * LIGHT_DIR_VIEW[0] + ny * LIGHT_DIR_VIEW[1] + nz * LIGHT_DIR_VIEW[2]);
  
  // Compute Blinn-Phong specular with half vector
  // View direction in view space is [0, 0, -1] (camera looks down -Z)
  const VIEW_DIR = [0, 0, -1];
  
  // Half vector = normalize(L + V)
  const hx = LIGHT_DIR_VIEW[0] + VIEW_DIR[0];
  const hy = LIGHT_DIR_VIEW[1] + VIEW_DIR[1];
  const hz = LIGHT_DIR_VIEW[2] + VIEW_DIR[2];
  const hl = Math.hypot(hx, hy, hz);
  const hnx = hx / hl;
  const hny = hy / hl;
  const hnz = hz / hl;
  
  // Specular term: (N dot H)^shininess
  const nh = Math.max(0, nx * hnx + ny * hny + nz * hnz);
  // Higher shininess for smooth shading (24 vs 18)
  const spec = Math.pow(nh, useSmoothShading ? 24 : 18);

  // Combine lighting components
  // Ambient: constant base illumination
  const ambient = 0.26;
  // Diffuse: light-dependent shading
  const diffuse = 0.72 * ndotl;
  // Specular: view-dependent highlight (stronger for flat shading)
  const specular = useSmoothShading ? 0.18 * spec : 0.3 * spec;
  
  // Total lighting intensity, clamped to [0, 1]
  const lit = Math.max(0, Math.min(1, ambient + diffuse + specular));
  
  // Interpolate between dark and bright theme colors
  return lerpColor(THEME.shadeDark, THEME.shadeBright, lit);
}
