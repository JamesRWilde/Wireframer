import { sceneModel } from '@engine/set/gpu/render/sceneModel.js';

export function model(gl, model, params, shaderPack, bufferStore, tmpArrays) {
  return SetGpuEngineRenderSceneModel(gl, model, params, shaderPack, bufferStore, tmpArrays);
}
