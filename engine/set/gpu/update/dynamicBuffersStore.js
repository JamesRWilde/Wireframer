/**
 * Updates the dynamic fill position and normal buffers for a model's GPU buffer store.
 *
 * This function is a strict one-function-per-file wrapper that delegates all logic to the dynamicBuffers helper.
 * It is used when the model's geometry or morph state changes, ensuring the GPU buffers are refreshed and in sync.
 *
 * Design rationale:
 * - Maintains strict one-function-per-file architecture for maximum modularity and testability.
 * - Delegates all update logic to dynamicBuffers.js, which handles the actual buffer updates.
 * - Defensive: always returns the result of the delegated helper, which is true on success and false on error.
 *
 * @param {WebGLRenderingContext} gl - The WebGL context to update buffers with.
 * @param {Object} model - The model object containing geometry data.
 * @param {Object} buffers - The GPU buffer store to update.
 * @returns {boolean} True if update succeeded, false if model or buffers are invalid.
 */
import {dynamicBuffers}from '@engine/set/gpu/update/dynamicBuffers.js';

/**
 * Updates the dynamic buffers for a model's GPU buffer store by delegating to the dynamicBuffers helper.
 * @param {WebGLRenderingContext} gl
 * @param {Object} model
 * @param {Object} buffers
 * @returns {boolean}
 */
export function dynamicBuffersStore(gl, model, buffers) {
  // Delegate to the main update logic in dynamicBuffers.js
  return updateDynamicBuffersHelper(gl, model, buffers);
}
