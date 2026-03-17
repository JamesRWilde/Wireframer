import { setGpuEngineRenderModel } from "'../SetGpuEngineRenderModel.js";
import { setGpuEngineClearDraw } from "../setGpuEngineClearDraw.js'";

export function initGpuEngineCreateSceneDraw(gl, canvas, shaderPack, bufferStore) {
  const tmpArrays = {
    tmpLight: new Float32Array(3),
    tmpView: new Float32Array(3),
    tmpShadeDark: new Float32Array(3),
    tmpShadeBright: new Float32Array(3),
    tmpWireNear: new Float32Array(3),
    tmpWireFar: new Float32Array(3),
  };

  return {
    SetGpuEngineRenderModel(model, params) {
      return SetGpuEngineRenderModel(gl, model, params, shaderPack, bufferStore, tmpArrays);
    },
    clear() {
      SetGpuEngineClearDraw(gl, canvas);
    }
  };
}
