/**
 * determineEdgeClassification.js - Edge Classification Logic
 * 
 * PURPOSE:
 *   Determines if an edge is front-facing, back-facing, or a silhouette edge
 *   based on the orientation of its adjacent faces.
 * 
 * ARCHITECTURE ROLE:
 *   Called by classifyEdges for each edge to determine its classification.
 *   Uses face normals and view direction to determine orientation.
 * 
 * CLASSIFICATION LOGIC:
 *   - Front face: normal dot viewDir < -0.01 (facing camera)
 *   - Back face: normal dot viewDir > 0.01 (facing away)
 *   - Silhouette: edge has both front and back facing adjacent faces
 */

"use strict";

/**
 * determineEdgeClassification - Classifies an edge based on adjacent faces
 * 
 * @param {Array<Array<number>>} faceNormals - Array of face normal vectors
 * @param {Array<number>} viewDir - View direction vector [0, 0, -1]
 * @param {Array<number>} faceIndices - Indices of faces adjacent to this edge
 * 
 * @returns {string} Classification: 'front', 'back', or 'silhouette'
 * 
 * The function:
 * 1. Counts front-facing and back-facing adjacent faces
 * 2. Returns 'silhouette' if edge has both types
 * 3. Returns 'front' or 'back' based on majority
 * 4. Defaults to 'front' if no clear classification
 */
export function determineEdgeClassification(faceNormals, viewDir, faceIndices) {
  let frontCount = 0;
  let backCount = 0;

  // Check orientation of each adjacent face
  for (const fi of faceIndices) {
    const n = faceNormals[fi];
    if (!n) continue;

    // Dot product with view direction determines face orientation
    const dot = n[0] * viewDir[0] + n[1] * viewDir[1] + n[2] * viewDir[2];
    
    // Negative dot = facing camera (front), positive = facing away (back)
    // Small threshold (0.01) avoids classifying edge-on faces
    if (dot < -0.01) frontCount++;
    else if (dot > 0.01) backCount++;
  }

  // Silhouette: edge has both front and back facing adjacent faces
  if (frontCount > 0 && backCount > 0) return 'silhouette';
  
  // Front or back based on adjacent face orientations
  if (frontCount > 0) return 'front';
  if (backCount > 0) return 'back';
  
  // Default to front if no clear classification
  return 'front';
}
