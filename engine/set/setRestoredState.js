/**
 * setRestoredState.js - UI State Restoration
 * 
 * PURPOSE:
 *   Restores saved UI state from localStorage (shape, sliders, theme).
 *   Called during app initialization to restore the user's previous session.
 */

"use strict";

import { restoreUiState } from '../../ui/set/restoreUiState.js';

export function setRestoredState() {
  let restoredShapeName = null;
  try {
    restoredShapeName = restoreUiState();
    if (restoredShapeName) {
      console.debug('[startApp] restored UI state, selected shape', restoredShapeName);
    }
  } catch (e) {
    console.warn('[startApp] restoreUiState failed', e);
  }
  return restoredShapeName;
}
