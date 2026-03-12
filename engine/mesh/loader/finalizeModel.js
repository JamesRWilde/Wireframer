import { setDetailLevel } from './setDetailLevel.js';

export function finalizeModel(newModelCopy, animateMorph, name, detailLevel) {
  if (animateMorph && globalThis.morph?.startMorph) {
    const oldModel = globalThis.MODEL;
    globalThis.morph.startMorph(oldModel, newModelCopy, globalThis.MORPH_DURATION_MS, () =>
      globalThis.setActiveModel(newModelCopy, name)
    );
  } else {
    globalThis.BASE_MODEL = newModelCopy;
    setDetailLevel(detailLevel, name);
  }
}
