/**
 * applyPalette.js - Theme Application
 * 
 * PURPOSE:
 *   Applies the current custom color theme to the application.
 *   Builds theme palette from CUSTOM_RGB and updates CSS variables.
 * 
 * ARCHITECTURE ROLE:
 *   Called when theme changes (color selection, mode toggle).
 *   Updates both global THEME object and CSS custom properties.
 * 
 * DATA FORMAT:
 *   - Custom theme palette contains color arrays and CSS variable strings.
 *
 * THEME APPLICATION:
 *   1. Builds complete palette from base color
 *   2. Sets globalThis.THEME for runtime access
 *   3. Updates CSS variables for UI styling
 */

"use strict";

import { bldCustomTheme } from './bldCustomTheme.js';
import { CUSTOM_RGB } from '../state/uiDom.js';

/**
 * applyPalette - Applies current color theme to application
 * 
 * @returns {void}
 * 
 * The function:
 * 1. Builds complete theme palette from CUSTOM_RGB
 * 2. Sets global THEME object for runtime color access
 * 3. Updates CSS custom properties for UI styling
 */
export function palette() {
  // Build complete theme palette from base color
  const palette = SetUiBuildCustomTheme(CUSTOM_RGB);
  
  // Set global THEME for runtime access by renderers
  globalThis.THEME = palette;
  
  // Update CSS custom properties for UI styling
  for (const [k, v] of Object.entries(palette.uiVars)) {
    document.documentElement.style.setProperty(k, v);
  }
}
