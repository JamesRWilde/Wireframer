import { loadObjMeshState } from '@engine/state/mesh/loadObjMeshState.js';

export function setLoadObjMesh(fn) {
  loadObjMeshState.value = fn;
}
