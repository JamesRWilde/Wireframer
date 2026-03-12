import { getDetailModel } from './getDetailModel.js';
import { getMorphNowVertices } from './getMorphNowVertices.js';
import { mapVerticesToTargetOrder } from './mapVerticesToTargetOrder.js';
import { sampleVerticesForMorph } from './sampleVerticesForMorph.js';

import { computeFrameParams } from '../../render/camera/projection/computeFrameParams.js';

export function startMorphToObject(obj, nowMs = performance.now()) {
  const toModel = getDetailModel();
  const fromModel = globalThis.MORPH?.active ? { V: getMorphNowVertices(nowMs), E: [] } : { V: [], E: [] };

  if (toModel === globalThis.BASE_MODEL && Object.isFrozen && !Object.isFrozen(globalThis.BASE_MODEL)) {
    console.warn('[startMorphToObject] BASE_MODEL is not frozen!');
  }

  const meshFromPts = mapVerticesToTargetOrder(fromModel.V, toModel.V);
  const meshModel = {
    V: meshFromPts.map((v) => [v[0], v[1], v[2]]),
    E: toModel.E,
    F: toModel.F,
    _shadingMode: toModel._shadingMode || 'auto',
    _creaseAngleDeg: toModel._creaseAngleDeg,
  };

  const baseCount = Math.max(fromModel.V.length, toModel.V.length, 180);
  const sampleCount = Math.min(globalThis.MORPH_POINT_CAP, baseCount);

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

  console.log(`[startMorphToObject] Morphing to ${obj.name}: V=${toModel.V.length}, E=${toModel.E.length}`);
  const morphParams = computeFrameParams ? computeFrameParams(toModel.V) : { cy: 0, zHalf: 1 };
  if (typeof globalThis.updateHud === 'function') globalThis.updateHud(`${obj.name} (morphing)`, toModel.V.length, toModel.E.length, morphParams.cy, morphParams.zHalf);
}
