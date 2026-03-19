/**
 * modelState.js - Centralized Model State Management
 *
 * PURPOSE:
 *   Single source of truth for the active 3D mesh model and its derivatives
 *   (base model, CPU-safe model, current LOD model, LOD percentage).
 *
 * ARCHITECTURE ROLE:
 *   Imported by mesh loading, LOD switching, and rendering modules.
 *   setActiveModel() is the ONLY function that should change the active model,
 *   ensuring UI stats, telemetry, and render mode stay synchronized.
 *
 * WHY CENTRALIZED:
 *   MODEL, BASE_MODEL, CPU_BASE_MODEL, CURRENT_LOD_MODEL, and CURRENT_LOD_PCT
 *   are tightly coupled — they all change together when a new model loads or
 *   LOD level switches. Keeping them in one module prevents partial updates.
 */

"use strict";

import {statsState} from '@ui/state/stats.js';
import { state }from '@engine/state/engine/loop.js';

/**
 * modelState - Mutable model state object.
 * Properties:
 *   model        - The currently active mesh (what's being rendered)
 *   baseModel    - Full-detail model copy (never decimated)
 *   cpuBaseModel - CPU-capped version of the base model (may be pre-decimated)
 *   currentLodModel - Current LOD-decimated model
 *   currentLodPct   - Current LOD percentage (0-1, 1 = full detail)
 */
export const modelState = {
  model: null,
  baseModel: null,
  cpuBaseModel: null,
  currentLodModel: null,
  currentLodPct: 1,
};

/**
 * setActiveModel - Updates the active mesh model and synchronizes all dependent state
 *
 * This is the ONLY function that should be used to change the active model.
 * It handles:
 * 1. Setting the global MODEL reference
 * 2. Updating vertex/edge count displays in the HUD
 * 3. Resetting telemetry smoothing values for fresh stats
 * 4. Updating the object label in the UI
 *
 * NOTE: This function does NOT modify baseModel, cpuBaseModel, currentLodModel,
 * or currentLodPct. Those are managed by finalizeModel() and detailLevel().
 *
 * @param {Object|null} model - The mesh object to activate, or null to clear
 *   Expected shape: { V: [[x,y,z],...], F: [[i,j,k,...],...], E: [[i,j],...] }
 * @param {string} [name=''] - Human-readable name for display (e.g., "Torus Knot")
 *
 * @example
 *   setActiveModel(parsedMesh, "My Custom Shape");
 *   setActiveModel(null); // Clear the current model
 */
export function setActiveModel(model, name = '') {

  // Step 1: Update the active model
  modelState.model = model;

  // Step 2: Update vertex and edge count displays in the HUD
  const statV = statsState.statV;
  const statE = statsState.statE;
  if (statV) statV.textContent = model?.V?.length ?? '--';
  if (statE) statE.textContent = model?.E?.length ?? '--';

  // Step 4: Reset all telemetry EMA values
  state.emaFrameMs = 0;
  state.emaFpsFrameIntervalMs = 0;
  state.emaPhysMs = 0;
  state.emaBgMs = 0;
  state.emaFgMs = 0;

  // Step 5: Update the object label in the UI
  const labelEl = document.getElementById('obj-label');
  if (labelEl) labelEl.textContent = name || '';
}
