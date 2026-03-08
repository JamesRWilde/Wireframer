'use strict';

function createSceneGpuRenderer(canvas) {
  if (!canvas) return null;

  const glOpts = {
    alpha: true,
    antialias: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    desynchronized: true,
    powerPreference: 'high-performance',
  };

  const gl =
    canvas.getContext('webgl2', glOpts) ||
    canvas.getContext('webgl', glOpts) ||
    canvas.getContext('experimental-webgl', glOpts);

  if (!gl) return null;

  const supportsUint32 = !!gl.getExtension('OES_element_index_uint') ||
    (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext);

  let shaderPack;
  try {
    shaderPack = createSceneGpuPrograms(gl);
  } catch (err) {
    console.warn(err);
    return null;
  }

  const bufferStore = createSceneGpuBufferStore(gl, supportsUint32);
  const drawApi = createSceneGpuDraw(gl, canvas, shaderPack, bufferStore);

  return {
    mode: 'gpu-scene',
    renderModel: drawApi.renderModel,
    clear: drawApi.clear,
    dispose() {
      if (shaderPack && typeof shaderPack.dispose === 'function') shaderPack.dispose();
    },
  };
}
