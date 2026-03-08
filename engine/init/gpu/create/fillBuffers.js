/**
 * Generate per-corner fill buffers for triangle mesh rendering.
 *
 * - Positions: [x, y, z] for each triangle corner
 * - Normals: per-corner if available, else vertex normal
 * - UVs: per-corner if present, else null
 * - Source indices: model vertex index for each fill vertex
 *
 * @param {Object} model Model with V (vertices) and optional triangleUVs
 * @param {Array} triFaces Array of triangle faces (vertex indices)
 * @param {Array} triCornerNormals Per-corner normals for each triangle
 * @returns {Object} { fillPosData, fillNormalData, fillUVData, fillSourceIndex }
 */
export function fillBuffers(model, triFaces, triCornerNormals) {
  // Validate that all triangle faces and vertices are well-formed
  if (!triFaces.every(tri => tri.length === 3)) {
    throw new Error("Invalid triangle data: Each face must have exactly 3 vertices.");
  }

  const fillVertexCount = triFaces.length * 3;
  const fillPosData = new Float32Array(fillVertexCount * 3);
  const fillNormalData = new Float32Array(fillVertexCount * 3);
  let fillUVData = null;
  if (model.triangleUVs) fillUVData = new Float32Array(fillVertexCount * 2);
  const fillSourceIndex = new Uint32Array(fillVertexCount);

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    for (let c = 0; c < 3; c++) {
      const src = tri[c];
      const v = model.V[src];
      const o = (i * 3 + c) * 3;
      fillPosData[o] = v[0];
      fillPosData[o + 1] = v[1];
      fillPosData[o + 2] = v[2];
      // Use per-corner normal if available, else fallback to vertex normal
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
      // Write UV if present
      if (fillUVData && model.triangleUVs?.[i]) {
        const uv = model.triangleUVs[i][c];
        const uvo = (i * 3 + c) * 2;
        fillUVData[uvo] = uv[0];
        fillUVData[uvo + 1] = uv[1];
      }
      fillSourceIndex[i * 3 + c] = src;
    }
  }
  return { fillPosData, fillNormalData, fillUVData, fillSourceIndex };
}
