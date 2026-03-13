/**
 * hsvToRgb.js - HSV to RGB Color Conversion
 * 
 * PURPOSE:
 *   Converts HSV (Hue, Saturation, Value) color to RGB.
 *   Used for generating random colors with controlled properties.
 * 
 * ARCHITECTURE ROLE:
 *   Called by randomPresetRgb to generate pleasing random colors.
 *   HSV is more intuitive for random color generation than RGB.
 * 
 * COLOR SPACE:
 *   - H: Hue (0-1, maps to 0-360 degrees)
 *   - S: Saturation (0-1, 0=gray, 1=vivid)
 *   - V: Value/Brightness (0-1, 0=black, 1=full brightness)
 */

/**
 * hsvToRgb - Converts HSV color to RGB
 * 
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} v - Value/Brightness (0-1)
 * 
 * @returns {Array<number>} RGB color [r, g, b] with values 0-255
 * 
 * The function:
 * 1. Divides hue into 6 sectors
 * 2. Computes intermediate values based on sector
 * 3. Maps to RGB using sector-specific formula
 * 4. Scales to 0-255 range
 */
export function hsvToRgb(h, s, v) {
  // Determine hue sector (0-5)
  const i = Math.floor(h * 6);
  
  // Fractional part of hue
  const f = h * 6 - i;
  
  // Intermediate values for conversion
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0;
  let g = 0;
  let b = 0;

  // Map to RGB based on hue sector
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break; // Red to Yellow
    case 1: r = q; g = v; b = p; break; // Yellow to Green
    case 2: r = p; g = v; b = t; break; // Green to Cyan
    case 3: r = p; g = q; b = v; break; // Cyan to Blue
    case 4: r = t; g = p; b = v; break; // Blue to Magenta
    default: r = v; g = p; b = q; break; // Magenta to Red
  }

  // Scale to 0-255 and round
  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ];
}
