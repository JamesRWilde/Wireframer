/**
 * Builds all GPU buffers required for rendering a model in WebGL.
 *
 * This function orchestrates the creation of all GPU-side buffers needed for both wireframe and fill rendering.
 * It delegates the creation of each buffer type to single-purpose helpers, ensuring strict modularity and testability.
 *
 * Responsibilities:
 * - Validates model geometry and context capabilities.
 * - Converts n-gon faces to triangles (without mutating the model).
 * - Computes per-corner normals for smooth shading.
 * - Delegates:
 *   - Vertex position buffer creation to InitGpuEngineCreateWirePosData.
 *   - Fill position, normal, and UV buffer creation to InitGpuEngineCreateFillBuffers.
 *   - Edge index buffer creation to InitGpuEngineCreateEdgeIndexData.
 * - Uploads all data to WebGL buffers and returns them for use by the renderer.
 *
 * Defensive design:
 * - Returns null if the model is missing required geometry, if triangle conversion fails,
 *   or if the context does not support the required index size. This prevents downstream rendering errors.
 *
 * Buffer layout:
 * - wirePosBuffer: All model vertices, [x, y, z] per vertex.
 * - fillPosBuffer: All triangle vertices, [x, y, z] per triangle corner.
 * - fillNormalBuffer: Per-corner normals for smooth shading, [nx, ny, nz] per triangle corner.
 * - fillUVBuffer: Optional, per-corner UVs if present in the model.
 * - edgeIndexBuffer: Indices for wireframe rendering.
 *
 * @param {WebGLRenderingContext} gl - The WebGL context to create buffers with.
 * @param {Object} model - The model object containing geometry data.
 * @param {boolean} supportsUint32 - Whether the context supports 32-bit indices.
 * @returns {Object|null} The GPU buffer store for the model, or null if invalid.
 */
import { getModelTriangles } from '../../render/get/GetRenderEngineModelTriangles.js';
import { getModelTriCornerNormals } from '../../render/get/GetRenderEngineModelTriCornerNormals.js';
import { InitGpuEngineCreateWirePosData } from './InitGpuEngineCreateWirePosData.js';
import { InitGpuEngineCreateFillBuffers } from './InitGpuEngineCreateFillBuffers.js';
import { InitGpuEngineCreateEdgeIndexData } from './InitGpuEngineCreateEdgeIndexData.js';

export function InitGpuEngineBuildModelBuffers(gl, model, supportsUint32) {
  // Defensive: model must have vertices and edges
  if (!model?.V?.length || !model?.E?.length) return null;

  // Compute triangle faces for the model (handles n-gons)
  // Do not mutate the model, as some may be frozen (e.g., BASE_MODEL)
  let triFaces = model.triangles || model._triFaces || getModelTriangles(model);
  if (!triFaces?.length) return null;
  // Each face is either an array of indices or an object with .indices
  triFaces = triFaces.map(f => f?.indices ?? f);

  // Compute per-corner normals for smooth shading
  const triCornerNormals = getModelTriCornerNormals(model, triFaces);
  if (triCornerNormals?.length !== triFaces.length) return null;

  const vertexCount = model.V.length;
  // If model is too large for 16-bit indices and context doesn't support 32-bit, abort
  if (vertexCount > 65535 && !supportsUint32) return null;

  // Delegate wireframe vertex buffer creation
  // Packs all model vertex positions ([x, y, z]) into a contiguous Float32Array
  const wirePosData = InitGpuEngineCreateWirePosData(model);

  // Delegate fill buffer creation (positions, normals, UVs, source indices)
  // Packs all triangle corner attributes into contiguous arrays for fill rendering
  const { fillPosData, fillNormalData, fillUVData } = InitGpuEngineCreateFillBuffers(model, triFaces, triCornerNormals);

  // Delegate edge index buffer creation
  // Packs all model edges into an index buffer, choosing 16/32 bit as needed
  const { edgeData, indexType } = InitGpuEngineCreateEdgeIndexData(model, vertexCount, supportsUint32, gl);

  // Create and upload all GPU buffers
  // Each buffer is created, bound, and populated with the corresponding data array
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

  // Return all created buffers and counts for use by the renderer
  return {
    wirePosBuffer,      // WebGL buffer for all model vertex positions
    fillPosBuffer,      // WebGL buffer for all triangle corner positions
    fillNormalBuffer,   // WebGL buffer for all triangle corner normals
    fillUVBuffer,       // WebGL buffer for all triangle corner UVs (if present)
    edgeIndexBuffer,    // WebGL buffer for all model edge indices
    fillVertexCount: triFaces.length * 3, // Number of fill vertices
    edgeCount: model.E.length * 2,        // Number of edge indices
    indexType           // WebGL constant for index type
  };
}
