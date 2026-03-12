export function mapDensitySliderScale(rawPercent) {
  const p = Math.max(0, rawPercent);
  if (p <= 1) return p * 2.4;
  return 2.4 + (p - 1) * 2.2;
}
