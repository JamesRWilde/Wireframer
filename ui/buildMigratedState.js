/**
 * buildMigratedState.js - UI State Migration Helper
 *
 * PURPOSE:
 *   Builds a normalized UI state object from potentially legacy state data.
 *   Ensures all expected keys exist and provides safe defaults.
 *
 * ARCHITECTURE ROLE:
 *   Used by restoreUiState to persist a clean, validated state shape back to localStorage.
 *
 * @param {Object} state - Raw state object read from localStorage
 * @returns {Object} Normalized UI state object
 */
import {
  lodSlider,
  fillOpacity,
  wireOpacity,
  bgDensity,
  bgVelocity,
  bgOpacity,
} from './dom-state.js';

export function buildMigratedState(state) {
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
