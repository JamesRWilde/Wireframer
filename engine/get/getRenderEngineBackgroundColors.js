/**
 * getBackgroundColors.js - Theme Color Accessor
 * 
 * PURPOSE:
 *   Retrieves background and particle colors from the current theme.
 *   Provides fallback values when theme colors are unavailable.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawBackground to get colors for rendering.
 *   Centralizes color resolution logic with proper fallback chain.
 * 
 * COLOR RESOLUTION ORDER:
 *   1. Theme particle color (if set)
 *   2. Custom RGB color (user-selected)
 *   3. Default light blue fallback
 */

/**
 * getBackgroundColors - Gets background and particle colors from theme
 * 
 * @returns {{ bgColor: string, particleColor: string }}
 *   Object containing background fill color and particle color as rgba strings
 * 
 * The function:
 * 1. Gets background color from theme (defaults to black)
 * 2. Resolves particle color with fallback chain:
 *    - Theme particle color (preferred)
 *    - Custom RGB color (user selection)
 *    - Default light blue (ultimate fallback)
 */
export function getRenderEngineBackgroundColors() {
  // Get background color from theme, default to black
  const bgRgb = globalThis.THEME?.bg ?? [0, 0, 0];
  const bgColor = `rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},1)`;

  // Try theme particle color first (highest priority)
  const themeParticle = globalThis.THEME?.particle;
  if (themeParticle) {
    return { bgColor, particleColor: `rgba(${themeParticle[0]},${themeParticle[1]},${themeParticle[2]},1)` };
  }

  // Fall back to custom RGB color if available
  const custom = globalThis.CUSTOM_RGB;
  if (custom?.length === 3) {
    return { bgColor, particleColor: `rgba(${custom[0]},${custom[1]},${custom[2]},1)` };
  }

  // Ultimate fallback: light blue color
  return { bgColor, particleColor: 'rgba(200,220,255,1)' };
}
