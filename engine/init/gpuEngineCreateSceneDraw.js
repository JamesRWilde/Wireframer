import { gpuEngineRenderModel } from "'../SetGpuEngineRenderModel.js";
import { gpuEngineClearDraw } from "../gpuEngineClearDraw.js'";

export function gpuEngineCreateSceneDraw(gl, canvas, shaderPack, bufferStore) {
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
