import { readUiState } from './readUiState.js';
import { clampNumber } from './clampNumber.js';
const UI_STATE_KEY = 'wireframer.uiState';

import {
  lodSlider, fillOpacity, wireOpacity,
  bgDensity, bgVelocity, bgOpacity,
  themeMode,
} from '../dom-state.js';
export function restoreUiState() {
  const state = readUiState();
  if (!state) return null;

  // only touch sliders if the property was actually stored; older
  // payloads may only contain density/velocity or custom RGB values and
  // we don't want to clobber the defaults (100% opacity) in those cases.
  if ('lod' in state) lodSlider.value = String(clampNumber(state.lod, 50, 140, 100));
  if ('fillOpacity' in state) fillOpacity.value = String(clampNumber(state.fillOpacity, 0, 100, 0));
  if ('wireOpacity' in state) wireOpacity.value = String(clampNumber(state.wireOpacity, 0, 100, 100));
  if ('bgDensity' in state) bgDensity.value = String(clampNumber(state.bgDensity, 0, 220, 100));
  if ('bgVelocity' in state) bgVelocity.value = String(clampNumber(state.bgVelocity, 0, 220, 100));
  if ('bgOpacity' in state) bgOpacity.value = String(clampNumber(state.bgOpacity, 0, 100, 100));
  if (themeMode && 'themeMode' in state) themeMode.value = state.themeMode === 'light' ? 'light' : 'dark';

  // if we restored values but some newer properties were missing, write
  // the expanded payload back to storage so subsequent loads are complete.
  // missing numbers default to the current slider element value (which has
  // been pre‑initialized to 100%) so we don't lose track of opacity settings.
  try {
    const migrated = {
      selectedShapeName: state.selectedShapeName || null,
      themeMode: state.themeMode || 'dark',
      lod: ('lod' in state) ? state.lod : Number(lodSlider.value),
      fillOpacity: ('fillOpacity' in state) ? state.fillOpacity : Number(fillOpacity.value),
      wireOpacity: ('wireOpacity' in state) ? state.wireOpacity : Number(wireOpacity.value),
      bgDensity: ('bgDensity' in state) ? state.bgDensity : Number(bgDensity.value),
      bgVelocity: ('bgVelocity' in state) ? state.bgVelocity : Number(bgVelocity.value),
      bgOpacity: ('bgOpacity' in state) ? state.bgOpacity : Number(bgOpacity.value),
    };
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(migrated));
    try { localStorage.removeItem('undefined'); } catch {}
  } catch {}

  if (typeof state.selectedShapeName === 'string' && state.selectedShapeName) {
    return state.selectedShapeName;
  }
  return null;
}
