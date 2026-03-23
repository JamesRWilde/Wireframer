/**
 * setActiveModel.js - Set Active Mesh Model
 *
 * PURPOSE:
 *   Sets the active mesh model in shared state and updates all dependent UI and
 *   telemetry values.
 *
 * ARCHITECTURE ROLE:
 *   Central model switcher used during object load, LOD changes, and mode swaps.
 *   Ensures one source-of-truth for active mesh and invalidates stale cached metrics.
 *
 * WHY THIS EXISTS:
 *   Prevents inconsistent model references by providing a single mutation path
 *   for active model changes.
 */

'use strict';

import { statsState } from '@ui/state/stateStats.js';
import { state } from '@engine/state/stateLoop.js';
import { modelState } from '@engine/state/render/stateModel.js';

/**
 * setActiveModel - Updates the active mesh model and synchronizes all dependent state
 *
 * This is the ONLY function that should be used to change the active model.
 */
export function setActiveModel(model, name = '') {
  modelState.model = model;

  if (typeof name === 'string' && name.trim() !== '') {
    modelState.name = name;
  }

  const statV = statsState.statV;
  const statE = statsState.statE;
  if (statV) statV.textContent = model?.V?.length ?? '--';
  if (statE) statE.textContent = model?.E?.length ?? '--';

  state.emaFrameMs = 0;
  state.emaFpsFrameIntervalMs = 0;
  state.emaPhysMs = 0;
  state.emaBgMs = 0;
  state.emaFgMs = 0;

  const labelEl = document.getElementById('obj-label');
  if (labelEl) labelEl.textContent = modelState.name || name || '';
}
