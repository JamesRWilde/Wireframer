export function setGpuCanvasHidden(hidden) {
  // intentionally noop; keep foreground canvas visible at all times
  // this prevents the CPU path from hiding it and confusing diagnostics
  /* eslint-disable no-unused-vars */
  const _ = hidden;
  /* eslint-enable no-unused-vars */
}
