export function mapVelocitySliderScale(rawPercent) {
  const p = Math.max(0, rawPercent);
  if (p <= 1) return p * 2.8;
  return 2.8 + (p - 1) * 2.4;
}
