/**
 * updateCustomColorUi.js - Custom Color UI Updater
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

import { customRed, customGreen, customBlue, customRedValue, customGreenValue, customBlueValue, customHex, customSwatch, PRESET_SWATCH_BUTTONS, CUSTOM_RGB } from '../state/uiDomState.js';
import { getUiColorToHex } from '../get/getUiColorToHex.js';
import { getUiColorToRgbCss } from '../get/getUiColorToRgbCss.js';
import { getUiColorRgbEquals } from '../get/getUiColorRgbEquals.js';

export function updateCustomColorUi() {
  if (!customRed || !customGreen || !customBlue) return;

  const [r, g, b] = CUSTOM_RGB;
  customRed.value = String(r);
  customGreen.value = String(g);
  customBlue.value = String(b);

  if (customRedValue) customRedValue.textContent = String(r);
  if (customGreenValue) customGreenValue.textContent = String(g);
  if (customBlueValue) customBlueValue.textContent = String(b);
  if (customHex) customHex.textContent = getUiColorToHex(CUSTOM_RGB);
  if (customSwatch) customSwatch.style.background = getUiColorToRgbCss(CUSTOM_RGB);

  for (const entry of PRESET_SWATCH_BUTTONS) {
    entry.button.classList.toggle('is-active', getUiColorRgbEquals(entry.rgb, CUSTOM_RGB));
  }
}
