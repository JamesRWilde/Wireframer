export function renderEngineSyncCanvasSize(cpuCanvas) {
  const w = globalThis.innerWidth;
  const h = globalThis.innerHeight;
  
  globalThis.W = w;
  globalThis.H = h;
  
  if (cpuCanvas) {
    cpuCanvas.width = w;
    cpuCanvas.height = h;
  }
  
  const bgCanvas = document.getElementById('bg');
  if (bgCanvas) {
    bgCanvas.width = w;
    bgCanvas.height = h;
  }
  
  if (globalThis.fgCanvas) {
    globalThis.fgCanvas.width = w;
    globalThis.fgCanvas.height = h;
  }
  
  if (globalThis.gpuCanvas) {
    globalThis.gpuCanvas.width = w;
    globalThis.gpuCanvas.height = h;
  }
  
  if (globalThis.fillLayerCanvas) {
    globalThis.fillLayerCanvas.width = w;
    globalThis.fillLayerCanvas.height = h;
  }
  
  console.debug('[initCanvas] synced canvas sizes', w, h);
}
