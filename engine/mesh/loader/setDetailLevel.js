import { decimateMeshByPercent } from '../lod/decimateMeshByPercent.js';

export function setDetailLevel(percent, name = 'Shape') {
  if (!globalThis.BASE_MODEL) return;
  const clampedPercent = Math.max(0, Math.min(1, percent));
  globalThis.CURRENT_LOD_VERTS = Math.round(clampedPercent * globalThis.BASE_MODEL.V.length);
  globalThis.CURRENT_LOD_MODEL = decimateMeshByPercent(globalThis.BASE_MODEL, clampedPercent);

  if (typeof globalThis.setActiveModel === 'function') {
    globalThis.setActiveModel(globalThis.CURRENT_LOD_MODEL, name);
  }
}

// Expose globally for UI slider handler
globalThis.setDetailLevel = setDetailLevel;
