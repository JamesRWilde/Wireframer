import { linearChannel } from './linearChannel.js';

export function relativeLuminance(rgb) {
  const r = linearChannel(rgb[0]);
  const g = linearChannel(rgb[1]);
  const b = linearChannel(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
