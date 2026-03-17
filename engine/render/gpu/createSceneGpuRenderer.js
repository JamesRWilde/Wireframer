// Import shader program creation
// Compiles vertex and fragment shaders for fill and wire rendering
import { createSceneGpuPrograms } from './createSceneGpuPrograms.js';

// Import buffer store creation
// Manages vertex buffers for fill positions, normals, and wire edges
import { createSceneGpuBufferStore } from './createSceneGpuBufferStore.js';

// Import draw API creation
// Provides renderModel and clear functions for WebGL rendering
import { createSceneGpuDraw } from './createSceneGpuDraw.js';

export function createSceneGpuRenderer(canvas) {
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
  
  // Store the WebGL context globally for easy access by clearGpuSceneCanvas
  globalThis.gpuGl = gl;

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

  // Engine-owned mesh only
  return {
    mode: 'gpu-scene',
    renderModel: drawApi.renderModel,
    clear: drawApi.clear,
    dispose() {
      if (shaderPack && typeof shaderPack.dispose === 'function') shaderPack.dispose();
    },
  };
}
