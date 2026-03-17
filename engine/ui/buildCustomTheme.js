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

import { clampByte } from './clampByte.js';
import { mixRgb } from './mixRgb.js';
import { toRgbCss } from './toRgbCss.js';
import { toRgbaCss } from './toRgbaCss.js';
import { enforceContrast } from './enforceContrast.js';

export function buildCustomTheme(rgbInput) {
  const base = [clampByte(rgbInput[0]), clampByte(rgbInput[1]), clampByte(rgbInput[2])];
  const isLight = globalThis.THEME_MODE === 'light';
  const choose = (lightVal, darkVal) => (isLight ? lightVal : darkVal);

  const bg = choose(
    mixRgb(base, [255, 255, 255], 0.95),
    [0, 0, 0]
  );
  const uiBg = choose(
    mixRgb(base, [255, 255, 255], 0.88),
    mixRgb(base, [0, 0, 0], 0.9)
  );
  const panelBg = choose(
    mixRgb(base, [255, 255, 255], 0.78),
    mixRgb(base, [0, 0, 0], 0.88)
  );
  const optionBg = choose(
    mixRgb(base, [255, 255, 255], 0.82),
    mixRgb(base, [0, 0, 0], 0.88)
  );

  const title = choose(
    enforceContrast(mixRgb(base, [0, 0, 0], 0.72), bg, 5.5),
    enforceContrast(mixRgb(base, [255, 255, 255], 0.54), bg, 5.5)
  );
  const subtitle = choose(
    enforceContrast(mixRgb(base, [0, 0, 0], 0.46), bg, 2.3),
    enforceContrast(mixRgb(base, [255, 255, 255], 0.16), bg, 2.3)
  );
  const controlFg = choose(
    enforceContrast(mixRgb(base, [0, 0, 0], 0.6), bg, 4.2),
    enforceContrast(mixRgb(base, [255, 255, 255], 0.32), bg, 4.2)
  );
  const controlHoverFg = choose(
    enforceContrast(mixRgb(base, [0, 0, 0], 0.8), bg, 5.5),
    enforceContrast(mixRgb(base, [255, 255, 255], 0.58), bg, 5.5)
  );
  const label = choose(
    enforceContrast(mixRgb(base, [0, 0, 0], 0.54), bg, 3.6),
    enforceContrast(mixRgb(base, [255, 255, 255], 0.26), bg, 3.6)
  );
  const value = choose(
    enforceContrast(mixRgb(base, [0, 0, 0], 0.72), bg, 4.8),
    enforceContrast(mixRgb(base, [255, 255, 255], 0.46), bg, 4.8)
  );

  return {
    bg,
    particle: choose(
      mixRgb(base, [0, 0, 0], 0.9),
      mixRgb(base, [255, 255, 255], 0.34)
    ),
    wireA: choose(
      mixRgb(base, [255, 255, 255], 0.12),
      mixRgb(base, [0, 0, 0], 0.2)
    ),
    wireB: choose(
      mixRgb(base, [0, 0, 0], 0.18),
      mixRgb(base, [255, 255, 255], 0.08)
    ),
    wireNear: choose(
      mixRgb(base, [255, 255, 255], 0.28),
      mixRgb(base, [0, 0, 0], 0.42)
    ),
    wireFar: choose(
      mixRgb(base, [0, 0, 0], 0.46),
      mixRgb(base, [255, 255, 255], 0.46)
    ),
    shadeDark: choose(
      mixRgb(base, [255, 255, 255], 0.22),
      mixRgb(base, [0, 0, 0], 0.5)
    ),
    shadeBright: choose(
      mixRgb(base, [0, 0, 0], 0.24),
      mixRgb(base, [255, 255, 255], 0.3)
    ),
    morph: choose(
      mixRgb(base, [0, 0, 0], 0.28),
      mixRgb(base, [255, 255, 255], 0.36)
    ),
    uiVars: {
      '--bg-solid': toRgbCss(bg),
      '--ui-title': toRgbaCss(title, 0.88),
      '--ui-subtitle': toRgbaCss(subtitle, 0.5),
      '--ui-control-border': toRgbaCss(choose(
        mixRgb(base, [0, 0, 0], 0.2),
        mixRgb(base, [255, 255, 255], 0.12)
      ), 0.42),
      '--ui-control-fg': toRgbaCss(controlFg, 0.86),
      '--ui-control-hover-border': toRgbaCss(choose(
        mixRgb(base, [0, 0, 0], 0.36),
        mixRgb(base, [255, 255, 255], 0.28)
      ), 0.7),
      '--ui-control-hover-fg': toRgbaCss(controlHoverFg, 0.98),
      '--ui-control-bg': toRgbaCss(uiBg, isLight ? 0.92 : 0.9),
      '--ui-panel-bg': toRgbaCss(panelBg, isLight ? 0.8 : 0.4),
      '--ui-control-option-bg': toRgbCss(optionBg),
      '--ui-label': toRgbaCss(label, 0.82),
      '--ui-value': toRgbaCss(value, 0.9),
      '--ui-switch-glow': toRgbaCss(choose(
        mixRgb(base, [0, 0, 0], 0.24),
        mixRgb(base, [255, 255, 255], 0.46)
      ), 0.58),
      '--ui-stats': toRgbaCss(choose(
        mixRgb(base, [0, 0, 0], 0.34),
        mixRgb(base, [255, 255, 255], 0.18)
      ), 0.42),
      '--ui-object-label': toRgbaCss(value, 0.64),
      '--ui-hint': toRgbaCss(label, 0.36),
      '--ui-accent': toRgbCss(base),
    },
  };
}
