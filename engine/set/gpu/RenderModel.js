import { gpuEngineRenderSceneModel } from "'./gpuEngineRenderSceneModel.js'";

export function gpuEngineRenderModel(gl, model, params, shaderPack, bufferStore, tmpArrays) {
  return SetGpuEngineRenderSceneModel(gl, model, params, shaderPack, bufferStore, tmpArrays);
}
