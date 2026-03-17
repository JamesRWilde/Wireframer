/**
 * modelState.js - Centralized Model State Management
 * 
 * PURPOSE:
 *   Provides the single source of truth for the currently active 3D mesh model.
 *   This module manages the global MODEL reference and coordinates all side effects
 *   that occur when the active model changes: UI updates, telemetry resets, and
 *   render mode resolution.
 * 
 * ARCHITECTURE ROLE:
 *   Imported early during engine bootstrap so that setActiveModel is available
 *   globally before other modules need it. The MODEL global is the primary data
 *   contract between the mesh loading system and the rendering pipeline.
 * 
 * WHY CENTRALIZED:
 *   Having a single setActiveModel function ensures that all model changes go
 *   through the same validation and side-effect path. This prevents bugs where
 *   the MODEL is updated but UI stats or telemetry aren't synchronized.
 */

"use strict";

// Import stat display helpers to update vertex/edge counts in the HUD
// These return DOM element references that are cached in statsState.js
import { statsState } from '../../../ui/state/StateUiStats.js';

// Import render mode resolver to update GPU/CPU indicator when model changes
// The render mode may need to be re-evaluated based on the new model's complexity
import { GetEngineForegroundRenderMode } from '../../get/GetEngineForegroundRenderMode.js';

// Import loop state to access telemetry EMA (Exponential Moving Average) values
// These need to be reset when switching models to avoid stale timing data
import { state } from '../../state/StateEngineLoop.js';

/**
 * setActiveModel - Updates the active mesh model and synchronizes all dependent state
 * 
 * This is the ONLY function that should be used to change the active model.
 * It handles:
 * 1. Setting the global MODEL reference
 * 2. Re-evaluating the foreground render mode (GPU vs CPU)
 * 3. Updating vertex/edge count displays in the HUD
 * 4. Resetting telemetry smoothing values for fresh stats
 * 5. Updating the object label in the UI
 * 
 * @param {Object|null} model - The mesh object to activate, or null to clear
 *   Expected shape: { V: [[x,y,z],...], F: [[i,j,k,...],...], E: [[i,j],...] }
 * @param {string} [name=''] - Human-readable name for display (e.g., "Torus Knot")
 *   Used in the bottom label and potentially in telemetry/logging
 * 
 * @example
 *   setActiveModel(parsedMesh, "My Custom Shape");
 *   setActiveModel(null); // Clear the current model
 */
export function StateRenderEngineModel(model, name = '') {
  // Debug logging to trace model changes during development
  // Shows whether a model is present or null, helpful for diagnosing loading issues
  console.debug('[setActiveModel] name', name, 'model', model ? 'present' : 'null');
  
  // Step 1: Update the global MODEL reference
  // This is the primary state that the rendering pipeline reads each frame
  // Setting it to null effectively clears the display (no model rendered)
  globalThis.MODEL = model;
  
  // Step 2: Re-evaluate the foreground render mode
  // The optimal render mode (GPU vs CPU) may change based on model complexity
  // or browser capabilities. We wrap in try/catch because this is non-critical -
  // if it fails, the existing render mode will continue to work
  try {
    GetEngineForegroundRenderMode();
  } catch {}

  // Step 3: Update vertex and edge count displays in the HUD
  // These stats help users understand model complexity and LOD effects
  // We use optional chaining (?.) because the model might be null
  // The nullish coalescing operator (??) provides '--' as fallback text
  const statV = statsState.statV;
  const statE = statsState.statE;
  if (statV) statV.textContent = model?.V?.length ?? '--';
  if (statE) statE.textContent = model?.E?.length ?? '--';

  // Step 4: Reset all telemetry EMA (Exponential Moving Average) values
  // When switching models, we want fresh timing data rather than smoothed
  // values that blend old and new model performance. This gives users an
  // accurate view of the new model's performance characteristics.
  state.emaFrameMs = 0;           // Total frame time
  state.emaFpsFrameIntervalMs = 0; // FPS calculation base
  state.emaPhysMs = 0;            // Physics update time
  state.emaBgMs = 0;              // Background render time
  state.emaFgMs = 0;              // Foreground render time

  // Step 5: Update the object label in the UI
  // This is the text label at the bottom of the screen showing the current shape
  // We use getElementById because this element may not always be present
  const labelEl = document.getElementById('obj-label');
  if (labelEl) labelEl.textContent = name || '';
}

// Expose setActiveModel globally for legacy code paths and dynamic loading
// Some modules (like loader.js) call this via globalThis.setActiveModel()
// This global exposure is a deliberate architectural choice to support
// flexible loading patterns without circular import dependencies
globalThis.setActiveModel = setActiveModel;
