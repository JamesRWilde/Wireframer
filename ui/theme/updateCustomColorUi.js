import { customRed, customGreen, customBlue, customRedValue, customGreenValue, customBlueValue, customHex, customSwatch, PRESET_SWATCH_BUTTONS, CUSTOM_RGB } from '../dom-state.js';
import { toHex } from '../color-utils/toHex.js';
import { toRgbCss } from '../color-utils/toRgbCss.js';
import { rgbEquals } from '../color-utils/rgbEquals.js';

export function updateCustomColorUi() {
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
