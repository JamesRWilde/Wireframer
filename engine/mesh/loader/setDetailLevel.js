export function setDetailLevel(percent, name = 'Shape') {
  if (!globalThis.BASE_MODEL) return;
  const clampedPercent = Math.max(0, Math.min(1, percent));
  globalThis.CURRENT_LOD_VERTS = Math.round(clampedPercent * globalThis.BASE_MODEL.V.length);

  // Use LODManager if available, otherwise fallback to edge collapse
  if (globalThis.LODManager && typeof globalThis.LODManager.decimateMeshByPercent === 'function') {
    globalThis.CURRENT_LOD_MODEL = globalThis.LODManager.decimateMeshByPercent(globalThis.BASE_MODEL, clampedPercent);
  } else if (typeof globalThis.decimateMeshVerticesToCount === 'function') {
    globalThis.CURRENT_LOD_MODEL = globalThis.decimateMeshVerticesToCount(globalThis.BASE_MODEL, clampedPercent * globalThis.BASE_MODEL.V.length);
  } else {
    globalThis.CURRENT_LOD_MODEL = globalThis.BASE_MODEL;
  }

  if (typeof globalThis.setActiveModel === 'function') {
    globalThis.setActiveModel(globalThis.CURRENT_LOD_MODEL, name);
  }
}
