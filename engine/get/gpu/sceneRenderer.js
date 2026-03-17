import { gpuState } from '@engine/state/gpu/scene.js';
import { sceneRenderer as createSceneRenderer } from '@engine/init/gpu/create/sceneRenderer.js';

export function sceneRenderer() {
  if (gpuState.renderer || gpuState.failed) return gpuState.renderer;
  
  const gpuCanvas = globalThis.gpuCanvas;
  if (!gpuCanvas) {
    gpuState.failed = true;
    return null;
  }

  gpuState.renderer = createSceneRenderer(gpuCanvas);
  if (!gpuState.renderer) gpuState.failed = true;
  return gpuState.renderer;
}
