/**
 * setEngineThemeMode.js - Set Theme Mode
 *
 * PURPOSE:
 *   Sets the theme mode to either "light" or "dark". This determines
 *   which theme preset is applied and how the UI chrome is styled.
 *
 * ARCHITECTURE ROLE:
 *   Setter for renderState.themeMode. Called when the user toggles
 *   the light/dark mode switch, or when the theme is initialized.
 *
 * WHY THIS EXISTS:
 *   The theme mode controls which set of color presets is active.
 *   It's stored separately from the theme object so the UI can
 *   display the correct toggle state without inspecting the theme.
 */

"use strict";

// Import the render state container
// Holds theme, opacity, and color parameters shared by both rendering pipelines
import { renderState } from '@engine/state/render/stateRenderState.js';

/**
 * setEngineThemeMode - Sets the theme mode (light or dark)
 * @param {string} mode - The theme mode: "light" or "dark" (defaults to "dark" if invalid)
 */
export function setEngineThemeMode(mode) {
  // Normalize to "light" or "dark" — default to "dark" for any invalid input
  renderState.themeMode = mode === 'light' ? 'light' : 'dark';
}
