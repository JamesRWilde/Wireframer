/**
 * Creates a Float32Array of all model vertex positions for wireframe rendering.
 *
 * This helper extracts the [x, y, z] coordinates for every vertex in the model and packs them into a contiguous
 * Float32Array suitable for uploading to a WebGL buffer. Used for wireframe rendering, where only vertex positions
 * are needed (no normals or UVs).
 *
 * Design rationale:
 * - Keeps wireframe buffer logic isolated for clarity and testability.
 * - Defensive: assumes model.V is a valid array of vertices, each with at least 3 coordinates.
 * - Fully documented for maintainability and future enhancements.
 *
 * @param {Object} model - The model object containing geometry data. Must have a V array of vertices.
 * @returns {Float32Array} The wireframe vertex position array ([x, y, z] per vertex).
 */
export function gpuEngineCreateWirePosData(model) {
  // Get the number of vertices in the model
  const vertexCount = model.V.length;
  // Allocate a contiguous array for all vertex positions
  const wirePosData = new Float32Array(vertexCount * 3);
  // Populate the array: each vertex contributes 3 floats (x, y, z)
  for (let i = 0; i < vertexCount; i++) {
    const v = model.V[i]; // v: [x, y, z, ...]
    const o = i * 3;
    wirePosData[o] = v[0];
    wirePosData[o + 1] = v[1];
    wirePosData[o + 2] = v[2];
  }
  // Return the packed vertex position array for use in WebGL buffer uploads
  return wirePosData;
}
