/**
 * setRestoredState.js - UI State Restoration
 *
 * PURPOSE:
 *   Restores saved UI state from localStorage (shape, sliders, theme).
 *   Called during app initialization to restore the user's previous session.
 *
 * ARCHITECTURE ROLE:
 *   Called by startApp during the initial load sequence. Delegates to the
 *   UI-layer state restoration and returns the restored shape name.
 *
 * WHY THIS EXISTS:
 *   Users expect their settings to persist across page reloads. This function
 *   wraps the localStorage restoration logic with error handling so that a
 *   corrupted or missing state cache doesn't crash the app.
 */

"use strict";

// Import the UI state restoration function
// Handles reading from localStorage and restoring slider/theme/shape values
import { setRestoredUiState } from '@ui/set/setRestoredUiState.js';

/**
 * setRestoredState - Restores saved UI state from localStorage
 * @returns {string|null} The restored shape name, or null if no saved state
 */
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
