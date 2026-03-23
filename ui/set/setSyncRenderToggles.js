/**
 * syncRenderToggles.js - Render Control Sync
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

import {lodSlider, lodValue, bgDensity, bgDensityValue, bgVelocity, bgVelocityValue, bgOpacity, bgOpacityValue, fillOpacity, fillOpacityValue, wireOpacity, wireOpacityValue}from '@ui/state/dom.js';
import { getSliderDisplayPercent }from '@ui/get/getSliderDisplayPercent.js';
import { setPersistedState as persistState }from '@ui/set/persist/setState.js';
import { setFillOpacity } from '@engine/set/render/setFillOpacity.js';
import { setWireOpacity } from '@engine/set/render/setWireOpacity.js';
import { setDetailLevelValue } from '@engine/set/render/setDetailLevelValue.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

export function setSyncRenderToggles() {
  setDetailLevelValue(Number(lodSlider.value) / 100);
  lodValue.textContent = `${getSliderDisplayPercent(lodSlider)}%`;

  const rawDensity = Number(bgDensity.value);
  const densityPct = rawDensity / 100;
  bgState.densityPct = densityPct;
  bgDensityValue.textContent = `${getSliderDisplayPercent(bgDensity)}%`;

  const rawVelocity = Number(bgVelocity.value);
  const velocityPct = rawVelocity / 100;
  bgState.velocityPct = velocityPct;
  bgVelocityValue.textContent = `${getSliderDisplayPercent(bgVelocity)}%`;

  const rawOpacity = Number(bgOpacity.value);
  const opacityPct = rawOpacity / 100;
  bgState.opacityPct = opacityPct;
  bgOpacityValue.textContent = `${Math.round(opacityPct * 100)}%`;

  const fillOp = Number(fillOpacity.value) / 100;
  setFillOpacity(fillOp);
  fillOpacityValue.textContent = `${Math.round(fillOp * 100)}%`;

  const wireOp = Number(wireOpacity.value) / 100;
  setWireOpacity(wireOp);
  wireOpacityValue.textContent = `${Math.round(wireOp * 100)}%`;

  persistState();
}
