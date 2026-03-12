export function clampBackgroundScale(level) {
  return Math.max(0, Math.min(5.2, Number(level) || 0));
}
