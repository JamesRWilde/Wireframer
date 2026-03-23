/**
 * setApplyCpuLodCap.js - Apply CPU LOD Cap
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
 * WHY THIS EXISTS:
 *   Ensures CPU rendering uses a predictable capped model to avoid
 *   performance cliff states while keeping LOD behavior centralized.
 *
 * DEPENDENCIES:
 *   - Uses utilCpuDetailCap to create a capped base model
 *   - Uses detailLevel to set the active LOD model
 */

"use strict";

// Import model state — holds the base model and current LOD model
import { modelState } from '@engine/state/render/stateModel.js';
// Import detail level slider getter — reads the current UI slider value
import { getDetailLevelValue } from '@engine/get/render/getDetailLevelValue.js';
// Import detail level setter — decimates the model to the target LOD percentage
import { setDetailLevel } from '@engine/set/mesh/setDetailLevel.js';
// Import LOD range setter — updates the slider range to match the model's vertex count
import { setLodRangeForModel } from '@engine/set/mesh/setLodRangeForModel.js';
// Import CPU cap applier — pre-decimates the model to CPU-safe limits
import { utilCpuDetailCap } from '@engine/util/mesh/utilCpuDetailCap.js';

/**
 * setApplyCpuLodCap - Applies the CPU LOD cap to the current model
 *
 * Ensures modelState.cpuBaseModel is set and currentLodModel matches
 * the UI detail level slider.
 */
export function setApplyCpuLodCap() {
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
  modelState.cpuBaseModel = utilCpuDetailCap(baseModel);

  // Update LOD range to reflect the capped model's vertex count in CPU mode
  // This ensures the slider's 100% corresponds to the actual maximum available
  setLodRangeForModel(modelState.cpuBaseModel);

  // Recompute current LOD model from capped base
  setDetailLevel(modelState.currentLodPct);
}
