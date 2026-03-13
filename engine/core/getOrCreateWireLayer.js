// Offscreen wireframe layer for compositing
export function getOrCreateWireLayer() {
  if (!globalThis.wireLayerCanvas) {
    globalThis.wireLayerCanvas = document.createElement('canvas');
    globalThis.wireLayerCtx = globalThis.wireLayerCanvas.getContext('2d', { alpha: true, desynchronized: true });
    if (globalThis.wireLayerCtx) globalThis.wireLayerCtx.imageSmoothingEnabled = false;
  }
  // Always resize to match viewport
  globalThis.wireLayerCanvas.width = globalThis.W;
  globalThis.wireLayerCanvas.height = globalThis.H;
  return { canvas: globalThis.wireLayerCanvas, ctx: globalThis.wireLayerCtx };
}
