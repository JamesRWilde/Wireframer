// Centralized model state and helper for active mesh
// This module manages the global MODEL reference and updates UI telemetry when the
// active model changes. It is imported early during engine bootstrap so that
// "setActiveModel" becomes available on globalThis.

import { getStatV, getStatE } from '../../ui/statsState.js';
import { resolveForegroundRenderMode } from './loop/resolveForegroundRenderMode.js';
import { state } from './loop/loopState.js';

/**
 * Make the given mesh object the currently active model.
 * The function also updates HUD elements (vertex/edge counts and object label).
 *
 * @param {Object|null} model - runtime mesh object, or null to clear
 * @param {string} [name] - descriptive name for the model
 */
export function setActiveModel(model, name = '') {
  console.debug('[setActiveModel] name', name, 'model', model ? 'present' : 'null');
  globalThis.MODEL = model;
  // update HUD renderer indicator once model is available
  try {
    resolveForegroundRenderMode();
  } catch {}

  // update vertex/edge stats if DOM elements are registered
  const statV = getStatV();
  const statE = getStatE();
  if (statV) statV.textContent = model?.V?.length ?? '--';
  if (statE) statE.textContent = model?.E?.length ?? '--';

  // reset telemetry EMA values so FPS/hud start fresh for new model
  state.emaFrameMs = 0;
  state.emaFpsFrameIntervalMs = 0;
  state.emaPhysMs = 0;
  state.emaBgMs = 0;
  state.emaFgMs = 0;

  // update the bottom label if present
  const labelEl = document.getElementById('obj-label');
  if (labelEl) labelEl.textContent = name || '';
}

// expose helper globally for legacy code paths
globalThis.setActiveModel = setActiveModel;
