/**
 * computeTriangleShadeColor.js - Triangle Lighting Calculation
 *
 * PURPOSE:
 *   Computes the shaded color for a triangle using Blinn-Phong lighting.
 *   Combines ambient, diffuse, and specular components for realistic shading.
 */

"use strict";

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

// Cached theme RGB values (updated when theme changes)
let themeDarkR = 0, themeDarkG = 0, themeDarkB = 0;
let themeBrightR = 255, themeBrightG = 255, themeBrightB = 255;
let themeVersion = -1;

function syncThemeColors() {
  const v = globalThis._themeVersion | 0;
  if (v === themeVersion) return;
  themeVersion = v;

  const dark = globalThis.THEME?.shadeDark;
  const bright = globalThis.THEME?.shadeBright;
  // shadeDark/shadeBright are RGB arrays [r, g, b]
  if (Array.isArray(dark)) {
    themeDarkR = dark[0]; themeDarkG = dark[1]; themeDarkB = dark[2];
  }
  if (Array.isArray(bright)) {
    themeBrightR = bright[0]; themeBrightG = bright[1]; themeBrightB = bright[2];
  }
}

/**
 * computeTriangleShadeColor - Computes shaded color for a triangle
 *
 * @param {Array<number>} normal - Surface normal in view space [nx, ny, nz]
 * @param {boolean} useSmoothShading - Whether smooth shading is enabled
 * @returns {[number, number, number]} RGB color [r, g, b] with values 0-255
 */
export function triangleCpu(normal, useSmoothShading) {
  syncThemeColors();

  const nx = normal[0], ny = normal[1], nz = normal[2];

  // Diffuse: N dot L
  const ndotl = nx * Lx + ny * Ly + nz * Lz;
  const diffuse = ndotl > 0 ? 0.72 * ndotl : 0;

  // Specular: (N dot H)^shininess using precomputed half vector
  const nh = nx * Hx + ny * Hy + nz * Hz;
  const nhClamped = nh > 0 ? nh : 0;
  const spec = Math.pow(nhClamped, useSmoothShading ? 24 : 18);

  // Combine: ambient + diffuse + specular
  const specWeight = useSmoothShading ? 0.18 : 0.3;
  let lit = 0.26 + diffuse + specWeight * spec;
  if (lit > 1) lit = 1;
  else if (lit < 0) lit = 0;

  // Lerp theme colors (inline, no array creation)
  const dr = themeDarkR, dg = themeDarkG, db = themeDarkB;
  return [
    (dr + (themeBrightR - dr) * lit) | 0,
    (dg + (themeBrightG - dg) * lit) | 0,
    (db + (themeBrightB - db) * lit) | 0,
  ];
}

// Call this when theme changes to bump the cache version
export function invalidateThemeCache() { themeVersion = -1; }
