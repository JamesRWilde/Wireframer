/**
 * SetEngineRestoredState.js - UI State Restoration
 * 
 * PURPOSE:
 *   Restores saved UI state from localStorage (shape, sliders, theme).
 *   Called during app initialization to restore the user's previous session.
 */

"use strict";

import { SetUiRestoreState } from '../../ui/set/SetUiRestoreState.js';

export function SetEngineRestoredState() {
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
