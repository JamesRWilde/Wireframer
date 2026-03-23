
/**
 * Creates a GPU buffer store for a scene model, wiring together one-function-per-file helpers for buffer management.
 *
 * This module maintains a WeakMap cache to avoid redundant buffer creation for the same model instance, improving performance
 * and memory usage. It exposes two methods:
 *
 * - utilModelBuffers(model): Returns the GPU buffer set for the given model, creating and caching it if necessary.
 * All logic is delegated to single-function helpers to maintain strict one-function-per-file architecture.
 *
 * @param {WebGLRenderingContext} gl - The WebGL context to use for buffer creation.
 * @param {boolean} supportsUint32 - Whether 32-bit indices are supported (for large models).
 * @returns {{ utilModelBuffers: function(Object): Object|null }}
 */
import { utilModelBuffers }from '@engine/util/gpu/utilModelBuffers.js';

export function createSceneBufferStore(gl, supportsUint32) {
  // Cache for model-to-buffer mapping. Uses WeakMap so cache is cleaned up when models are GC'd.
  const modelCache = new WeakMap();

  // Expose the buffer API, delegating to one-function-per-file helpers
  return {
    modelBuffers: (model) => utilModelBuffers(gl, modelCache, supportsUint32, model),
  };
}
