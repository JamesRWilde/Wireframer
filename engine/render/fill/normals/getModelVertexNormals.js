/**
 * getModelVertexNormals.js - Vertex Normal Computation
 * 
 * PURPOSE:
 *   Computes averaged normals for each vertex by combining corner normals
 *   from all faces that share the vertex. Used for smooth shading.
 * 
 * ARCHITECTURE ROLE:
 *   Called when vertex normals are needed for smooth shading or export.
 *   Builds on corner normals from getModelTriCornerNormals.
 * 
 * NORMAL AVERAGING:
 *   Each vertex normal is the average of corner normals from all faces
 *   that include that vertex. This creates smooth transitions between faces.
 */

import { getModelTriCornerNormals } from './getModelTriCornerNormals.js';

/**
 * getModelVertexNormals - Computes averaged normals for each vertex
 * 
 * @param {Object} model - Model object with vertex array V
 * @param {Array<Array<number>>} triFaces - Array of triangle face indices
 * 
 * @returns {Array<Array<number>>} Array of normalized vertex normals [nx, ny, nz]
 * 
 * The function:
 * 1. Gets corner normals for all triangles
 * 2. Accumulates corner normals at each vertex
 * 3. Counts contributions per vertex for averaging
 * 4. Normalizes accumulated normals
 * 5. Uses default up normal for vertices with no contributions
 */
export function getModelVertexNormals(model, triFaces) {
  const V = model.V;
  
  // Initialize accumulator for vertex normals
  let normals = Array.from({ length: V.length }, () => [0, 0, 0]);

  // Get corner normals from all triangles
  const cornerNormals = getModelTriCornerNormals(model, triFaces);
  
  // Count contributions per vertex for averaging
  const counts = new Uint16Array(V.length);

  // Accumulate corner normals at each vertex
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const cn = cornerNormals[i];
    
    for (let c = 0; c < 3; c++) {
      const vi = tri[c];
      normals[vi][0] += cn[c][0];
      normals[vi][1] += cn[c][1];
      normals[vi][2] += cn[c][2];
      counts[vi]++;
    }
  }

  // Normalize accumulated normals
  for (let i = 0; i < normals.length; i++) {
    let nx = normals[i][0];
    let ny = normals[i][1];
    let nz = normals[i][2];
    let nl = Math.hypot(nx, ny, nz);
    
    // Use default up normal for degenerate or unused vertices
    if (nl < 1e-9 || counts[i] === 0) {
      normals[i] = [0, 1, 0];
      continue;
    }
    
    // Normalize and store
    normals[i] = [nx / nl, ny / nl, nz / nl];
  }

  return normals;
}
