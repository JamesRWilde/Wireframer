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

import { getUiColorClampByte } from '../get/getUiColorClampByte.js';
import { getUiColorMixRgb } from '../get/getUiColorMixRgb.js';
import { getUiColorToRgbCss } from '../get/getUiColorToRgbCss.js';
import { getUiColorToRgbaCss } from '../get/getUiColorToRgbaCss.js';
import { getUiColorEnforceContrast } from '../get/getUiColorEnforceContrast.js';

export function setUiBuildCustomTheme(rgbInput) {
  const base = [getUiColorClampByte(rgbInput[0]), getUiColorClampByte(rgbInput[1]), getUiColorClampByte(rgbInput[2])];
  const isLight = globalThis.THEME_MODE === 'light';
  const choose = (lightVal, darkVal) => (isLight ? lightVal : darkVal);

  const bg = choose(
    getUiColorMixRgb(base, [255, 255, 255], 0.95),
    [0, 0, 0]
  );
  const uiBg = choose(
    getUiColorMixRgb(base, [255, 255, 255], 0.88),
    getUiColorMixRgb(base, [0, 0, 0], 0.9)
  );
  const panelBg = choose(
    getUiColorMixRgb(base, [255, 255, 255], 0.78),
    getUiColorMixRgb(base, [0, 0, 0], 0.88)
  );
  const optionBg = choose(
    getUiColorMixRgb(base, [255, 255, 255], 0.82),
    getUiColorMixRgb(base, [0, 0, 0], 0.88)
  );

  const title = choose(
    getUiColorEnforceContrast(getUiColorMixRgb(base, [0, 0, 0], 0.72), bg, 5.5),
    getUiColorEnforceContrast(getUiColorMixRgb(base, [255, 255, 255], 0.54), bg, 5.5)
  );
  const subtitle = choose(
    getUiColorEnforceContrast(getUiColorMixRgb(base, [0, 0, 0], 0.46), bg, 2.3),
    getUiColorEnforceContrast(getUiColorMixRgb(base, [255, 255, 255], 0.16), bg, 2.3)
  );
  const controlFg = choose(
    getUiColorEnforceContrast(getUiColorMixRgb(base, [0, 0, 0], 0.6), bg, 4.2),
    getUiColorEnforceContrast(getUiColorMixRgb(base, [255, 255, 255], 0.32), bg, 4.2)
  );
  const controlHoverFg = choose(
    getUiColorEnforceContrast(getUiColorMixRgb(base, [0, 0, 0], 0.8), bg, 5.5),
    getUiColorEnforceContrast(getUiColorMixRgb(base, [255, 255, 255], 0.58), bg, 5.5)
  );
  const label = choose(
    getUiColorEnforceContrast(getUiColorMixRgb(base, [0, 0, 0], 0.54), bg, 3.6),
    getUiColorEnforceContrast(getUiColorMixRgb(base, [255, 255, 255], 0.26), bg, 3.6)
  );
  const value = choose(
    getUiColorEnforceContrast(getUiColorMixRgb(base, [0, 0, 0], 0.72), bg, 4.8),
    getUiColorEnforceContrast(getUiColorMixRgb(base, [255, 255, 255], 0.46), bg, 4.8)
  );

  return {
    bg,
    particle: choose(
      getUiColorMixRgb(base, [0, 0, 0], 0.9),
      getUiColorMixRgb(base, [255, 255, 255], 0.34)
    ),
    wireA: choose(
      getUiColorMixRgb(base, [255, 255, 255], 0.12),
      getUiColorMixRgb(base, [0, 0, 0], 0.2)
    ),
    wireB: choose(
      getUiColorMixRgb(base, [0, 0, 0], 0.18),
      getUiColorMixRgb(base, [255, 255, 255], 0.08)
    ),
    wireNear: choose(
      getUiColorMixRgb(base, [255, 255, 255], 0.28),
      getUiColorMixRgb(base, [0, 0, 0], 0.42)
    ),
    wireFar: choose(
      getUiColorMixRgb(base, [0, 0, 0], 0.46),
      getUiColorMixRgb(base, [255, 255, 255], 0.46)
    ),
    shadeDark: choose(
      getUiColorMixRgb(base, [255, 255, 255], 0.22),
      getUiColorMixRgb(base, [0, 0, 0], 0.5)
    ),
    shadeBright: choose(
      getUiColorMixRgb(base, [0, 0, 0], 0.24),
      getUiColorMixRgb(base, [255, 255, 255], 0.3)
    ),
    morph: choose(
      getUiColorMixRgb(base, [0, 0, 0], 0.28),
      getUiColorMixRgb(base, [255, 255, 255], 0.36)
    ),
    uiVars: {
      '--bg-solid': getUiColorToRgbCss(bg),
      '--ui-title': getUiColorToRgbaCss(title, 0.88),
      '--ui-subtitle': getUiColorToRgbaCss(subtitle, 0.5),
      '--ui-control-border': getUiColorToRgbaCss(choose(
        getUiColorMixRgb(base, [0, 0, 0], 0.2),
        getUiColorMixRgb(base, [255, 255, 255], 0.12)
      ), 0.42),
      '--ui-control-fg': getUiColorToRgbaCss(controlFg, 0.86),
      '--ui-control-hover-border': getUiColorToRgbaCss(choose(
        getUiColorMixRgb(base, [0, 0, 0], 0.36),
        getUiColorMixRgb(base, [255, 255, 255], 0.28)
      ), 0.7),
      '--ui-control-hover-fg': getUiColorToRgbaCss(controlHoverFg, 0.98),
      '--ui-control-bg': getUiColorToRgbaCss(uiBg, isLight ? 0.92 : 0.9),
      '--ui-panel-bg': getUiColorToRgbaCss(panelBg, isLight ? 0.8 : 0.4),
      '--ui-control-option-bg': getUiColorToRgbCss(optionBg),
      '--ui-label': getUiColorToRgbaCss(label, 0.82),
      '--ui-value': getUiColorToRgbaCss(value, 0.9),
      '--ui-switch-glow': getUiColorToRgbaCss(choose(
        getUiColorMixRgb(base, [0, 0, 0], 0.24),
        getUiColorMixRgb(base, [255, 255, 255], 0.46)
      ), 0.58),
      '--ui-stats': getUiColorToRgbaCss(choose(
        getUiColorMixRgb(base, [0, 0, 0], 0.34),
        getUiColorMixRgb(base, [255, 255, 255], 0.18)
      ), 0.42),
      '--ui-object-label': getUiColorToRgbaCss(value, 0.64),
      '--ui-hint': getUiColorToRgbaCss(label, 0.36),
      '--ui-accent': getUiColorToRgbCss(base),
    },
  };
}
