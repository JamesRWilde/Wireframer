import { bgState } from '../backgroundState.js';
import { createGpuBackgroundRenderer } from '../../gpu/background-gpu/createGpuBackgroundRenderer.js';

export function getBackgroundRenderer() {
  if (bgState.renderer || bgState.rendererFailed) return bgState.renderer;
  if (!bgState.canvas || typeof createGpuBackgroundRenderer !== 'function') {
    bgState.rendererFailed = true;
    return null;
  }

  bgState.renderer = createGpuBackgroundRenderer(bgState.canvas);
  if (!bgState.renderer) bgState.rendererFailed = true;
  return bgState.renderer;
}
