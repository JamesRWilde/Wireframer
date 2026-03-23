/**
 * readUiState.js - Read UI State from Local Storage
 *
 * PURPOSE:
 *   Reads the persisted UI control state from localStorage and returns it as an object.
 *
 * ARCHITECTURE ROLE:
 *   Used during application startup to restore slider values and theme state.
 *   Handles legacy storage key bugs by checking both the current and old keys.
 *
 * DATA FORMAT:
 *   - Stored as JSON string representing an object like { lod, fillOpacity, bgDensity, ... }
 *
 * @returns {Object|null} Parsed state object or null if none exists/invalid.
 */

"use strict";

const UI_STATE_KEY = 'wireframer.uiState';

export function getUiState() {
  try {
    let saved = localStorage.getItem(UI_STATE_KEY);
    if (!saved) {
      // legacy bug: we used to pass undefined as the key, so look there too
      saved = localStorage.getItem('undefined');
    }
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
