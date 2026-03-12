import { CUSTOM_RGB_KEY, CUSTOM_RGB } from '../dom-state.js';

export function persistCustomRgb() {
  try {
    localStorage.setItem(CUSTOM_RGB_KEY, JSON.stringify(CUSTOM_RGB));
  } catch {
    // Ignore localStorage failures (private mode/quota).
  }
}
