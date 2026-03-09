'use strict';

const UI_STATE_KEY = 'wireframer.uiState';

function mapDensitySliderScale(rawPercent) {
  const p = Math.max(0, rawPercent);
  if (p <= 1) return p * 2.4;
  return 2.4 + (p - 1) * 2.2;
}

function mapVelocitySliderScale(rawPercent) {
  const p = Math.max(0, rawPercent);
  if (p <= 1) return p * 2.8;
  return 2.8 + (p - 1) * 2.4;
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function sliderDisplayPercent(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = Number(slider.value);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(value)) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
}

function readUiState() {
  try {
    const saved = localStorage.getItem(UI_STATE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function persistUiState() {
  const selectedIndex = Number(select.value);
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

function restoreUiState() {
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

function syncRenderToggles() {
  window.DETAIL_LEVEL = Number(lodSlider.value) / 100;
  lodValue.textContent = `${sliderDisplayPercent(lodSlider)}%`;

  const bgDensityRaw = Number(bgDensity.value) / 100;
  const bgDensityLevel = mapDensitySliderScale(bgDensityRaw);
  setBackgroundParticleDensity(bgDensityLevel);
  bgDensityValue.textContent = `${sliderDisplayPercent(bgDensity)}%`;

  const bgVelocityRaw = Number(bgVelocity.value) / 100;
  const bgVelocityLevel = mapVelocitySliderScale(bgVelocityRaw);
  setBackgroundParticleVelocity(bgVelocityLevel);
  bgVelocityValue.textContent = `${sliderDisplayPercent(bgVelocity)}%`;

  const bgOpacityLevel = Number(bgOpacity.value) / 100;
  setBackgroundParticleOpacity(bgOpacityLevel);
  bgOpacityValue.textContent = `${Math.round(bgOpacityLevel * 100)}%`;

  FILL_OPACITY = Number(fillOpacity.value) / 100;
  fillOpacityValue.textContent = `${Math.round(FILL_OPACITY * 100)}%`;
  WIRE_OPACITY = Number(wireOpacity.value) / 100;
  wireOpacityValue.textContent = `${Math.round(WIRE_OPACITY * 100)}%`;

  persistUiState();
}

function initObjectSelector() {
  select.innerHTML = '';
  // OBJECTS is populated by loader.js using mesh-manifest.json only
  OBJECTS.forEach((obj, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = obj.name;
    select.appendChild(opt);
  });
  select.onchange = () => {
    persistUiState();
    startMorphToObject(OBJECTS[select.selectedIndex]);
  };
  lodSlider.oninput = () => {
    syncRenderToggles();
    if (!OBJECTS.length) return;
    MODEL_CACHE.clear(); // Force recalc for new detail level
    startMorphToObject(OBJECTS[select.selectedIndex]);
  };
  lodSlider.onchange = lodSlider.oninput;
  fillOpacity.oninput = syncRenderToggles;
  fillOpacity.onchange = syncRenderToggles;
  wireOpacity.oninput = syncRenderToggles;
  wireOpacity.onchange = syncRenderToggles;
  bgDensity.oninput = syncRenderToggles;
  bgDensity.onchange = syncRenderToggles;
  bgVelocity.oninput = syncRenderToggles;
  bgVelocity.onchange = syncRenderToggles;
  bgOpacity.oninput = syncRenderToggles;
  bgOpacity.onchange = syncRenderToggles;
  if (themeMode) {
    themeMode.oninput = () => {
      setThemeMode(themeMode.value, { apply: true });
      persistUiState();
    };
    themeMode.onchange = themeMode.oninput;
  }
  initPresetSwatches();

  const onCustomInput = () => {
    setCustomRgb(getCustomRgbFromInputs(), {
      persist: true,
      apply: true,
    });
  };

  for (const input of [customRed, customGreen, customBlue]) {
    if (!input) continue;
    input.oninput = onCustomInput;
    input.onchange = onCustomInput;
  }

  CUSTOM_RGB = readCustomRgb();
  const selectedShapeName = restoreUiState();
  setThemeMode(themeMode ? themeMode.value : 'dark', { apply: false });
  setCustomRgb(CUSTOM_RGB, { persist: false, apply: true });
  syncRenderToggles();

  if (!OBJECTS.length) {
    document.getElementById('obj-label').textContent = 'No objects loaded';
    document.getElementById('stat-v').textContent = '--';
    document.getElementById('stat-e').textContent = '--';
    return;
  }

  let selectedIndex = 0;
  if (selectedShapeName) {
    const found = OBJECTS.findIndex((obj) => obj.name === selectedShapeName);
    if (found >= 0) selectedIndex = found;
  }

  select.value = String(selectedIndex);
  loadObject(OBJECTS[selectedIndex]); // Initial load: do NOT morph on first load
  persistUiState();
}
