import { attachInputListeners } from '../../physics/input/attachInputListeners.js';
import { restoreUiState } from '../../../ui/controls/restoreUiState.js';

export function restoreStateAndAttachInput() {
  let restoredShapeName = null;
  try {
    restoredShapeName = restoreUiState();
    if (restoredShapeName) {
      console.debug('[startApp] restored UI state, selected shape', restoredShapeName);
    }
  } catch (e) {
    console.warn('[startApp] restoreUiState failed', e);
  }

  try {
    const cpuCanvas = document.getElementById('c');
    attachInputListeners(cpuCanvas);
  } catch (e) {
    console.warn('[startApp] attachInputListeners failed', e);
  }

  return restoredShapeName;
}
