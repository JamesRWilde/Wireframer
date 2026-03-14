"use strict";

"use strict";

"use strict";

/**
 * lerpColor.js - Linear Color Interpolation
 *
 * PURPOSE:
 *   Linearly interpolates between two colors, supporting both hex strings and [r,g,b] arrays.
 *   Used for shading and color blending in rendering code.
 *
 * ARCHITECTURE ROLE:
 *   Utility used by rendering pipeline for computing intermediate colors during shading transitions.
 *
 * DATA FORMAT:
 *   - Hex colors must be in the form '#RRGGBB'.
 *   - RGB arrays are expected as [r, g, b] with values in 0-255.
 *
 * @param {string|number[]} color1 - Start color (hex string or [r,g,b] array)
 * @param {string|number[]} color2 - End color (hex string or [r,g,b] array)
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number[]} RGB color array [r, g, b] with values 0-255
 */

"use strict";

export function lerpColor(color1, color2, t) {
  // Handle both hex strings and [r,g,b] arrays
  let r1, g1, b1, r2, g2, b2;
  if (Array.isArray(color1)) {
    r1 = color1[0]; g1 = color1[1]; b1 = color1[2];
  } else {
    // Expect format '#RRGGBB' (6 hex digits)
    r1 = Number.parseInt(color1.slice(1, 3), 16);
    g1 = Number.parseInt(color1.slice(3, 5), 16);
    b1 = Number.parseInt(color1.slice(5, 7), 16);
  }
  if (Array.isArray(color2)) {
    r2 = color2[0]; g2 = color2[1]; b2 = color2[2];
  } else {
    r2 = Number.parseInt(color2.slice(1, 3), 16);
    g2 = Number.parseInt(color2.slice(3, 5), 16);
    b2 = Number.parseInt(color2.slice(5, 7), 16);
  }
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t)
  ];
}
