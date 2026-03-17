// Import the GPU renderer factory function
// Creates WebGL context, shaders, and buffer management
import { initCreateSceneGpuRenderer } from '../init/initCreateSceneGpuRenderer.js';

// Import shared GPU renderer state
import { gpuState } from '../sceneGpuState.js';

export function getSceneGpuRenderer() {
  if (gpuState.renderer || gpuState.failed) return gpuState.renderer;
  
  // Use the dedicated GPU canvas for WebGL rendering
  // This is separate from fgCanvas which has a 2D context
  const gpuCanvas = globalThis.gpuCanvas;
  if (!gpuCanvas) {
    gpuState.failed = true;
    return null;
  }

  gpuState.renderer = initCreateSceneGpuRenderer(gpuCanvas);
  if (!gpuState.renderer) gpuState.failed = true;
  return gpuState.renderer;
}
