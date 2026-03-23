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
 * WHY THIS EXISTS:
 *   Centralizes palette-derived color math so all theme updates are consistent
 *   with contrast and visual hierarchy requirements.
 *
 * DATA FORMAT:
 *   - rgbInput: [r, g, b] base color values (0-255)
 *   - Returns an object containing named colors and uiVars (CSS variables)
 */

"use strict";

import { utilClampByte }from '@ui/get/color/utilClampByte.js';
import { utilMixedRgb }from '@ui/get/color/utilMixedRgb.js';
import { utilRgbCss }from '@ui/get/color/utilRgbCss.js';
import { utilRgbaCss }from '@ui/get/color/utilRgbaCss.js';
import { utilEnforcedContrast }from '@ui/get/color/utilEnforcedContrast.js';

export function setCustomTheme(rgbInput, themeMode) {
  const base = [utilClampByte(rgbInput[0]), utilClampByte(rgbInput[1]), utilClampByte(rgbInput[2])];
  const isLight = themeMode === 'light';
  const choose = (lightVal, darkVal) => (isLight ? lightVal : darkVal);

  const bg = choose(
    utilMixedRgb(base, [255, 255, 255], 0.95),
    [0, 0, 0]
  );
  const uiBg = choose(
    utilMixedRgb(base, [255, 255, 255], 0.88),
    utilMixedRgb(base, [0, 0, 0], 0.9)
  );
  const panelBg = choose(
    utilMixedRgb(base, [255, 255, 255], 0.78),
    utilMixedRgb(base, [0, 0, 0], 0.88)
  );
  const optionBg = choose(
    utilMixedRgb(base, [255, 255, 255], 0.82),
    utilMixedRgb(base, [0, 0, 0], 0.88)
  );

  const title = choose(
    utilEnforcedContrast(utilMixedRgb(base, [0, 0, 0], 0.72), bg, 5.5),
    utilEnforcedContrast(utilMixedRgb(base, [255, 255, 255], 0.54), bg, 5.5)
  );
  const subtitle = choose(
    utilEnforcedContrast(utilMixedRgb(base, [0, 0, 0], 0.46), bg, 2.3),
    utilEnforcedContrast(utilMixedRgb(base, [255, 255, 255], 0.16), bg, 2.3)
  );
  const controlFg = choose(
    utilEnforcedContrast(utilMixedRgb(base, [0, 0, 0], 0.6), bg, 4.2),
    utilEnforcedContrast(utilMixedRgb(base, [255, 255, 255], 0.32), bg, 4.2)
  );
  const controlHoverFg = choose(
    utilEnforcedContrast(utilMixedRgb(base, [0, 0, 0], 0.8), bg, 5.5),
    utilEnforcedContrast(utilMixedRgb(base, [255, 255, 255], 0.58), bg, 5.5)
  );
  const label = choose(
    utilEnforcedContrast(utilMixedRgb(base, [0, 0, 0], 0.54), bg, 3.6),
    utilEnforcedContrast(utilMixedRgb(base, [255, 255, 255], 0.26), bg, 3.6)
  );
  const value = choose(
    utilEnforcedContrast(utilMixedRgb(base, [0, 0, 0], 0.72), bg, 4.8),
    utilEnforcedContrast(utilMixedRgb(base, [255, 255, 255], 0.46), bg, 4.8)
  );

  return {
    bg,
    particle: choose(
      utilMixedRgb(base, [0, 0, 0], 0.9),
      utilMixedRgb(base, [255, 255, 255], 0.34)
    ),
    wireA: choose(
      utilMixedRgb(base, [255, 255, 255], 0.12),
      utilMixedRgb(base, [0, 0, 0], 0.2)
    ),
    wireB: choose(
      utilMixedRgb(base, [0, 0, 0], 0.18),
      utilMixedRgb(base, [255, 255, 255], 0.08)
    ),
    wireNear: choose(
      utilMixedRgb(base, [255, 255, 255], 0.28),
      utilMixedRgb(base, [0, 0, 0], 0.42)
    ),
    wireFar: choose(
      utilMixedRgb(base, [0, 0, 0], 0.46),
      utilMixedRgb(base, [255, 255, 255], 0.46)
    ),
    shadeDark: choose(
      utilMixedRgb(base, [255, 255, 255], 0.22),
      utilMixedRgb(base, [0, 0, 0], 0.5)
    ),
    shadeBright: choose(
      utilMixedRgb(base, [0, 0, 0], 0.24),
      utilMixedRgb(base, [255, 255, 255], 0.3)
    ),
    morph: choose(
      utilMixedRgb(base, [0, 0, 0], 0.28),
      utilMixedRgb(base, [255, 255, 255], 0.36)
    ),
    uiVars: {
      '--bg-solid': utilRgbCss(bg),
      '--ui-title': utilRgbaCss(title, 0.88),
      '--ui-subtitle': utilRgbaCss(subtitle, 0.5),
      '--ui-control-border': utilRgbaCss(choose(
        utilMixedRgb(base, [0, 0, 0], 0.2),
        utilMixedRgb(base, [255, 255, 255], 0.12)
      ), 0.42),
      '--ui-control-fg': utilRgbaCss(controlFg, 0.86),
      '--ui-control-hover-border': utilRgbaCss(choose(
        utilMixedRgb(base, [0, 0, 0], 0.36),
        utilMixedRgb(base, [255, 255, 255], 0.28)
      ), 0.7),
      '--ui-control-hover-fg': utilRgbaCss(controlHoverFg, 0.98),
      '--ui-control-bg': utilRgbaCss(uiBg, isLight ? 0.92 : 0.9),
      '--ui-panel-bg': utilRgbaCss(panelBg, isLight ? 0.8 : 0.4),
      '--ui-control-option-bg': utilRgbCss(optionBg),
      '--ui-label': utilRgbaCss(label, 0.82),
      '--ui-value': utilRgbaCss(value, 0.9),
      '--ui-switch-glow': utilRgbaCss(choose(
        utilMixedRgb(base, [0, 0, 0], 0.24),
        utilMixedRgb(base, [255, 255, 255], 0.46)
      ), 0.58),
      '--ui-stats': utilRgbaCss(choose(
        utilMixedRgb(base, [0, 0, 0], 0.34),
        utilMixedRgb(base, [255, 255, 255], 0.18)
      ), 0.42),
      '--ui-object-label': utilRgbaCss(value, 0.64),
      '--ui-hint': utilRgbaCss(label, 0.36),
      '--ui-accent': utilRgbCss(base),
    },
  };
}
