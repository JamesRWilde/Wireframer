/**
 * classifyEdges.js - Edge Classification for Wireframe Rendering
 * 
 * PURPOSE:
 *   Classifies edges as front-facing, back-facing, or silhouette edges.
 *   Enables selective wireframe rendering (e.g., front edges only).
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawWireframeModel when edge filtering mode is active.
 *   Provides edge classification map for createEdgeFilter.
 * 
 * CLASSIFICATION TYPES:
 *   - 'front': Edge belongs only to front-facing triangles
 *   - 'back': Edge belongs only to back-facing triangles
 *   - 'silhouette': Edge belongs to both front and back triangles
 */

"use strict";

import { getModelTriangles } from '../../fill/getModelTriangles.js';
import { buildEdgeToFacesMap } from './buildEdgeToFacesMap.js';
import { computeMeshCenter } from './computeMeshCenter.js';
import { computeFaceNormals } from './computeFaceNormals.js';
import { determineEdgeClassification } from './determineEdgeClassification.js';

/**
 * classifyEdges - Classifies all edges in a model
 * 
 * @param {Object} model - Model object with triangle and edge data
 * @param {Array<Array<number>>} T - Transformed vertex positions in view space
 * 
 * @returns {Map<string, string>} Map from edge key to classification ('front'|'back'|'silhouette')
 * 
 * The function:
 * 1. Gets triangle faces from model
 * 2. Builds edge-to-faces mapping
 * 3. Computes mesh center and face normals
 * 4. Classifies each edge based on adjacent face orientations
 */
export function classifyEdges(model, T) {
  // Get triangle faces from model
  const triFaces = getModelTriangles(model);
  if (!triFaces?.length) return new Map();

  // Build edge-to-faces mapping
  const edgeToFaces = buildEdgeToFacesMap(triFaces);
  
  // Compute mesh center for normal orientation
  const meshCenter = computeMeshCenter(T);
  
  // Compute face normals in view space
  const faceNormals = computeFaceNormals(T, triFaces, meshCenter);

  // View direction (camera looks down -Z in view space)
  const viewDir = [0, 0, -1];
  
  // Classify each edge
  const classification = new Map();
  for (const [key, faceIndices] of edgeToFaces) {
    classification.set(key, determineEdgeClassification(faceNormals, viewDir, faceIndices));
  }

  return classification;
}
