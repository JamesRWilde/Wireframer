/**
 * restoredState.js - UI State Restoration
 * 
 * PURPOSE:
 *   Restores saved UI state from localStorage (shape, sliders, theme).
 *   Called during app initialization to restore the user's previous session.
 */

"use strict";

import { setRestoredUiState }from '@ui/set/setRestoredUiState.js';

export function setRestoredState() {
  let restoredShapeName = null;
  try {
    restoredShapeName = setRestoredUiState();
    if (restoredShapeName) {
    }
  } catch (e) {
    console.warn('[startApp] restoreState failed', e);
  }
  return restoredShapeName;
}
