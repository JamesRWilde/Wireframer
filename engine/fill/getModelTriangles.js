/**
 * getModelTriangles.js - Face-to-Triangle Conversion
 * 
 * PURPOSE:
 *   Converts all faces in a mesh model to triangles. This is necessary because
 *   the rendering pipeline (both CPU and GPU) works with triangles, but mesh
 *   faces can have any number of vertices (n-gons). This function handles the
 *   conversion using ear clipping for polygons with more than 3 vertices.
 * 
 * ARCHITECTURE ROLE:
 *   Called by the CPU fill renderer to prepare mesh data for rasterization.
 *   The triangulation is cached on the model object to avoid recomputation.
 * 
 * WHY EAR CLIPPING:
 *   Ear clipping is a simple and robust algorithm for triangulating simple
 *   polygons. It works by repeatedly finding and removing "ears" (triangles
 *   that don't contain any other vertices) until only triangles remain.
 */

"use strict";

// Import the ear clipping triangulation algorithm
// This handles n-gon faces by decomposing them into triangles
import { triangulateFaceEarClipping } from './triangulation.js';

/**
 * getModelTriangles - Converts all mesh faces to triangles
 * 
 * @param {Object} model - The mesh model with V (vertices) and F (faces)
 * @param {Array} model.V - Vertex positions array [[x,y,z], ...]
 * @param {Array} model.F - Face index arrays [[i,j,k,...], ...]
 * 
 * @returns {Array<Array<number>>} Array of triangle index arrays [a,b,c]
 *   Each triangle is represented as three vertex indices
 * 
 * This function handles:
 * - Triangle faces (3 vertices): passed through directly
 * - Quad faces (4 vertices): split into 2 triangles
 * - N-gon faces (5+ vertices): triangulated using ear clipping
 */
export function getModelTriangles(model) {
  // Guard: return empty array if model is invalid or missing required data
  if (!model?.F || !model?.V) return [];
  
  // Array to collect all triangles
  const tris = [];
  
  // Iterate over all faces in the model
  for (const face of model.F) {
    // Extract indices from face object or use face directly
    // Some formats store indices in a property, others use the array directly
    let indices = face?.indices ?? face;
    
    // Handle nested array case (some parsers wrap indices in an extra array)
    if (Array.isArray(indices) && indices.length === 1 && Array.isArray(indices[0])) {
      indices = indices[0];
    }
    
    // Process based on face vertex count
    if (indices.length === 3) {
      // Triangle: pass through directly (no conversion needed)
      tris.push([indices[0], indices[1], indices[2]]);
    } else if (indices.length > 3) {
      // N-gon: use ear clipping to decompose into triangles
      const tri = triangulateFaceEarClipping(indices, model.V);
      for (const t of tri) tris.push(t);
    }
    // Note: faces with < 3 vertices are silently skipped (degenerate)
  }
  
  return tris;
}
