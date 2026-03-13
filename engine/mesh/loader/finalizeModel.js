import { setDetailLevel } from './setDetailLevel.js';

export function finalizeModel(newModelCopy, animateMorph, name, detailLevel) {
  const oldModel = globalThis.MODEL;
  // Always set BASE_MODEL so LOD slider works after morph completes
  globalThis.BASE_MODEL = newModelCopy;
  // Only morph if we have an existing model to morph from
  if (animateMorph && oldModel?.V?.length && globalThis.morph?.startMorph) {
    globalThis.morph.startMorph(oldModel, newModelCopy, globalThis.MORPH_DURATION_MS, () => {
      setDetailLevel(detailLevel, name);
    });
  } else {
    setDetailLevel(detailLevel, name);
  }
}
