import { clampByte } from './clampByte.js';

export function toHex(rgb) {
  const hex = rgb.map((v) => clampByte(v).toString(16).padStart(2, '0')).join('');
  return `#${hex.toUpperCase()}`;
}
