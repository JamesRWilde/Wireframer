// Import shader program creation
// Compiles vertex and fragment shaders for fill and wire rendering
import { scenePrograms }from '@engine/init/gpu/create/scenePrograms.js';

// Import buffer store creation
// Manages vertex buffers for fill positions, normals, and wire edges
import { sceneBufferStore }from '@engine/init/gpu/create/sceneBufferStore.js';

// Import draw API creation
// Provides model and clear functions for WebGL rendering
import { sceneDraw }from '@engine/init/gpu/create/sceneDraw.js';

export function sceneRenderer(canvas) {
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
  
  // Store the WebGL context globally for easy access by sceneCanvas
  globalThis.gpuGl = gl;

  const supportsUint32 = !!gl.getExtension('OES_element_index_uint') ||
    (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext);

  let shaderPack;
  try {
    shaderPack = scenePrograms(gl);
  } catch (err) {
    console.warn(err);
    return null;
  }

  const bufferStore = sceneBufferStore(gl, supportsUint32);
  const drawApi = sceneDraw(gl, canvas, shaderPack, bufferStore);

  // Engine-owned mesh only
  return {
    mode: 'gpu-scene',
    model: drawApi.model,
    clear: drawApi.clear,
    dispose() {
      if (shaderPack && typeof shaderPack.dispose === 'function') shaderPack.dispose();
    },
  };
}
