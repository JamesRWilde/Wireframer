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
import { detailLevel } from '@engine/set/mesh/detailLevel.js';
import { lodRangeForModel } from '@engine/set/mesh/lodRangeForModel.js';
import { capModelForCpu } from '@engine/set/mesh/cpuDetailCap.js';

/**
 * applyCpuLodCap - Applies the CPU LOD cap to the current model
 *
 * Ensures modelState.cpuBaseModel is set and currentLodModel matches
 * the UI detail level slider.
 */
export function applyCpuLodCap() {
  // Use the base model as the source for capping
  const baseModel = modelState.baseModel || modelState.model;
  if (!baseModel) return;

  // Ensure the LOD percentage matches the UI slider/last user setting.
  const detailLevelValue = getDetailLevelValue();
  if (typeof detailLevelValue === 'number') {
    modelState.currentLodPct = Math.max(0, Math.min(1, detailLevelValue));
  }

  // Apply the CPU cap to create a CPU-safe base model
  // This ensures the model respects CPU_MAX_VERTS limit
  modelState.cpuBaseModel = capModelForCpu(baseModel);

  // Update LOD range to reflect the capped model's vertex count in CPU mode
  // This ensures the slider's 100% corresponds to the actual maximum available
  lodRangeForModel(modelState.cpuBaseModel);

  // Recompute current LOD model from capped base
  detailLevel(modelState.currentLodPct);
}
