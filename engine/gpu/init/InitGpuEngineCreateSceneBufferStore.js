
/**
 * Creates a GPU buffer store for a scene model, wiring together one-function-per-file helpers for buffer management.
 *
 * This module maintains a WeakMap cache to avoid redundant buffer creation for the same model instance, improving performance
 * and memory usage. It exposes two methods:
 *
 * - GetGpuEngineModelBuffers(model): Returns the GPU buffer set for the given model, creating and caching it if necessary.
 * - SetGpuEngineUpdateDynamicBuffers(model, buffers): Updates the dynamic fill position and normal buffers for the given model and buffer set.
 *
 * All logic is delegated to single-function helpers to maintain strict one-function-per-file architecture.
 *
 * @param {WebGLRenderingContext} gl - The WebGL context to use for buffer creation.
 * @param {boolean} supportsUint32 - Whether 32-bit indices are supported (for large models).
 * @returns {{ GetGpuEngineModelBuffers: function(Object): Object|null, SetGpuEngineUpdateDynamicBuffers: function(Object, Object): boolean }}
 */
import { GetGpuEngineModelBuffers } from '../get/GetGpuEngineModelBuffers.js';
import { SetGpuEngineUpdateDynamicBuffersStore } from '../set/SetGpuEngineUpdateDynamicBuffersStore.js';

export function InitGpuEngineCreateSceneBufferStore(gl, supportsUint32) {
  // Cache for model-to-buffer mapping. Uses WeakMap so cache is cleaned up when models are GC'd.
  const modelCache = new WeakMap();

  // Expose the buffer API, delegating to one-function-per-file helpers
  return {
    GetGpuEngineModelBuffers: (model) => GetGpuEngineModelBuffers(gl, modelCache, supportsUint32, model),
    SetGpuEngineUpdateDynamicBuffers: (model, buffers) => SetGpuEngineUpdateDynamicBuffersStore(gl, model, buffers)
  };
}
