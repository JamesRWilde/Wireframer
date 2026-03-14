/**
 * persistUiState.js - Persist UI Control State
 *
 * PURPOSE:
 *   Saves the current state of UI controls (sliders, theme mode, selected shape)
 *   into localStorage so it can be restored on next load.
 *
 * ARCHITECTURE ROLE:
 *   Called whenever UI controls change to keep the user's preferences persistent.
 *
 * DATA FORMAT:
 *   - Stores a JSON object with keys like selectedShapeName, themeMode, lod, fillOpacity, etc.
 */

"use strict";

import { OBJECTS } from '../../loader/objectList.js';
const UI_STATE_KEY = 'wireframer.uiState';

import {
  themeMode,
  lodSlider,
  fillOpacity,
  wireOpacity,
  bgDensity,
  bgVelocity,
  bgOpacity,
} from '../dom-state.js';

export function persistUiState() {
  const select = document.getElementById('obj-select');
  const selectedIndex = Number(select ? select.value : Number.NaN);
  const selectedObject = Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < OBJECTS.length
    ? OBJECTS[selectedIndex]
    : null;

  const payload = {
    selectedShapeName: selectedObject ? selectedObject.name : null,
    themeMode: themeMode ? themeMode.value : 'dark',
    lod: Number(lodSlider.value),
    fillOpacity: Number(fillOpacity.value),
    wireOpacity: Number(wireOpacity.value),
    bgDensity: Number(bgDensity.value),
    bgVelocity: Number(bgVelocity.value),
    bgOpacity: Number(bgOpacity.value),
  };

  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore localStorage failures (private mode/quota).
  }
}
