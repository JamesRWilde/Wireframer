/**
 * applyCpuLodCap.js - Apply CPU LOD Cap
 *
 * PURPOSE:
 *   Ensures the CPU rendering pipeline has an appropriately capped model
 *   for performance. This is called during CPU pipeline initialization
 *   and when switching to CPU mode.
 *
 * ARCHITECTURE ROLE:
 *   Setter module in engine/set/mesh/. Modifies modelState to apply
 *   the CPU detail cap and sets the current LOD model.
 *
 * DEPENDENCIES:
 *   - Uses capModelForCpu to create a capped base model
 *   - Uses detailLevel to set the active LOD model
 */

"use strict";

import { modelState } from '@engine/state/render/model.js';
import { getDetailLevelValue } from '@engine/get/render/getDetailLevelValue.js';
import { capModelForCpu } from '@engine/set/mesh/cpuDetailCap.js';
import { detailLevel } from '@engine/set/mesh/detailLevel.js';

/**
 * applyCpuLodCap - Applies the CPU LOD cap to the current model
 *
 * Ensures modelState.cpuBaseModel is set and currentLodModel matches
 * the UI detail level slider.
 */
export function applyCpuLodCap() {
  // Use the base model if set, otherwise fall back to the active model.
  const baseModel = modelState.baseModel || modelState.model;
  if (!baseModel) return;

  // Ensure the LOD percentage matches the UI slider/last user setting.
  const detailLevelValue = getDetailLevelValue();
  if (typeof detailLevelValue === 'number') {
    modelState.currentLodPct = Math.max(0, Math.min(1, detailLevelValue));
  }

  // Recalculate the capped model (only decimates if over the cap)
  modelState.cpuBaseModel = capModelForCpu(baseModel);

  // Recompute current LOD model from capped base
  detailLevel(modelState.currentLodPct);
}
