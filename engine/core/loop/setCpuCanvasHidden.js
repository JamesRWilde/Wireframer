export function setCpuCanvasHidden(hidden) {
  const ctx = globalThis.ctx;
  if (!ctx?.canvas) return;
  const displayValue = hidden ? 'none' : 'block';
  if (ctx.canvas.style.display !== displayValue) {
    ctx.canvas.style.display = displayValue;
  }
}
