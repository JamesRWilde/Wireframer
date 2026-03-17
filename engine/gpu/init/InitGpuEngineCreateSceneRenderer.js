// Import shader program creation
// Compiles vertex and fragment shaders for fill and wire rendering
import { InitGpuEngineCreateScenePrograms } from './InitGpuEngineCreateScenePrograms.js';

// Import buffer store creation
// Manages vertex buffers for fill positions, normals, and wire edges
import { InitGpuEngineCreateSceneBufferStore } from './InitGpuEngineCreateSceneBufferStore.js';

// Import draw API creation
// Provides SetGpuEngineRenderModel and clear functions for WebGL rendering
import { InitGpuEngineCreateSceneDraw } from './InitGpuEngineCreateSceneDraw.js';

export function InitGpuEngineCreateSceneRenderer(canvas) {
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
  
  // Store the WebGL context globally for easy access by SetGpuEngineClearSceneCanvas
  globalThis.gpuGl = gl;

  const supportsUint32 = !!gl.getExtension('OES_element_index_uint') ||
    (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext);

  let shaderPack;
  try {
    shaderPack = InitGpuEngineCreateScenePrograms(gl);
  } catch (err) {
    console.warn(err);
    return null;
  }

  const bufferStore = InitGpuEngineCreateSceneBufferStore(gl, supportsUint32);
  const drawApi = InitGpuEngineCreateSceneDraw(gl, canvas, shaderPack, bufferStore);

  // Engine-owned mesh only
  return {
    mode: 'gpu-scene',
    SetGpuEngineRenderModel: drawApi.SetGpuEngineRenderModel,
    clear: drawApi.clear,
    dispose() {
      if (shaderPack && typeof shaderPack.dispose === 'function') shaderPack.dispose();
    },
  };
}
