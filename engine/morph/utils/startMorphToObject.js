/**
 * startMorphToObject.js - Morph to Object Initialization (Legacy API)
 * 
 * PURPOSE:
 *   Starts a morph animation to a target object using the legacy window.MORPH
 *   API. This function sets up the complete morph state including sampled
 *   point sets, vertex mapping, and frame parameters.
 * 
 * ARCHITECTURE ROLE:
 *   Legacy morph initialization function that uses the window.MORPH global.
 *   This predates the newer morphState-based API but is still used in some
 *   code paths for backward compatibility.
 * 
 * HOW IT WORKS:
 *   1. Get current model (or empty if no model loaded)
 *   2. Map source vertices to target order for correspondence
 *   3. Sample point sets from both meshes
 *   4. Set up MORPH global with all necessary state
 *   5. Update HUD to show morphing status
 */

// Import model accessor with LOD fallback
import { getDetailModel } from './getDetailModel.js';

// Import current morph vertex positions (for chaining morphs)
import { getMorphNowVertices } from './getMorphNowVertices.js';

// Import vertex correspondence mapping
import { mapVerticesToTargetOrder } from './mapVerticesToTargetOrder.js';

// Import vertex sampling for point sets
import { sampleVerticesForMorph } from './sampleVerticesForMorph.js';

// Import frame parameter computation for camera fitting
import { computeFrameParams } from '../../render/camera/projection/computeFrameParams.js';

/**
 * startMorphToObject - Starts morph animation to target object
 * 
 * @param {Object} obj - Target object with name property
 * @param {number} [nowMs=performance.now()] - Current timestamp
 * 
 * Sets up window.MORPH with:
 * - Source and target models
 * - Sampled point sets for interpolation
 * - Vertex mapping for correspondence
 * - Frame parameters for camera
 */
export function startMorphToObject(obj, nowMs = performance.now()) {
  // Get target model (current LOD or base model)
  const toModel = getDetailModel();
  
  // Get source model (current morph vertices if morphing, otherwise empty)
  const fromModel = globalThis.MORPH?.active ? { V: getMorphNowVertices(nowMs), E: [] } : { V: [], E: [] };

  // Debug warning if BASE_MODEL is not frozen (should be immutable)
  if (toModel === globalThis.BASE_MODEL && Object.isFrozen && !Object.isFrozen(globalThis.BASE_MODEL)) {
    console.warn('[startMorphToObject] BASE_MODEL is not frozen!');
  }

  // Map source vertices to target order for correspondence
  const meshFromPts = mapVerticesToTargetOrder(fromModel.V, toModel.V);
  
  // Build intermediate mesh model for rendering during morph
  const meshModel = {
    V: meshFromPts.map((v) => [v[0], v[1], v[2]]),
    E: toModel.E,
    F: toModel.F,
    _shadingMode: toModel._shadingMode || 'auto',
    _creaseAngleDeg: toModel._creaseAngleDeg,
  };

  // Calculate sample count (capped by MORPH_POINT_CAP)
  const baseCount = Math.max(fromModel.V.length, toModel.V.length, 180);
  const sampleCount = Math.min(globalThis.MORPH_POINT_CAP, baseCount);

  // Set up MORPH global with complete state
  globalThis.MORPH = {
    active: true,
    startMs: nowMs,
    durationMs: MORPH_DURATION_MS,
    fromModel,
    toModel,
    fromPts: sampleVerticesForMorph(fromModel.V, sampleCount),
    toPts: sampleVerticesForMorph(toModel.V, sampleCount),
    sampleCount,
    targetName: obj.name,
    targetV: toModel.V.length,
    targetE: toModel.E.length,
    targetFrameParams: computeFrameParams ? computeFrameParams(toModel.V) : { cy: 0, zHalf: 1 },
    meshFromPts,
    meshToPts: toModel.V,
    meshModel,
  };

  // Log morph start
  console.log(`[startMorphToObject] Morphing to ${obj.name}: V=${toModel.V.length}, E=${toModel.E.length}`);
  
  // Update HUD to show morphing status
  const morphParams = computeFrameParams ? computeFrameParams(toModel.V) : { cy: 0, zHalf: 1 };
  if (typeof globalThis.updateHud === 'function') globalThis.updateHud(`${obj.name} (morphing)`, toModel.V.length, toModel.E.length, morphParams.cy, morphParams.zHalf);
}
