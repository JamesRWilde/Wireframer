/**
 * restoreUiState.js - Restore UI Control State
 *
 * PURPOSE:
 *   Restores slider/control values from localStorage and applies them to the UI.
 *   Ensures values are clamped and migrates legacy state formats.
 *
 * ARCHITECTURE ROLE:
 *   Called on app initialization to restore the user's last-known UI configuration.
 *   Also persists a migrated, cleaned-up state shape back to localStorage.
 *
 * DATA FORMAT:
 *   - Stored state is JSON with keys like lod, fillOpacity, bgDensity, etc.
 */

"use strict";

import { getUiReadUiState } from '../get/getUiReadUiState.js';
import { setUiApplyClampedValue } from './setUiApplyClampedValue.js';
import { setUiApplyThemeMode } from './setUiApplyThemeMode.js';
import { initUiBuildMigratedState } from '../init/initUiBuildMigratedState.js';
import {
  lodSlider,
  fillOpacity,
  wireOpacity,
  bgDensity,
  bgVelocity,
  bgOpacity,
} from '../domState.js';

const UI_STATE_KEY = 'wireframer.uiState';

export function restoreUiState() {
  const state = getUiReadUiState();
  if (!state) return null;

  setUiApplyClampedValue({ state, key: 'lod', element: lodSlider, min: 50, max: 140, defaultValue: 100 });
  setUiApplyClampedValue({ state, key: 'fillOpacity', element: fillOpacity, min: 0, max: 100, defaultValue: 0 });
  setUiApplyClampedValue({ state, key: 'wireOpacity', element: wireOpacity, min: 0, max: 100, defaultValue: 100 });
  setUiApplyClampedValue({ state, key: 'bgDensity', element: bgDensity, min: 0, max: 220, defaultValue: 100 });
  setUiApplyClampedValue({ state, key: 'bgVelocity', element: bgVelocity, min: 0, max: 220, defaultValue: 100 });
  setUiApplyClampedValue({ state, key: 'bgOpacity', element: bgOpacity, min: 0, max: 100, defaultValue: 100 });
  setUiApplyThemeMode(state);

  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(initUiBuildMigratedState(state)));
    try { localStorage.removeItem('undefined'); } catch {}
  } catch {}

  if (typeof state.selectedShapeName === 'string' && state.selectedShapeName) {
    return state.selectedShapeName;
  }
  return null;
}
