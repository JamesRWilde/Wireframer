import { renderModel } from "../renderModel.js";
import { clearGpuDraw } from "../clearGpuDraw.js";

export function createSceneGpuDraw(gl, canvas, shaderPack, bufferStore) {
  const tmpArrays = {
    tmpLight: new Float32Array(3),
    tmpView: new Float32Array(3),
    tmpShadeDark: new Float32Array(3),
    tmpShadeBright: new Float32Array(3),
    tmpWireNear: new Float32Array(3),
    tmpWireFar: new Float32Array(3),
  };

  return {
    renderModel(model, params) {
      return renderModel(gl, model, params, shaderPack, bufferStore, tmpArrays);
    },
    clear() {
      clearGpuDraw(gl, canvas);
    }
  };
}
