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
import { utilHex }from '@ui/get/color/utilHex.js';
import { utilRgbCss }from '@ui/get/color/utilRgbCss.js';
import { getRgbEquals }from '@ui/get/color/getRgbEquals.js';

export function setUpdateCustomColor() {
  if (!customRed || !customGreen || !customBlue) return;

  const [r, g, b] = CUSTOM_RGB;
  customRed.value = String(r);
  customGreen.value = String(g);
  customBlue.value = String(b);

  if (customRedValue) customRedValue.textContent = String(r);
  if (customGreenValue) customGreenValue.textContent = String(g);
  if (customBlueValue) customBlueValue.textContent = String(b);
  if (customHex) customHex.textContent = utilHex(CUSTOM_RGB);
  if (customSwatch) customSwatch.style.background = utilRgbCss(CUSTOM_RGB);

  for (const entry of PRESET_SWATCH_BUTTONS) {
    entry.button.classList.toggle('is-active', getRgbEquals(entry.rgb, CUSTOM_RGB));
  }
}
