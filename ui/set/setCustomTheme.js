/**
 * buildCustomTheme.js - Build Custom Theme Palette
 *
 * PURPOSE:
 *   Generates a theme palette (colors and CSS variables) based on a custom
 *   base RGB color and the current theme mode (light/dark).
 *
 * ARCHITECTURE ROLE:
 *   Used by theme management code to compute UI colors that respect contrast
 *   requirements and provide a consistent look across the app.
 *
 * DATA FORMAT:
 *   - rgbInput: [r, g, b] base color values (0-255)
 *   - Returns an object containing named colors and uiVars (CSS variables)
 */

"use strict";

import { getClampByte }from '@ui/get/color/getClampByte.js';
import { getMixedRgb }from '@ui/get/color/getMixedRgb.js';
import { getRgbCss }from '@ui/get/color/getRgbCss.js';
import { getRgbaCss }from '@ui/get/color/getRgbaCss.js';
import { getEnforcedContrast }from '@ui/get/color/getEnforcedContrast.js';

export function setCustomTheme(rgbInput, themeMode) {
  const base = [getClampByte(rgbInput[0]), getClampByte(rgbInput[1]), getClampByte(rgbInput[2])];
  const isLight = themeMode === 'light';
  const choose = (lightVal, darkVal) => (isLight ? lightVal : darkVal);

  const bg = choose(
    getMixedRgb(base, [255, 255, 255], 0.95),
    [0, 0, 0]
  );
  const uiBg = choose(
    getMixedRgb(base, [255, 255, 255], 0.88),
    getMixedRgb(base, [0, 0, 0], 0.9)
  );
  const panelBg = choose(
    getMixedRgb(base, [255, 255, 255], 0.78),
    getMixedRgb(base, [0, 0, 0], 0.88)
  );
  const optionBg = choose(
    getMixedRgb(base, [255, 255, 255], 0.82),
    getMixedRgb(base, [0, 0, 0], 0.88)
  );

  const title = choose(
    getEnforcedContrast(getMixedRgb(base, [0, 0, 0], 0.72), bg, 5.5),
    getEnforcedContrast(getMixedRgb(base, [255, 255, 255], 0.54), bg, 5.5)
  );
  const subtitle = choose(
    getEnforcedContrast(getMixedRgb(base, [0, 0, 0], 0.46), bg, 2.3),
    getEnforcedContrast(getMixedRgb(base, [255, 255, 255], 0.16), bg, 2.3)
  );
  const controlFg = choose(
    getEnforcedContrast(getMixedRgb(base, [0, 0, 0], 0.6), bg, 4.2),
    getEnforcedContrast(getMixedRgb(base, [255, 255, 255], 0.32), bg, 4.2)
  );
  const controlHoverFg = choose(
    getEnforcedContrast(getMixedRgb(base, [0, 0, 0], 0.8), bg, 5.5),
    getEnforcedContrast(getMixedRgb(base, [255, 255, 255], 0.58), bg, 5.5)
  );
  const label = choose(
    getEnforcedContrast(getMixedRgb(base, [0, 0, 0], 0.54), bg, 3.6),
    getEnforcedContrast(getMixedRgb(base, [255, 255, 255], 0.26), bg, 3.6)
  );
  const value = choose(
    getEnforcedContrast(getMixedRgb(base, [0, 0, 0], 0.72), bg, 4.8),
    getEnforcedContrast(getMixedRgb(base, [255, 255, 255], 0.46), bg, 4.8)
  );

  return {
    bg,
    particle: choose(
      getMixedRgb(base, [0, 0, 0], 0.9),
      getMixedRgb(base, [255, 255, 255], 0.34)
    ),
    wireA: choose(
      getMixedRgb(base, [255, 255, 255], 0.12),
      getMixedRgb(base, [0, 0, 0], 0.2)
    ),
    wireB: choose(
      getMixedRgb(base, [0, 0, 0], 0.18),
      getMixedRgb(base, [255, 255, 255], 0.08)
    ),
    wireNear: choose(
      getMixedRgb(base, [255, 255, 255], 0.28),
      getMixedRgb(base, [0, 0, 0], 0.42)
    ),
    wireFar: choose(
      getMixedRgb(base, [0, 0, 0], 0.46),
      getMixedRgb(base, [255, 255, 255], 0.46)
    ),
    shadeDark: choose(
      getMixedRgb(base, [255, 255, 255], 0.22),
      getMixedRgb(base, [0, 0, 0], 0.5)
    ),
    shadeBright: choose(
      getMixedRgb(base, [0, 0, 0], 0.24),
      getMixedRgb(base, [255, 255, 255], 0.3)
    ),
    morph: choose(
      getMixedRgb(base, [0, 0, 0], 0.28),
      getMixedRgb(base, [255, 255, 255], 0.36)
    ),
    uiVars: {
      '--bg-solid': getRgbCss(bg),
      '--ui-title': getRgbaCss(title, 0.88),
      '--ui-subtitle': getRgbaCss(subtitle, 0.5),
      '--ui-control-border': getRgbaCss(choose(
        getMixedRgb(base, [0, 0, 0], 0.2),
        getMixedRgb(base, [255, 255, 255], 0.12)
      ), 0.42),
      '--ui-control-fg': getRgbaCss(controlFg, 0.86),
      '--ui-control-hover-border': getRgbaCss(choose(
        getMixedRgb(base, [0, 0, 0], 0.36),
        getMixedRgb(base, [255, 255, 255], 0.28)
      ), 0.7),
      '--ui-control-hover-fg': getRgbaCss(controlHoverFg, 0.98),
      '--ui-control-bg': getRgbaCss(uiBg, isLight ? 0.92 : 0.9),
      '--ui-panel-bg': getRgbaCss(panelBg, isLight ? 0.8 : 0.4),
      '--ui-control-option-bg': getRgbCss(optionBg),
      '--ui-label': getRgbaCss(label, 0.82),
      '--ui-value': getRgbaCss(value, 0.9),
      '--ui-switch-glow': getRgbaCss(choose(
        getMixedRgb(base, [0, 0, 0], 0.24),
        getMixedRgb(base, [255, 255, 255], 0.46)
      ), 0.58),
      '--ui-stats': getRgbaCss(choose(
        getMixedRgb(base, [0, 0, 0], 0.34),
        getMixedRgb(base, [255, 255, 255], 0.18)
      ), 0.42),
      '--ui-object-label': getRgbaCss(value, 0.64),
      '--ui-hint': getRgbaCss(label, 0.36),
      '--ui-accent': getRgbCss(base),
    },
  };
}
