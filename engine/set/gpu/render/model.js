import { sceneModel } from "'./sceneModel.js'";

export function model(gl, model, params, shaderPack, bufferStore, tmpArrays) {
  return SetGpuEngineRenderSceneModel(gl, model, params, shaderPack, bufferStore, tmpArrays);
}
