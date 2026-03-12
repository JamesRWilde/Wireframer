import { hsvToRgb } from '../color-utils/hsvToRgb.js';
import { relativeLuminance } from '../color-utils/relativeLuminance.js';

export function randomPresetRgb() {
  for (let i = 0; i < 18; i++) {
    const hue = Math.random();
    const saturation = 0.68 + Math.random() * 0.28;
    const value = 0.74 + Math.random() * 0.23;
    const rgb = hsvToRgb(hue, saturation, value);

    const max = Math.max(rgb[0], rgb[1], rgb[2]);
    const min = Math.min(rgb[0], rgb[1], rgb[2]);
    const spread = max - min;
    const lum = relativeLuminance(rgb);

    if (spread >= 90 && max >= 150 && lum >= 0.17) return rgb;
  }

  return hsvToRgb(Math.random(), 0.82, 0.86);
}
