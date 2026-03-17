import { model } from '@engine/set/gpu/render/model.js';
import { draw } from '@engine/set/gpu/clear/draw.js';

export function sceneDraw(gl, canvas, shaderPack, bufferStore) {
  const tmpArrays = {
    tmpLight: new Float32Array(3),
    tmpView: new Float32Array(3),
    tmpShadeDark: new Float32Array(3),
    tmpShadeBright: new Float32Array(3),
    tmpWireNear: new Float32Array(3),
    tmpWireFar: new Float32Array(3),
  };

  return {
    model(model, params) {
      return model(gl, model, params, shaderPack, bufferStore, tmpArrays);
    },
    clear() {
      draw(gl, canvas);
    }
  };
}
