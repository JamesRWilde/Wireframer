export function setLodRangeForModel(model) {
  globalThis.LOD_RANGE = {
    min: globalThis.LODManager?.MIN_VERTS ?? 3,
    max: model.V.length,
  };
}
