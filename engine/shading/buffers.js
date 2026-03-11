
'use strict';
// Ensure getModelTriangles is available (global or import)
if (typeof getModelTriangles === 'undefined' && typeof window !== 'undefined') {
  if (window.getModelTriangles) getModelTriangles = window.getModelTriangles;
}

function createSceneGpuBufferStore(gl, supportsUint32) {
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
      edgeCount: edgeData.length,
      indexType,
      vertexCount,
      fillSourceIndex,
      wirePosData,
      fillPosData,
      fillNormalData,
      fillUVData,
    };
  }

  function updateDynamicBuffers(model, buffers) {
    const vertexCount = buffers.vertexCount;
    if (!model || !model.V || model.V.length !== vertexCount) return false;

    // Compute triFaces without modifying the model
    let triFaces = model._triFaces || getModelTriangles(model);
    triFaces = triFaces.map(f => (f && f.indices ? f.indices : f));
    const cornerNormals = getModelTriCornerNormals(model, triFaces);
    if (!cornerNormals || cornerNormals.length !== triFaces.length) return false;

    const wirePosData = buffers.wirePosData;
    const fillPosData = buffers.fillPosData;
    const fillNormalData = buffers.fillNormalData;
    const fillSourceIndex = buffers.fillSourceIndex;
    const fillUVData = buffers.fillUVData;

    for (let i = 0; i < vertexCount; i++) {
      const v = model.V[i];
      const o = i * 3;
      wirePosData[o] = v[0];
      wirePosData[o + 1] = v[1];
      wirePosData[o + 2] = v[2];
    }

    for (let i = 0; i < buffers.fillVertexCount; i++) {
      const src = fillSourceIndex[i];
      const v = model.V[src];
      const triIdx = Math.floor(i / 3);
      const corner = i % 3;
      const n = cornerNormals[triIdx][corner];
      const o = i * 3;
      fillPosData[o] = v[0];
      fillPosData[o + 1] = v[1];
      fillPosData[o + 2] = v[2];
      fillNormalData[o] = n[0];
      fillNormalData[o + 1] = n[1];
      fillNormalData[o + 2] = n[2];
      if (fillUVData && model.triangleUVs && model.triangleUVs[triIdx]) {
        const uv = model.triangleUVs[triIdx][corner];
        const uvo = i * 2;
        fillUVData[uvo] = uv[0];
        fillUVData[uvo + 1] = uv[1];
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.wirePosBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, wirePosData);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillPosBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, fillPosData);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillNormalBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, fillNormalData);
    if (buffers.fillUVBuffer && fillUVData) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillUVBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, fillUVData);
    }

    return true;
  }

  function getModelBuffers(model) {
    const existing = modelCache.get(model);
    if (existing) return existing;
    const built = buildModelBuffers(model);
    if (!built) return null;
    modelCache.set(model, built);
    return built;
  }

  return { getModelBuffers, updateDynamicBuffers };
}
