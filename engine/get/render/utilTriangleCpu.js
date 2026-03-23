/**
 * computeTriangleShadeColor.js - Triangle Lighting Calculation
 *
 * PURPOSE:
 *   Computes the shaded color for a triangle using Blinn-Phong lighting.
 *   Combines ambient, diffuse, and specular components for realistic shading.
 */

"use strict";

import { getShadeDarkRgb } from '@engine/get/render/getShadeDarkRgb.js';
import { getShadeBrightRgb } from '@engine/get/render/getShadeBrightRgb.js';

/**
 * View-space light direction: top-left ceiling light
 * In view space: X=-0.5 (left), Y=0.8 (up), Z=0 (no depth bias)
 * Normalized: magnitude = sqrt(0.25 + 0.64) = sqrt(0.89) ≈ 0.943
 */
const Lx = -0.532, Ly = 0.847, Lz = 0;

/**
 * Precomputed half-vector (normalize(L + V)) where V = [0, 0, -1]
 * H = normalize([-0.532, 0.847, -1])
 * |H| = sqrt(0.283 + 0.717 + 1) = sqrt(2.0) ≈ 1.414
 * Hx = -0.532 / 1.414 ≈ -0.376
 * Hy =  0.847 / 1.414 ≈ 0.599
 * Hz = -1.000 / 1.414 ≈ -0.707
 */
const Hx = -0.376, Hy = 0.599, Hz = -0.707;

/**
 * computeTriangleShadeColor - Computes shaded color for a triangle
 *
 * @param {Array<number>} normal - Surface normal in view space [nx, ny, nz]
 * @param {boolean} useSmoothShading - Whether smooth shading is enabled
 * @returns {[number, number, number]} RGB color [r, g, b] with values 0-255
 */
export function utilTriangleCpu(normal, useSmoothShading) {
  // Read cached RGB from renderState (re-parsed only when theme changes)
  const dark = getShadeDarkRgb();
  const bright = getShadeBrightRgb();

  const nx = normal[0], ny = normal[1], nz = normal[2];

  // Diffuse: N dot L
  const ndotl = nx * Lx + ny * Ly + nz * Lz;
  const diffuse = Math.max(0, 0.72 * ndotl);

  // Specular: (N dot H)^shininess using precomputed half vector
  const nh = nx * Hx + ny * Hy + nz * Hz;
  const nhClamped = Math.max(nh, 0);
  const spec = Math.pow(nhClamped, useSmoothShading ? 24 : 18);

  // Combine: ambient + diffuse + specular
  const specWeight = useSmoothShading ? 0.18 : 0.3;
  let lit = 0.26 + diffuse + specWeight * spec;
  if (lit > 1) lit = 1;
  else if (lit < 0) lit = 0;

  // Lerp theme colors (inline, no array creation)
  return [
    Math.trunc(dark[0] + (bright[0] - dark[0]) * lit),
    Math.trunc(dark[1] + (bright[1] - dark[1]) * lit),
    Math.trunc(dark[2] + (bright[2] - dark[2]) * lit),
  ];
}
