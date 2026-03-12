import { readUiState } from './readUiState.js';
import { clampNumber } from './clampNumber.js';
import {
  lodSlider, fillOpacity, wireOpacity,
  bgDensity, bgVelocity, bgOpacity,
  themeMode,
} from '../dom-state.js';

export function restoreUiState() {
  const state = readUiState();
  if (!state) return null;

  lodSlider.value = String(clampNumber(state.lod, 50, 140, 100));
  fillOpacity.value = String(clampNumber(state.fillOpacity, 0, 100, 0));
  wireOpacity.value = String(clampNumber(state.wireOpacity, 0, 100, 100));
  bgDensity.value = String(clampNumber(state.bgDensity, 0, 220, 100));
  bgVelocity.value = String(clampNumber(state.bgVelocity, 0, 220, 100));
  bgOpacity.value = String(clampNumber(state.bgOpacity, 0, 100, 100));
  if (themeMode) themeMode.value = state.themeMode === 'light' ? 'light' : 'dark';

  if (typeof state.selectedShapeName === 'string' && state.selectedShapeName) {
    return state.selectedShapeName;
  }
  return null;
}
