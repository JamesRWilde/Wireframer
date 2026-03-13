// Import face-to-triangle conversion
// Converts n-gon faces to triangles for GPU rendering
import { getModelTriangles } from '../../fill/getModelTriangles.js';

// Import corner normal computation
// Computes per-vertex normals for smooth shading
import { getModelTriCornerNormals } from '../../fill/normals/getModelTriCornerNormals.js';

export function createSceneGpuBufferStore(gl, supportsUint32) {
  const modelCache = new WeakMap();

  function buildModelBuffers(model) {
    if (!model || !model.V || !model.V.length || !model.E || !model.E.length) return null;
    // Compute triFaces without modifying the model (important for frozen BASE_MODEL)
    let triFaces = model.triangles || model._triFaces || getModelTriangles(model);
    if (!triFaces || !triFaces.length) return null;
    triFaces = triFaces.map(f => (f && f.indices ? f.indices : f));

    const triCornerNormals = getModelTriCornerNormals(model, triFaces);
    if (!triCornerNormals || triCornerNormals.length !== triFaces.length) return null;

    const vertexCount = model.V.length;
    const edgeIndexCount = model.E.length * 2;
    const fillVertexCount = triFaces.length * 3;
    if (vertexCount > 65535 && !supportsUint32) return null;

    const wirePosData = new Float32Array(vertexCount * 3);
    const fillPosData = new Float32Array(fillVertexCount * 3);
    const fillNormalData = new Float32Array(fillVertexCount * 3);
    let fillUVData = null;
    if (model.triangleUVs) fillUVData = new Float32Array(fillVertexCount * 2);
    const fillSourceIndex = new Uint32Array(fillVertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const v = model.V[i];
      const o = i * 3;
      wirePosData[o] = v[0];
      wirePosData[o + 1] = v[1];
      wirePosData[o + 2] = v[2];
    }

    for (let i = 0; i < triFaces.length; i++) {
      const tri = triFaces[i];
      for (let c = 0; c < 3; c++) {
        const src = tri[c];
        const v = model.V[src];
        // v: [x, y, z, u, v, nx, ny, nz]
        const o = (i * 3 + c) * 3;
        fillPosData[o] = v[0];
        fillPosData[o + 1] = v[1];
        fillPosData[o + 2] = v[2];
        // Use per-corner normals from meshObj if available
        if (model.triangleNormals && model.triangleNormals[i]) {
          const n = model.triangleNormals[i][c];
          fillNormalData[o] = n[0];
          fillNormalData[o + 1] = n[1];
          fillNormalData[o + 2] = n[2];
        } else {
          fillNormalData[o] = v[5];
          fillNormalData[o + 1] = v[6];
          fillNormalData[o + 2] = v[7];
        }
        if (fillUVData && model.triangleUVs && model.triangleUVs[i]) {
          const uv = model.triangleUVs[i][c];
          const uvo = (i * 3 + c) * 2;
          fillUVData[uvo] = uv[0];
          fillUVData[uvo + 1] = uv[1];
        }
        fillSourceIndex[i * 3 + c] = src;
      }
    }

    const indexType = vertexCount > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    const edgeData = vertexCount > 65535 ? new Uint32Array(edgeIndexCount) : new Uint16Array(edgeIndexCount);
    for (let i = 0; i < model.E.length; i++) {
      const e = model.E[i];
      const o = i * 2;
      edgeData[o] = e[0];
      edgeData[o + 1] = e[1];
    }

    const wirePosBuffer = gl.createBuffer();
    const fillPosBuffer = gl.createBuffer();
    const fillNormalBuffer = gl.createBuffer();
    const edgeIndexBuffer = gl.createBuffer();
    let fillUVBuffer = null;
    gl.bindBuffer(gl.ARRAY_BUFFER, wirePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, wirePosData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, fillPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fillPosData, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, fillNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fillNormalData, gl.DYNAMIC_DRAW);
    if (fillUVData) {
      fillUVBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, fillUVBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, fillUVData, gl.DYNAMIC_DRAW);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edgeData, gl.STATIC_DRAW);

    return {
      wirePosBuffer,
      fillPosBuffer,
      fillNormalBuffer,
      fillUVBuffer,
      edgeIndexBuffer,
      fillVertexCount,
      edgeCount: model.E.length * 2,
      indexType,
    };
  }

  function updateDynamicBuffers(model, buffers) {
    if (!model || !buffers) return false;
    let triFaces = model.triangles || model._triFaces || getModelTriangles(model);
    if (!triFaces || !triFaces.length) return false;
    triFaces = triFaces.map(f => (f && f.indices ? f.indices : f));

    const triCornerNormals = getModelTriCornerNormals(model, triFaces);
    if (!triCornerNormals || triCornerNormals.length !== triFaces.length) return false;

    const fillVertexCount = triFaces.length * 3;
    const fillPosData = new Float32Array(fillVertexCount * 3);
    const fillNormalData = new Float32Array(fillVertexCount * 3);

    for (let i = 0; i < triFaces.length; i++) {
      const tri = triFaces[i];
      for (let c = 0; c < 3; c++) {
        const src = tri[c];
        const v = model.V[src];
        const o = (i * 3 + c) * 3;
        fillPosData[o] = v[0];
        fillPosData[o + 1] = v[1];
        fillPosData[o + 2] = v[2];
        if (model.triangleNormals && model.triangleNormals[i]) {
          const n = model.triangleNormals[i][c];
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

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fillPosData, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fillNormalData, gl.DYNAMIC_DRAW);

    buffers.fillVertexCount = fillVertexCount;
    return true;
  }

  function getModelBuffers(model) {
    if (!model) return null;
    let buffers = modelCache.get(model);
    if (!buffers) {
      buffers = buildModelBuffers(model);
      if (buffers) modelCache.set(model, buffers);
    }
    return buffers;
  }

  return { getModelBuffers, updateDynamicBuffers };
}
