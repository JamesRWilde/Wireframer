import { gpuState } from '@engine/state/gpu/scene.js';
import { sceneRenderer as createSceneRenderer } from '@engine/init/gpu/create/sceneRenderer.js';

export function sceneRenderer() {
  if (gpuState.renderer || gpuState.failed) return gpuState.renderer;
  
  const gpuCanvas = globalThis.gpuCanvas;
  if (!gpuCanvas) {
    console.warn('[sceneRenderer-get] no gpuCanvas');
    gpuState.failed = true;
    return null;
  }

  gpuState.renderer = createSceneRenderer(gpuCanvas);
  if (!gpuState.renderer) { console.warn('[sceneRenderer-get] createSceneRenderer failed'); gpuState.failed = true; }
  return gpuState.renderer;
}
