/**
 * SetUiSyncRenderToggles.js - Render Control Sync
 *
 * PURPOSE:
 *   Syncs UI slider values for rendering options (LOD, opacity, particle density, etc.)
 *   into global runtime state and updates their displayed percentages.
 *
 * ARCHITECTURE ROLE:
 *   Called whenever the render control sliders change (or during initialization)
 *   to keep the UI and global rendering configuration in sync.
 *
 * DATA FORMAT:
 *   - Global state values are stored as 0-1 percentages (e.g., 0.75 for 75%).
 */

"use strict";

from '@ui/state/dom.js';
import { sliderDisplayPercent }from '@ui/get/sliderDisplayPercent.js';
import { state }from '@ui/get/Read/state.js';

export function syncRenderToggles() {
  globalThis.DETAIL_LEVEL = Number(lodSlider.value) / 100;
  lodValue.textContent = `${GetUiSliderDisplayPercent(lodSlider)}%`;

  const rawDensity = Number(bgDensity.value);
  const densityPct = rawDensity / 100;
  globalThis.BG_PARTICLE_DENSITY_PCT = densityPct;
  bgDensityValue.textContent = `${GetUiSliderDisplayPercent(bgDensity)}%`;

  const rawVelocity = Number(bgVelocity.value);
  const velocityPct = rawVelocity / 100;
  globalThis.BG_PARTICLE_VELOCITY_PCT = velocityPct;
  bgVelocityValue.textContent = `${GetUiSliderDisplayPercent(bgVelocity)}%`;

  const rawOpacity = Number(bgOpacity.value);
  const opacityPct = rawOpacity / 100;
  globalThis.BG_PARTICLE_OPACITY_PCT = opacityPct;
  bgOpacityValue.textContent = `${Math.round(opacityPct * 100)}%`;

  globalThis.FILL_OPACITY = Number(fillOpacity.value) / 100;
  fillOpacityValue.textContent = `${Math.round(globalThis.FILL_OPACITY * 100)}%`;
  globalThis.WIRE_OPACITY = Number(wireOpacity.value) / 100;
  wireOpacityValue.textContent = `${Math.round(globalThis.WIRE_OPACITY * 100)}%`;
  if (globalThis.DEBUG_LOG_TOGGLES) {
    console.debug('[SetUiSyncRenderToggles] FILL_OPACITY', globalThis.FILL_OPACITY,
                  'WIRE_OPACITY', globalThis.WIRE_OPACITY);
  }

  SetUiPersistState();
}
