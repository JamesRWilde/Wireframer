/**
 * initThemeControls.js - Theme System Initialization
 * 
 * PURPOSE:
 *   Initializes the color theming system during app startup. This includes creating
 *   preset color swatches, restoring any saved custom colors from localStorage, and
 *   wiring up the theme mode (dark/light) selector.
 * 
 * ARCHITECTURE ROLE:
 *   Called during startApp() after DOM elements are available. Centralizes all theme
 *   initialization logic to keep the startup sequence clean and maintainable.
 * 
 * THEME SYSTEM OVERVIEW:
 *   The theme system allows users to customize the app's color scheme via RGB sliders
 *   or preset swatches. Colors are persisted to localStorage and applied as CSS
 *   custom properties (variables) that cascade throughout the UI.
 */

"use strict";

// Import the function to create clickable preset color swatches in the UI
// These provide quick access to curated color combinations
import { initPresetSwatches } from '../../ui/init/initUiPresetSwatches.js';

// Import the function to read saved custom RGB values from localStorage
// Returns null if no saved colors exist (first visit or cleared storage)
import { getUiReadCustomRgb } from '../../ui/get/getUiReadCustomRgb.js';

// Import the function to apply custom RGB values to the theme
// Updates CSS variables, particle colors, wire colors, etc.
import { setCustomRgb } from '../../ui/set/setCustomRgb.js';

// Import the function to set dark/light theme mode
// Adjusts background brightness, contrast enforcement, etc.
import { setThemeMode } from '../../ui/set/setThemeMode.js';

// Import the function to persist UI state to localStorage
// Called when theme changes to save user preferences
import { setUiPersistUiState } from '../../ui/set/setUiPersistUiState.js';

/**
 * initThemeControls - Initializes the theme system and wires up event handlers
 * 
 * This function:
 * 1. Creates preset color swatches in the UI
 * 2. Restores any saved custom color from localStorage
 * 3. Sets up the theme mode (dark/light) selector
 * 4. Attaches event handlers for theme changes
 * 
 * All operations are wrapped in try/catch because theme initialization is
 * non-critical - the app should work even if theming fails.
 */
export function initThemeControls() {
  try {
    // Step 1: Create preset color swatches in the UI
    // These are clickable buttons that apply predefined color schemes
    initPresetSwatches();
    
    // Step 2: Restore saved custom color from localStorage (if any)
    // readCustomRgb returns { r, g, b } or null if nothing saved
    const saved = getUiReadCustomRgb();
    if (saved) {
      // Apply the saved color without persisting (already saved) but with visual update
      // persist: false avoids redundant localStorage write
      // apply: true updates CSS variables and canvas colors immediately
      setCustomRgb(saved, { persist: false, apply: true });
    }

    // Step 3: Set up theme mode selector (dark/light)
    // Check if the theme-mode select element exists in the DOM
    if (typeof document !== 'undefined' && document.getElementById('theme-mode')) {
      const tm = document.getElementById('theme-mode');
      
      // Apply the initial theme mode from the select's current value
      // apply: true updates CSS variables and background immediately
      setThemeMode(tm.value, { apply: true });

      // Attach input event handler for live theme mode changes
      // 'input' fires continuously while the user interacts with the select
      tm.addEventListener('input', () => {
        // Apply the new theme mode
        setThemeMode(tm.value, { apply: true });
        
        // Persist the new theme mode to localStorage
        // Wrapped in try/catch because persistence is non-critical
        try {
          setUiPersistUiState();
        } catch {
          // Ignore persistence errors - theme still works for this session
        }
      });
      
      // Also listen for 'change' event and forward it to 'input'
      // This ensures consistent behavior across browsers that may fire
      // different events for select elements
      tm.addEventListener('change', () => tm.dispatchEvent(new Event('input')));
    }
  } catch (e) {
    // Non-critical: keep app running if theme init fails
    // The app will use default colors if theming is unavailable
    // eslint-disable-next-line no-console
    console.warn('Theme init failed', e);
  }
}
