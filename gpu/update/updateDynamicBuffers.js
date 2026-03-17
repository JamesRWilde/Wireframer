/**
 * Updates the dynamic fill position and normal buffers for a model in-place.
 *
 * This function is used when the model's geometry or morph state changes, and the GPU buffers need to be refreshed.
 * It recomputes per-corner normals and positions for all triangles, ensuring smooth shading and correct geometry.
 *
 * Defensive: returns false if the model or buffers are invalid, or if triangle conversion fails.
 *
 * @param {WebGLRenderingContext} gl - The WebGL context to update buffers with.
 * @param {Object} model - The model object containing geometry data.
 * @param {Object} buffers - The GPU buffer store to update.
 * @returns {boolean} True if update succeeded, false if model is invalid.
 */
import { getModelTriangles } from '../../engine/render/get/getModelTriangles.js';
import { getModelTriCornerNormals } from '../../engine/render/get/getModelTriCornerNormals.js';

export function updateDynamicBuffers(gl, model, buffers) {
  // Defensive: must have valid model and buffers
  if (!model || !buffers) return false;

  // Compute triangle faces for the model (handles n-gons)
  let triFaces = model.triangles || model._triFaces || getModelTriangles(model);
  if (!triFaces?.length) return false;
  // Each face is either an array of indices or an object with .indices
  triFaces = triFaces.map(f => f?.indices ?? f);

  // Compute per-corner normals for smooth shading
  const triCornerNormals = getModelTriCornerNormals(model, triFaces);
  if (triCornerNormals?.length !== triFaces.length) return false;

  const fillVertexCount = triFaces.length * 3;
  // Allocate new arrays for updated positions and normals
  const fillPosData = new Float32Array(fillVertexCount * 3);
  const fillNormalData = new Float32Array(fillVertexCount * 3);

  // Populate fill vertex positions and normals
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    for (let c = 0; c < 3; c++) {
      const src = tri[c];
      const v = model.V[src];
      const o = (i * 3 + c) * 3;
      fillPosData[o] = v[0];
      fillPosData[o + 1] = v[1];
      fillPosData[o + 2] = v[2];
      // Use per-corner normals if available, else fallback to vertex normal
      const n = triCornerNormals?.[i]?.[c];
      if (n) {
        fillNormalData[o] = n[0];
        fillNormalData[o + 1] = n[1];
        fillNormalData[o + 2] = n[2];
      } else {
        fillNormalData[o] = v[5];
        fillNormalData[o + 1] = v[6];
        fillNormalData[o + 2] = v[7];
      }
    }
  }

  // Upload updated data to GPU buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillPosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, fillPosData, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, fillNormalData, gl.DYNAMIC_DRAW);

  // Update fill vertex count for downstream use
  buffers.fillVertexCount = fillVertexCount;
  return true;
}
