import { CUSTOM_RGB_KEY, CUSTOM_RGB_DEFAULT } from '../dom-state.js';
import { clampByte } from '../color-utils/clampByte.js';

export function readCustomRgb() {
  try {
    const saved = localStorage.getItem(CUSTOM_RGB_KEY);
    if (!saved) return CUSTOM_RGB_DEFAULT.slice();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length !== 3) return CUSTOM_RGB_DEFAULT.slice();
    return [clampByte(parsed[0]), clampByte(parsed[1]), clampByte(parsed[2])];
  } catch {
    return CUSTOM_RGB_DEFAULT.slice();
  }
}
