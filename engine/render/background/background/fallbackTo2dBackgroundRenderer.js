import { bgState } from '../backgroundState.js';

export function fallbackTo2dBackgroundRenderer(err) {
  if (bgState.renderer && typeof bgState.renderer.dispose === 'function') {
    try {
      bgState.renderer.dispose();
    } catch {
      // Ignore cleanup failures.
    }
  }
  bgState.renderer = null;
  bgState.rendererFailed = true;
  bgState.gpuLastRenderMs = -1;
  console.warn('Wireframer: GPU background disabled, falling back to 2D.', err);
}
