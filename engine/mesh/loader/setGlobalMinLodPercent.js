export function setGlobalMinLodPercent(percent) {
  globalThis.GLOBAL_MIN_LOD_PERCENT = Math.max(1, Math.min(100, Number(percent) || 5));
}
