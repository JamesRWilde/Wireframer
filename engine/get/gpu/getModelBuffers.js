/**
 * modelBuffers.js - GPU Buffer Cache for Model Geometry
 *
 * PURPOSE:
 *   Provides a cached accessor for GPU buffer sets associated with model objects.
 *   Buffers are created once per model instance and reused across frames, avoiding
 *   redundant WebGL buffer allocation for models that don't change.
 *
 * ARCHITECTURE ROLE:
 *   Called by the render pipeline to obtain the GPU buffer set before issuing
 *   draw calls. Acts as a thin cache layer over buildModelBuffers, which handles
 *   the actual buffer creation and data upload.
 *
 * CACHING STRATEGY:
 *   Uses a WeakMap keyed by the model object reference. This means:
 *   - Same model object → instant buffer lookup (no rebuild)
 *   - Garbage-collected model → cache entry automatically freed
 *   - New model object → creates fresh buffers via buildModelBuffers
 */

"use strict";

import { buildModelBuffers }from '@engine/init/gpu/buildModelBuffers.js';

/**
 * modelBuffers - Returns the GPU buffer set for a model, creating and caching it if needed.
 *
 * Buffers are created once per model instance and cached in the provided WeakMap.
 * Returns null if the model is falsy (defensive check). Delegates actual buffer
 * creation to buildModelBuffers, which handles vertex, normal, and index buffers.
 *
 * @param {WebGLRenderingContext} gl - The WebGL context to use for buffer creation
 * @param {WeakMap} modelCache - WeakMap for model-to-buffer mapping (owned by caller)
 * @param {boolean} supportsUint32 - Whether the GPU supports 32-bit index buffers
 * @param {Object} model - The model object containing V (vertices), F (faces), E (edges)
 * @returns {Object|null} The GPU buffer store for the model, or null if model is invalid
 */
export function getModelBuffers(gl, modelCache, supportsUint32, model) {
  // Defensive: must have a model
  if (!model) return null;

  // Check cache first — instant return for models already uploaded to GPU
  let buffers = modelCache.get(model);
  if (!buffers) {
    // First use of this model: build vertex/normal/index buffers and upload to GPU
    buffers = buildModelBuffers(gl, model, supportsUint32);
    if (buffers) modelCache.set(model, buffers);
  }
  return buffers;
}
