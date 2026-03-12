export function fallbackToCpuForegroundMode() {
  foregroundRenderMode = 'cpu';
  updateRendererHud(foregroundRenderMode);
}
