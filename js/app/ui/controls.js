'use strict';

function syncRenderToggles() {
  DETAIL_LEVEL = Number(lodSlider.value) / 100;
  lodValue.textContent = `${Math.round(DETAIL_LEVEL * 100)}%`;
  FILL_OPACITY = Number(fillOpacity.value) / 100;
  fillOpacityValue.textContent = `${Math.round(FILL_OPACITY * 100)}%`;
  WIRE_OPACITY = Number(wireOpacity.value) / 100;
  wireOpacityValue.textContent = `${Math.round(WIRE_OPACITY * 100)}%`;
}

function initObjectSelector() {
  select.innerHTML = '';

  OBJECTS.forEach((obj, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = obj.name;
    select.appendChild(opt);
  });

  select.onchange = () => startMorphToObject(OBJECTS[+select.value]);
  lodSlider.oninput = () => {
    syncRenderToggles();
    if (!OBJECTS.length) return;
    loadObject(OBJECTS[+select.value]);
  };
  lodSlider.onchange = lodSlider.oninput;
  fillOpacity.oninput = syncRenderToggles;
  fillOpacity.onchange = syncRenderToggles;
  wireOpacity.oninput = syncRenderToggles;
  wireOpacity.onchange = syncRenderToggles;
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
  setCustomRgb(CUSTOM_RGB, { persist: false, apply: true });
  syncRenderToggles();

  if (!OBJECTS.length) {
    document.getElementById('obj-label').textContent = 'No objects loaded';
    document.getElementById('stat-v').textContent = '--';
    document.getElementById('stat-e').textContent = '--';
    return;
  }

  loadObject(OBJECTS[0]);
}
