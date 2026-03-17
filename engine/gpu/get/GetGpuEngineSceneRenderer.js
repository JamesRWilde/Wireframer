// Import the GPU renderer factory function
// Creates WebGL context, shaders, and buffer management
import { InitGpuEngineCreateSceneRenderer } from '../init/InitGpuEngineCreateSceneRenderer.js';

// Import shared GPU renderer state
import { gpuState } from '../state/StateGpuEngineScene.js';

export function GetGpuEngineSceneRenderer() {
  if (gpuState.renderer || gpuState.failed) return gpuState.renderer;
  
  // Use the dedicated GPU canvas for WebGL rendering
  // This is separate from fgCanvas which has a 2D context
  const gpuCanvas = globalThis.gpuCanvas;
  if (!gpuCanvas) {
    gpuState.failed = true;
    return null;
  }

  gpuState.renderer = InitGpuEngineCreateSceneRenderer(gpuCanvas);
  if (!gpuState.renderer) gpuState.failed = true;
  return gpuState.renderer;
}
