import { setDetailLevel } from './setDetailLevel.js';

export function finalizeModel(newModelCopy, animateMorph, name, detailLevel) {
  const oldModel = globalThis.MODEL;
  // Only morph if we have an existing model to morph from
  if (animateMorph && oldModel?.V?.length && globalThis.morph?.startMorph) {
    globalThis.morph.startMorph(oldModel, newModelCopy, globalThis.MORPH_DURATION_MS, () =>
      globalThis.setActiveModel(newModelCopy, name)
    );
  } else {
    globalThis.BASE_MODEL = newModelCopy;
    setDetailLevel(detailLevel, name);
  }
}
