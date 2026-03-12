import { getStatRenderer } from '../../../ui/statsState.js';

export function updateRendererHud(mode) {
  const statRenderer = getStatRenderer();
  if (!statRenderer) return;
  if (mode === 'gpu') {
    statRenderer.textContent = 'GPU';
  } else if (mode === 'cpu') {
    statRenderer.textContent = 'CPU';
  } else {
    statRenderer.textContent = '--';
  }
}
