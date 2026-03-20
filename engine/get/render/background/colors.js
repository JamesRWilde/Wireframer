/**
 * getBackgroundColors.js - Theme Color Accessor
 *
 * PURPOSE:
 *   Retrieves background and particle colors from the current theme.
 *   Uses renderState cache for efficient theme reads.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawBackground to get colors for rendering.
 *
 * COLOR RESOLUTION ORDER:
 *   1. Theme particle color (if set)
 *   2. Custom RGB color (user-selected)
 *   3. Default light blue fallback
 */

import { getBgColor } from '@engine/get/render/bgColor.js';
import { getParticleColor } from '@engine/get/render/particleColor.js';
import { getCustomRgbState } from '@ui/get/customRgbState.js';

/**
 * getBackgroundColors - Gets background and particle colors from theme
 *
 * @returns {{ bgColor: string, particleColor: string }}
 */
export function colors() {
  const bgColor = getBgColor();
  const themeParticleColor = getParticleColor();

  // Fall back to custom RGB color if theme has no particle color
  const custom = getCustomRgbState();
  if (custom?.length === 3) {
    return { bgColor, particleColor: `rgba(${custom[0]},${custom[1]},${custom[2]},1)` };
  }

  return { bgColor, particleColor: themeParticleColor };
}
