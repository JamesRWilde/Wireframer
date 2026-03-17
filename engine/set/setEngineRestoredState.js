/**
 * SetEngineRestoredState.js - UI State Restoration
 * 
 * PURPOSE:
 *   Restores saved UI state from localStorage (shape, sliders, theme).
 *   Called during app initialization to restore the user's previous session.
 */

"use strict";

import { setUiRestoreState } from '../../ui/set/setUiRestoreState.js';

export function setEngineRestoredState() {
  let restoredShapeName = null;
  try {
    restoredShapeName = SetUiRestoreState();
    if (restoredShapeName) {
      console.debug('[startApp] restored UI state, selected shape', restoredShapeName);
    }
  } catch (e) {
    console.warn('[startApp] SetUiRestoreState failed', e);
  }
  return restoredShapeName;
}
