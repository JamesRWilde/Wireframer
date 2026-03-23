/**
 * rendererToggle.js - Initialize Renderer Stat as Toggle Button
 * 
 * PURPOSE:
 *   Initializes the renderer stat display element as a clickable toggle button.
 *   This allows users to manually switch between GPU and CPU rendering modes
 *   by clicking on the renderer stat in the telemetry HUD.
 * 
 * ARCHITECTURE ROLE:
 *   Called during app initialization in startApp.js. Sets up the click event
 *   listener and visual styling for the renderer stat element. Only enables
 *   the toggle if GPU rendering is supported.
 * 
 * BEHAVIOR:
 *   - If GPU is supported: makes the renderer stat clickable with hover effects
 *   - If GPU is not supported: leaves the renderer stat as a static display
 *   - Clicking toggles between 'gpu' and 'cpu' modes via toggleRendererMode
 */

"use strict";

// Import the DOM element reference for the renderer stat display
import {statsState} from '@ui/state/stateStats.js';

// Import the toggle function
import { setToggleRenderMode } from '@engine/set/render/setToggleRenderMode.js';

// Import GPU renderer getter to check if GPU is available
import { getSceneRendererGpu }from '@engine/get/gpu/getSceneRendererGpu.js';

/**
 * rendererToggle - Initializes the renderer stat as a toggle button
 * 
 * This function is called once during app initialization. It checks if GPU
 * rendering is supported and, if so, makes the renderer stat element clickable
 * with appropriate visual styling.
 * 
 * The toggle functionality allows users to:
 * - Switch to CPU mode for debugging or compatibility
 * - Switch back to GPU mode for better performance
 * - See which mode is currently active via the HUD display
 */
export function initRendererToggle() {
  // Get the renderer stat DOM element
  const statRenderer = statsState.statRenderer;
  
  // Guard: if element doesn't exist, nothing to initialize
  if (!statRenderer) {
    return;
  }
  
  // Check if GPU renderer is available
  // If not, we don't enable the toggle (CPU is the only option)
  const renderer = getSceneRendererGpu();
  if (!renderer) {
    console.warn('[rendererToggle] GPU renderer not available');
    // GPU not supported - leave as static display
    // Add a title to explain why it's not clickable
    statRenderer.title = 'GPU rendering not available';
    return;
  }
  
  // GPU is supported - enable toggle functionality
  
  // Add click event listener to toggle between GPU and CPU modes
  statRenderer.addEventListener('click', () => {
    setToggleRenderMode();
  });
  
  // Add visual styling to indicate it's clickable
  statRenderer.style.cursor = 'pointer';
  statRenderer.style.textDecoration = 'underline';
  statRenderer.style.textDecorationStyle = 'dotted';
  
  // Add title to explain the toggle functionality
  statRenderer.title = 'Click to toggle between GPU and CPU rendering';
  
  // Add hover effect via CSS class
  // This will be styled in the CSS file
  statRenderer.classList.add('renderer-toggle');
}
