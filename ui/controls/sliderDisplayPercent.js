export function sliderDisplayPercent(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = Number(slider.value);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(value)) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
}
