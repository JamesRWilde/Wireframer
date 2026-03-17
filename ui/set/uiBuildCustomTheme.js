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

import { uiColorClampByte } from '../get/uiColorClampByte.js';
import { uiColorMixRgb } from '../get/uiColorMixRgb.js';
import { uiColorToRgbCss } from '../get/uiColorToRgbCss.js';
import { uiColorToRgbaCss } from '../get/uiColorToRgbaCss.js';
import { uiColorEnforceContrast } from '../get/uiColorEnforceContrast.js';

export function uiBuildCustomTheme(rgbInput) {
  const base = [GetUiColorClampByte(rgbInput[0]), GetUiColorClampByte(rgbInput[1]), GetUiColorClampByte(rgbInput[2])];
  const isLight = globalThis.THEME_MODE === 'light';
  const choose = (lightVal, darkVal) => (isLight ? lightVal : darkVal);

  const bg = choose(
    GetUiColorMixRgb(base, [255, 255, 255], 0.95),
    [0, 0, 0]
  );
  const uiBg = choose(
    GetUiColorMixRgb(base, [255, 255, 255], 0.88),
    GetUiColorMixRgb(base, [0, 0, 0], 0.9)
  );
  const panelBg = choose(
    GetUiColorMixRgb(base, [255, 255, 255], 0.78),
    GetUiColorMixRgb(base, [0, 0, 0], 0.88)
  );
  const optionBg = choose(
    GetUiColorMixRgb(base, [255, 255, 255], 0.82),
    GetUiColorMixRgb(base, [0, 0, 0], 0.88)
  );

  const title = choose(
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [0, 0, 0], 0.72), bg, 5.5),
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [255, 255, 255], 0.54), bg, 5.5)
  );
  const subtitle = choose(
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [0, 0, 0], 0.46), bg, 2.3),
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [255, 255, 255], 0.16), bg, 2.3)
  );
  const controlFg = choose(
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [0, 0, 0], 0.6), bg, 4.2),
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [255, 255, 255], 0.32), bg, 4.2)
  );
  const controlHoverFg = choose(
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [0, 0, 0], 0.8), bg, 5.5),
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [255, 255, 255], 0.58), bg, 5.5)
  );
  const label = choose(
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [0, 0, 0], 0.54), bg, 3.6),
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [255, 255, 255], 0.26), bg, 3.6)
  );
  const value = choose(
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [0, 0, 0], 0.72), bg, 4.8),
    GetUiColorEnforceContrast(GetUiColorMixRgb(base, [255, 255, 255], 0.46), bg, 4.8)
  );

  return {
    bg,
    particle: choose(
      GetUiColorMixRgb(base, [0, 0, 0], 0.9),
      GetUiColorMixRgb(base, [255, 255, 255], 0.34)
    ),
    wireA: choose(
      GetUiColorMixRgb(base, [255, 255, 255], 0.12),
      GetUiColorMixRgb(base, [0, 0, 0], 0.2)
    ),
    wireB: choose(
      GetUiColorMixRgb(base, [0, 0, 0], 0.18),
      GetUiColorMixRgb(base, [255, 255, 255], 0.08)
    ),
    wireNear: choose(
      GetUiColorMixRgb(base, [255, 255, 255], 0.28),
      GetUiColorMixRgb(base, [0, 0, 0], 0.42)
    ),
    wireFar: choose(
      GetUiColorMixRgb(base, [0, 0, 0], 0.46),
      GetUiColorMixRgb(base, [255, 255, 255], 0.46)
    ),
    shadeDark: choose(
      GetUiColorMixRgb(base, [255, 255, 255], 0.22),
      GetUiColorMixRgb(base, [0, 0, 0], 0.5)
    ),
    shadeBright: choose(
      GetUiColorMixRgb(base, [0, 0, 0], 0.24),
      GetUiColorMixRgb(base, [255, 255, 255], 0.3)
    ),
    morph: choose(
      GetUiColorMixRgb(base, [0, 0, 0], 0.28),
      GetUiColorMixRgb(base, [255, 255, 255], 0.36)
    ),
    uiVars: {
      '--bg-solid': GetUiColorToRgbCss(bg),
      '--ui-title': GetUiColorToRgbaCss(title, 0.88),
      '--ui-subtitle': GetUiColorToRgbaCss(subtitle, 0.5),
      '--ui-control-border': GetUiColorToRgbaCss(choose(
        GetUiColorMixRgb(base, [0, 0, 0], 0.2),
        GetUiColorMixRgb(base, [255, 255, 255], 0.12)
      ), 0.42),
      '--ui-control-fg': GetUiColorToRgbaCss(controlFg, 0.86),
      '--ui-control-hover-border': GetUiColorToRgbaCss(choose(
        GetUiColorMixRgb(base, [0, 0, 0], 0.36),
        GetUiColorMixRgb(base, [255, 255, 255], 0.28)
      ), 0.7),
      '--ui-control-hover-fg': GetUiColorToRgbaCss(controlHoverFg, 0.98),
      '--ui-control-bg': GetUiColorToRgbaCss(uiBg, isLight ? 0.92 : 0.9),
      '--ui-panel-bg': GetUiColorToRgbaCss(panelBg, isLight ? 0.8 : 0.4),
      '--ui-control-option-bg': GetUiColorToRgbCss(optionBg),
      '--ui-label': GetUiColorToRgbaCss(label, 0.82),
      '--ui-value': GetUiColorToRgbaCss(value, 0.9),
      '--ui-switch-glow': GetUiColorToRgbaCss(choose(
        GetUiColorMixRgb(base, [0, 0, 0], 0.24),
        GetUiColorMixRgb(base, [255, 255, 255], 0.46)
      ), 0.58),
      '--ui-stats': GetUiColorToRgbaCss(choose(
        GetUiColorMixRgb(base, [0, 0, 0], 0.34),
        GetUiColorMixRgb(base, [255, 255, 255], 0.18)
      ), 0.42),
      '--ui-object-label': GetUiColorToRgbaCss(value, 0.64),
      '--ui-hint': GetUiColorToRgbaCss(label, 0.36),
      '--ui-accent': GetUiColorToRgbCss(base),
    },
  };
}
