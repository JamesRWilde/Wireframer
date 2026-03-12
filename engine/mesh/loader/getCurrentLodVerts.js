export function getCurrentLodVerts() {
  return globalThis.CURRENT_LOD_VERTS || (globalThis.BASE_MODEL ? globalThis.BASE_MODEL.V.length : 0);
}
