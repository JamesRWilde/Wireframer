/**
 * Returns the GPU buffer set for the given model, creating and caching it if necessary.
 * Buffers are only created once per model instance. Returns null if model is invalid.
 *
 * @param {WebGLRenderingContext} gl - The WebGL context to use for buffer creation.
 * @param {WeakMap} modelCache - WeakMap for model-to-buffer mapping.
 * @param {boolean} supportsUint32 - Whether 32-bit indices are supported.
 * @param {Object} model - The model object containing geometry data.
 * @returns {Object|null} The GPU buffer store for the model, or null if invalid.
 */
import { buildModelBuffers } from '../init/buildModelBuffers.js';

export function getModelBuffers(gl, modelCache, supportsUint32, model) {
  if (!model) return null; // Defensive: must have a model
  let buffers = modelCache.get(model); // Check cache first
  if (!buffers) {
    buffers = buildModelBuffers(gl, model, supportsUint32); // Delegate to helper
    if (buffers) modelCache.set(model, buffers); // Cache for future calls
  }
  return buffers;
}
