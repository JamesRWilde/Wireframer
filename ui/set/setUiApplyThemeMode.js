/**
 * applyThemeMode.js - Apply Saved Theme Mode
 *
 * PURPOSE:
 *   Applies the saved theme mode from stored state to the theme mode selector.
 *   Ensures the UI control reflects the restored mode value.
 *
 * ARCHITECTURE ROLE:
 *   Used by restoreUiState to apply the saved theme mode when the app initializes.
 *
 * @param {Object} state - Deserialized UI state object from localStorage
 */
import { themeMode } from '../domState.js';

export function setUiApplyThemeMode(state) {
  if (!themeMode || !('themeMode' in state)) return;
  themeMode.value = state.themeMode === 'light' ? 'light' : 'dark';
}
