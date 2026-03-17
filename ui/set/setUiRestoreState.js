/**
 * SetUiRestoreState.js - Restore UI Control State
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

import { getUiReadState } from '../get/getUiReadState.js';
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
} from '../state/stateUiDom.js';

const UI_STATE_KEY = 'wireframer.uiState';

export function setUiRestoreState() {
  const state = GetUiReadState();
  if (!state) return null;

  SetUiApplyClampedValue({ state, key: 'lod', element: lodSlider, min: 50, max: 140, defaultValue: 100 });
  SetUiApplyClampedValue({ state, key: 'fillOpacity', element: fillOpacity, min: 0, max: 100, defaultValue: 0 });
  SetUiApplyClampedValue({ state, key: 'wireOpacity', element: wireOpacity, min: 0, max: 100, defaultValue: 100 });
  SetUiApplyClampedValue({ state, key: 'bgDensity', element: bgDensity, min: 0, max: 220, defaultValue: 100 });
  SetUiApplyClampedValue({ state, key: 'bgVelocity', element: bgVelocity, min: 0, max: 220, defaultValue: 100 });
  SetUiApplyClampedValue({ state, key: 'bgOpacity', element: bgOpacity, min: 0, max: 100, defaultValue: 100 });
  SetUiApplyThemeMode(state);

  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(InitUiBuildMigratedState(state)));
    try { localStorage.removeItem('undefined'); } catch {}
  } catch {}

  if (typeof state.selectedShapeName === 'string' && state.selectedShapeName) {
    return state.selectedShapeName;
  }
  return null;
}
