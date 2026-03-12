import { OBJECTS } from '../../loader/objectList.js';
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
