/**
 * restoreStateAndAttachInput.js - UI State Restoration and Input Setup
 * 
 * PURPOSE:
 *   Restores saved UI state from localStorage and attaches mouse/touch input
 *   listeners for model rotation. This is called during app initialization to
 *   restore the user's previous session (selected shape, slider values) and
 *   enable interactive rotation.
 * 
 * ARCHITECTURE ROLE:
 *   Called by startApp() during initialization. Combines two related concerns:
 *   1. Restoring UI state (shape selection, slider values, theme)
 *   2. Attaching input listeners (mouse drag, touch, scroll wheel)
 * 
 * WHY TOGETHER:
 *   These operations are grouped because they both happen once at startup and
 *   both interact with the DOM. Separating them would require two function calls
 *   in startApp without clear benefit.
 */

"use strict";

// Import the input listener attachment function
// Sets up mouse/touch handlers for model rotation and zoom
import { attachInputListeners } from './render/attachInputListeners.js';

// Import the UI state restoration function
// Reads saved shape, sliders, and theme from localStorage
import { restoreUiState } from '../ui/restoreUiState.js';

/**
 * restoreStateAndAttachInput - Restores UI state and sets up input handling
 * 
 * @returns {string|null} The name of the restored shape, or null if none was saved
 *   This is used by startApp to select the initial shape in the object selector
 * 
 * This function:
 * 1. Restores UI state from localStorage (shape, sliders, theme)
 * 2. Attaches mouse/touch input listeners for rotation and zoom
 * 3. Returns the restored shape name for initial selection
 */
export function restoreStateAndAttachInput() {
  // Track the restored shape name to return it
  let restoredShapeName = null;
  
  // Step 1: Restore UI state from localStorage
  // This includes the selected shape, slider values, and theme settings
  try {
    restoredShapeName = restoreUiState();
    if (restoredShapeName) {
      // Log for debugging - helps verify state restoration is working
      console.debug('[startApp] restored UI state, selected shape', restoredShapeName);
    }
  } catch (e) {
    // Non-fatal: if state restoration fails, app starts with defaults
    console.warn('[startApp] restoreUiState failed', e);
  }

  // Step 2: Attach input listeners for mouse/touch interaction
  // These handle model rotation (drag) and zoom (scroll wheel)
  try {
    // Get the CPU canvas element to attach listeners to
    // We use the CPU canvas because it's the original canvas with proper z-index
    const cpuCanvas = document.getElementById('c');
    
    // Attach mouse and touch event listeners
    // This sets up: mousedown/move/up, touchstart/move/end, wheel
    attachInputListeners(cpuCanvas);
  } catch (e) {
    // Non-fatal: if input attachment fails, app runs but isn't interactive
    console.warn('[startApp] attachInputListeners failed', e);
  }

  // Return the restored shape name so startApp can select it
  return restoredShapeName;
}
