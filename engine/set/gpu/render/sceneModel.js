/**
 * sceneModel.js - GPU Scene Model Renderer
 *
 * PURPOSE:
 *   Performs the complete GPU rendering pass for a 3D model, including
 *   buffer binding, uniform uploads, and draw calls for both fill and
 *   wire rendering. This is the core WebGL draw function.
 *
 * ARCHITECTURE ROLE:
 *   Called by the model dispatcher. Handles the full GPU pipeline:
 *   1. Set up viewport, depth testing, and blending
 *   2. Render filled triangles (Blinn-Phong lit)
 *   3. Render wireframe edges (depth-faded)
 *
 * DETAILS:
 *   Uses pre-allocated temporary arrays to avoid per-frame allocation.
 *   Fill uses alpha blending (SRC_ALPHA, ONE_MINUS_SRC_ALPHA).
 *   Wire uses additive blending (SRC_ALPHA, ONE) for glow effect.
 */

"use strict";

// Import GPU math utilities
import { normalizeVector3 } from '@engine/get/gpu/normalizeVector3.js';
import { convertRgbToNormalized } from '@engine/get/gpu/convertRgbToNormalized.js';
import { toRowMajorRotation } from '@engine/get/gpu/toRowMajorRotation.js';
import { projectionUniforms } from '@engine/set/gpu/projectionUniforms.js';

/**
 * sceneModel - Renders a model using the GPU fill and wire pipelines
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {Object} model - Mesh data { V, F, E }
 * @param {Object} params - Render parameters (theme, rotation, zoom, width, height, etc.)
 * @param {Object} shaderPack - { fillProgram, wireProgram, fillLoc, wireLoc }
 * @param {Object} bufferStore - { modelBuffers, dynamicBuffers }
 * @param {Object} tmpArrays - Pre-allocated Float32Arrays for uniform values
 * @returns {boolean} Whether rendering succeeded
 */
export function sceneModel(gl, model, params, shaderPack, bufferStore, tmpArrays) {
  // Guard: require theme, width, and height for rendering
  if (!params?.theme || !params?.width || !params?.height) return false;

  // Get or create GPU buffers for this model
  const buffers = bufferStore.modelBuffers(model);
  if (!buffers) return false;

  // Handle dynamic buffer updates if requested
  if (params.dynamic === true && !bufferStore.dynamicBuffers(model, buffers)) return false;

  // Extract rotation matrix in row-major format
  const rot = toRowMajorRotation(params.rotation);

  // Set viewport and optionally clear buffers
  gl.viewport(0, 0, params.width, params.height);
  if (params.clear !== false) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  // Configure depth testing and disable back-face culling
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);

  // Extract shader programs, locations, and temporary arrays
  const { fillProgram, wireProgram, fillLoc, wireLoc } = shaderPack;
  const { tmpLight, tmpView, tmpShadeDark, tmpShadeBright, tmpWireNear, tmpWireFar } = tmpArrays;

  // Clamp alpha values to [0, 1]
  const fillAlpha = Math.max(0, Math.min(1, Number(params.fillAlpha) || 0));
  const wireAlpha = Math.max(0, Math.min(1, Number(params.wireAlpha) || 0));

  // --- Fill Pass (Blinn-Phong lit triangles) ---
  if (fillAlpha > 0.001) {
    gl.useProgram(fillProgram);

    // Set projection uniforms
    projectionUniforms(gl, fillLoc, params);

    // Set rotation matrix uniforms (stored as three row vectors)
    gl.uniform3f(fillLoc.uR0, rot[0], rot[1], rot[2]);
    gl.uniform3f(fillLoc.uR1, rot[3], rot[4], rot[5]);
    gl.uniform3f(fillLoc.uR2, rot[6], rot[7], rot[8]);

    // Set lighting uniforms (normalized light and view directions)
    gl.uniform3fv(fillLoc.uLightDir, normalizeVector3(tmpLight, params.lightDir, [-0.38, 0.74, -0.56]));
    gl.uniform3fv(fillLoc.uViewDir, normalizeVector3(tmpView, params.viewDir, [0, 0, -1]));

    // Set shading colors (convert from RGB 0-255 to normalized 0-1)
    gl.uniform3fv(fillLoc.uShadeDark, convertRgbToNormalized(tmpShadeDark, params.theme.shadeDark, [35, 48, 64]));
    gl.uniform3fv(fillLoc.uShadeBright, convertRgbToNormalized(tmpShadeBright, params.theme.shadeBright, [120, 180, 230]));
    gl.uniform1f(fillLoc.uAlpha, fillAlpha);

    // Bind position attribute buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillPosBuffer);
    gl.enableVertexAttribArray(fillLoc.aPos);
    gl.vertexAttribPointer(fillLoc.aPos, 3, gl.FLOAT, false, 0, 0);

    // Bind normal attribute buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillNormalBuffer);
    gl.enableVertexAttribArray(fillLoc.aNormal);
    gl.vertexAttribPointer(fillLoc.aNormal, 3, gl.FLOAT, false, 0, 0);

    // Bind UV attribute buffer if available
    if (buffers.fillUVBuffer && fillLoc.aUV !== undefined) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fillUVBuffer);
      gl.enableVertexAttribArray(fillLoc.aUV);
      gl.vertexAttribPointer(fillLoc.aUV, 2, gl.FLOAT, false, 0, 0);
    }

    // Draw filled triangles with alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, buffers.fillVertexCount);
  }

  // --- Wire Pass (depth-faded edges) ---
  if (wireAlpha > 0.001) {
    gl.useProgram(wireProgram);

    // Set projection uniforms
    projectionUniforms(gl, wireLoc, params);

    // Set rotation matrix uniforms
    gl.uniform3f(wireLoc.uR0, rot[0], rot[1], rot[2]);
    gl.uniform3f(wireLoc.uR1, rot[3], rot[4], rot[5]);
    gl.uniform3f(wireLoc.uR2, rot[6], rot[7], rot[8]);

    // Set depth half-extent for wire color interpolation
    gl.uniform1f(wireLoc.uZHalf, Math.max(0.01, params.zHalf || 1));

    // Set wire colors (near=far edges, far=near edges for depth fade)
    gl.uniform3fv(wireLoc.uWireNear, convertRgbToNormalized(tmpWireNear, params.theme.wireNear, [210, 245, 255]));
    gl.uniform3fv(wireLoc.uWireFar, convertRgbToNormalized(tmpWireFar, params.theme.wireFar, [120, 195, 255]));
    gl.uniform1f(wireLoc.uAlpha, wireAlpha);

    // Bind wire position attribute buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.wirePosBuffer);
    gl.enableVertexAttribArray(wireLoc.aPos);
    gl.vertexAttribPointer(wireLoc.aPos, 3, gl.FLOAT, false, 0, 0);

    // Bind edge index buffer for indexed line drawing
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.edgeIndexBuffer);

    // Draw wireframe edges with standard alpha blending so fill remains visible.
    // Keep depth testing enabled to avoid drawing wires through the mesh.



    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawElements(gl.LINES, buffers.edgeCount, buffers.indexType, 0);
  }

  return true;
}
