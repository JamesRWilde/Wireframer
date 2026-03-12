import { state } from './loopState.js';
import { updateRendererHud } from './updateRendererHud.js';

export function resolveForegroundRenderMode() {
  if (state.foregroundRenderMode !== 'unknown') return state.foregroundRenderMode;
  const renderer = typeof getSceneGpuRenderer === 'function' ? getSceneGpuRenderer() : null;
  const mode = renderer ? 'gpu' : 'cpu';
  state.foregroundRenderMode = mode;
  updateRendererHud(mode);
  return mode;
}
