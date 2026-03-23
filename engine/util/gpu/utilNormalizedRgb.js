/**
 * utilNormalizedRgb.js - RGB to Normalized Color Converter
 *
 * PURPOSE:
 *   Converts an RGB color value from the 0-255 integer range to the
 *   0-1 normalized range required by WebGL uniforms. Uses a
 *   pre-allocated output array to avoid per-frame allocation.
 *
 * ARCHITECTURE ROLE:
 *   Called by sceneModel.js to convert theme colors (stored as
 *   0-255 RGB arrays) into normalized format for GPU uniform uploads.
 *
 * DETAILS:
 *   Falls back to the provided fallback color if the source is null
 *   or has missing components.
 */

"use strict";

/**
 * utilNormalizedRgb - Converts RGB [0-255] to normalized [0-1] in place
 *
 * @param {Float32Array} out - Pre-allocated output array (3 elements)
 * @param {Array<number>|null} rgb - Source RGB color [r, g, b] in 0-255 range
 * @param {Array<number>} fallback - Fallback RGB color if source is null
 * @returns {Float32Array} The output array with normalized values
 */
export function utilNormalizedRgb(out, rgb, fallback) {
  // Use source or fallback depending on availability
  const src = rgb || fallback;

  // Convert each channel from 0-255 to 0-1 range
  out[0] = (src?.[0] ?? 0) / 255;
  out[1] = (src?.[1] ?? 0) / 255;
  out[2] = (src?.[2] ?? 0) / 255;

  return out;
}
