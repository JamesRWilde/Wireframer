export function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}
