/**
 * restoredState.js - UI State Restoration
 * 
 * PURPOSE:
 *   Restores saved UI state from localStorage (shape, sliders, theme).
 *   Called during app initialization to restore the user's previous session.
 */

"use strict";

import { restoreState }from '@ui/set/restoreState.js';

export function restoredState() {
  let restoredShapeName = null;
  try {
    restoredShapeName = restoreState();
    if (restoredShapeName) {
    }
  } catch (e) {
    console.warn('[startApp] restoreState failed', e);
  }
  return restoredShapeName;
}
