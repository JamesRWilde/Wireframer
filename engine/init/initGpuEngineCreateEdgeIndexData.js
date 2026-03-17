/**
 * Creates the edge index buffer for wireframe rendering in WebGL.
 *
 * This helper generates the index buffer for all model edges, choosing the correct index type (Uint16Array or Uint32Array)
 * based on the vertex count and WebGL context support. This ensures compatibility with both small and large models.
 *
 * Design rationale:
 * - Handles both 16-bit and 32-bit index buffers for maximum compatibility and performance.
 * - Defensive: always uses the correct type to avoid WebGL errors on large models.
 * - Fully documented for maintainability and future enhancements.
 *
 * @param {Object} model - The model object containing geometry data. Must have an E array of edges.
 * @param {number} vertexCount - Number of vertices in the model (used to determine index type).
 * @param {boolean} supportsUint32 - Whether 32-bit indices are supported by the WebGL context.
 * @param {WebGLRenderingContext} gl - The WebGL context (for index type constants).
 * @returns {{ edgeData: Uint16Array|Uint32Array, indexType: GLenum }}
 *   edgeData: The index buffer for all model edges (2 indices per edge).
 *   indexType: The WebGL constant for the index type (gl.UNSIGNED_SHORT or gl.UNSIGNED_INT).
 */
export function initGpuEngineCreateEdgeIndexData(model, vertexCount, supportsUint32, gl) {
  // Compute total number of edge indices (2 per edge)
  const edgeIndexCount = model.E.length * 2;
  // Use 32-bit indices if model is large and context supports it, else 16-bit
  const useUint32 = vertexCount > 65535 && supportsUint32;
  const edgeData = useUint32 ? new Uint32Array(edgeIndexCount) : new Uint16Array(edgeIndexCount);

  // Populate edge index buffer: each edge is two vertex indices
  for (let i = 0; i < model.E.length; i++) {
    const e = model.E[i]; // e: [startVertex, endVertex]
    const o = i * 2;
    edgeData[o] = e[0];
    edgeData[o + 1] = e[1];
  }

  // Choose correct WebGL index type constant
  const indexType = useUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

  // Return both the index buffer and the type for use in buffer uploads
  return { edgeData, indexType };
}
