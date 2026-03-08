/**
 * updateCustomColor.js - Custom Color UI Updater
 *
 * PURPOSE:
 *   Synchronizes the UI inputs and display elements with the current custom color
 *   selection stored in the application state.
 *
 * ARCHITECTURE ROLE:
 *   Called when custom color values change (either via sliders or preset swatches)
 *   to ensure the UI reflects the latest RGB values and updates the active swatch.
 */

"use strict";

import {CUSTOM_RGB,PRESET_SWATCH_BUTTONS,customBlue,customBlueValue,customGreen,customGreenValue,customHex,customRed,customRedValue,customSwatch} from '@ui/state/dom.js';
import { toHex }from '@ui/get/color/toHex.js';
import { toRgbCss }from '@ui/get/color/toRgbCss.js';
import { rgbEquals }from '@ui/get/color/rgbEquals.js';

export function updateCustomColor() {
  if (!customRed || !customGreen || !customBlue) return;

  const [r, g, b] = CUSTOM_RGB;
  customRed.value = String(r);
  customGreen.value = String(g);
  customBlue.value = String(b);

  if (customRedValue) customRedValue.textContent = String(r);
  if (customGreenValue) customGreenValue.textContent = String(g);
  if (customBlueValue) customBlueValue.textContent = String(b);
  if (customHex) customHex.textContent = toHex(CUSTOM_RGB);
  if (customSwatch) customSwatch.style.background = toRgbCss(CUSTOM_RGB);

  for (const entry of PRESET_SWATCH_BUTTONS) {
    entry.button.classList.toggle('is-active', rgbEquals(entry.rgb, CUSTOM_RGB));
  }
}
