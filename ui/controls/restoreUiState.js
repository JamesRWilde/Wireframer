import { readUiState } from './readUiState.js';
import { clampNumber } from './clampNumber.js';
const UI_STATE_KEY = 'wireframer.uiState';

import {
  lodSlider,
  fillOpacity,
  wireOpacity,
  bgDensity,
  bgVelocity,
  bgOpacity,
  themeMode,
} from '../dom-state.js';

function applyClampedValue({ state, key, element, min, max, defaultValue }) {
  if (!(key in state) || !element) return;
  element.value = String(clampNumber(state[key], min, max, defaultValue));
}

function applyThemeMode(state) {
  if (!themeMode || !('themeMode' in state)) return;
  themeMode.value = state.themeMode === 'light' ? 'light' : 'dark';
}

function buildMigratedState(state) {
  return {
    selectedShapeName: state.selectedShapeName || null,
    themeMode: state.themeMode || 'dark',
    lod: 'lod' in state ? state.lod : Number(lodSlider.value),
    fillOpacity: 'fillOpacity' in state ? state.fillOpacity : Number(fillOpacity.value),
    wireOpacity: 'wireOpacity' in state ? state.wireOpacity : Number(wireOpacity.value),
    bgDensity: 'bgDensity' in state ? state.bgDensity : Number(bgDensity.value),
    bgVelocity: 'bgVelocity' in state ? state.bgVelocity : Number(bgVelocity.value),
    bgOpacity: 'bgOpacity' in state ? state.bgOpacity : Number(bgOpacity.value),
  };
}

export function restoreUiState() {
  const state = readUiState();
  if (!state) return null;

  applyClampedValue({ state, key: 'lod', element: lodSlider, min: 50, max: 140, defaultValue: 100 });
  applyClampedValue({ state, key: 'fillOpacity', element: fillOpacity, min: 0, max: 100, defaultValue: 0 });
  applyClampedValue({ state, key: 'wireOpacity', element: wireOpacity, min: 0, max: 100, defaultValue: 100 });
  applyClampedValue({ state, key: 'bgDensity', element: bgDensity, min: 0, max: 220, defaultValue: 100 });
  applyClampedValue({ state, key: 'bgVelocity', element: bgVelocity, min: 0, max: 220, defaultValue: 100 });
  applyClampedValue({ state, key: 'bgOpacity', element: bgOpacity, min: 0, max: 100, defaultValue: 100 });
  applyThemeMode(state);

  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(buildMigratedState(state)));
    try { localStorage.removeItem('undefined'); } catch {}
  } catch {}

  if (typeof state.selectedShapeName === 'string' && state.selectedShapeName) {
    return state.selectedShapeName;
  }
  return null;
}
