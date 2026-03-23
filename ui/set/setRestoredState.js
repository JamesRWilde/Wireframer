/**
 * restoreState.js - Restore UI Control State
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

import { getUiState }from '@ui/get/read/getState.js';
import { applyThemeMode }from '@ui/set/apply/applyThemeMode.js';
import { setClampedValue }from '@ui/set/apply/setClampedValue.js';
import { bldMigratedState }from '@ui/init/bldMigratedState.js';
import {select,themeModeEl,lodSlider,bgDensity,bgVelocity,bgOpacity,fillOpacity,wireOpacity} from '@ui/state/dom.js';

const UI_STATE_KEY = 'wireframer.uiState';

export function setRestoredState() {
  const savedState = getUiState();
  if (!savedState) return null;

  setClampedValue({ state: savedState, key: 'lod', element: lodSlider, min: 50, max: 140, defaultValue: 100 });
  setClampedValue({ state: savedState, key: 'fillOpacity', element: fillOpacity, min: 0, max: 100, defaultValue: 0 });
  setClampedValue({ state: savedState, key: 'wireOpacity', element: wireOpacity, min: 0, max: 100, defaultValue: 100 });
  setClampedValue({ state: savedState, key: 'bgDensity', element: bgDensity, min: 0, max: 220, defaultValue: 100 });
  setClampedValue({ state: savedState, key: 'bgVelocity', element: bgVelocity, min: 0, max: 220, defaultValue: 100 });
  setClampedValue({ state: savedState, key: 'bgOpacity', element: bgOpacity, min: 0, max: 100, defaultValue: 100 });
  applyThemeMode(savedState);

  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(bldMigratedState(savedState)));
    try { localStorage.removeItem('undefined'); } catch {}
  } catch {}

  if (typeof savedState.selectedShapeName === 'string' && savedState.selectedShapeName) {
    return savedState.selectedShapeName;
  }
  return null;
}
