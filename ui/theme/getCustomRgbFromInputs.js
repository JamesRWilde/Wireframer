import { clampByte } from '../color-utils/clampByte.js';
import { customRed, customGreen, customBlue, CUSTOM_RGB } from '../dom-state.js';

export function getCustomRgbFromInputs() {
  return [
    clampByte(customRed ? customRed.value : CUSTOM_RGB[0]),
    clampByte(customGreen ? customGreen.value : CUSTOM_RGB[1]),
    clampByte(customBlue ? customBlue.value : CUSTOM_RGB[2]),
  ];
}
