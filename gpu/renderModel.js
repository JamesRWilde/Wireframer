import { renderSceneModel } from "./renderSceneModel.js";

export function renderModel(gl, model, params, shaderPack, bufferStore, tmpArrays) {
  return renderSceneModel(gl, model, params, shaderPack, bufferStore, tmpArrays);
}
