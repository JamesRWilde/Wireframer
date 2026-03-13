import {
  lodSlider, lodValue,
  bgDensity, bgDensityValue,
  bgVelocity, bgVelocityValue,
  bgOpacity, bgOpacityValue,
  fillOpacity, fillOpacityValue,
  wireOpacity, wireOpacityValue,
} from '../dom-state.js';
import { sliderDisplayPercent } from './sliderDisplayPercent.js';
import { persistUiState } from './persistUiState.js';

export function syncRenderToggles() {
  globalThis.DETAIL_LEVEL = Number(lodSlider.value) / 100;
  lodValue.textContent = `${sliderDisplayPercent(lodSlider)}%`;

  const rawDensity = Number(bgDensity.value);
  const densityPct = rawDensity / 100;
  globalThis.BG_PARTICLE_DENSITY_PCT = densityPct;
  bgDensityValue.textContent = `${sliderDisplayPercent(bgDensity)}%`;

  const rawVelocity = Number(bgVelocity.value);
  const velocityPct = rawVelocity / 100;
  globalThis.BG_PARTICLE_VELOCITY_PCT = velocityPct;
  bgVelocityValue.textContent = `${sliderDisplayPercent(bgVelocity)}%`;

  const rawOpacity = Number(bgOpacity.value);
  const opacityPct = rawOpacity / 100;
  globalThis.BG_PARTICLE_OPACITY_PCT = opacityPct;
  bgOpacityValue.textContent = `${Math.round(opacityPct * 100)}%`;

  globalThis.FILL_OPACITY = Number(fillOpacity.value) / 100;
  fillOpacityValue.textContent = `${Math.round(globalThis.FILL_OPACITY * 100)}%`;
  globalThis.WIRE_OPACITY = Number(wireOpacity.value) / 100;
  wireOpacityValue.textContent = `${Math.round(globalThis.WIRE_OPACITY * 100)}%`;
  if (globalThis.DEBUG_LOG_TOGGLES) {
    console.debug('[syncRenderToggles] FILL_OPACITY', globalThis.FILL_OPACITY,
                  'WIRE_OPACITY', globalThis.WIRE_OPACITY);
  }

  persistUiState();
}
