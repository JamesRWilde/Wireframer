/**
 * triangulation.js - Ear Clipping Triangulation Algorithm
 * 
 * PURPOSE:
 *   Implements the ear clipping algorithm for triangulating simple polygons.
 *   This is used to convert n-gon faces (polygons with more than 3 vertices)
 *   into triangles for rendering. The algorithm works by repeatedly finding
 *   and removing "ears" (triangles that don't contain other vertices).
 * 
 * ARCHITECTURE ROLE:
 *   Called by getModelTriangles to handle faces with more than 3 vertices.
 *   This is a core geometric algorithm that enables the engine to render
 *   arbitrary polygon meshes, not just triangulated ones.
 * 
 * ALGORITHM OVERVIEW:
 *   1. Project the 3D polygon onto a 2D plane (choosing the best axis)
 *   2. Compute the polygon's winding order via signed area
 *   3. Repeatedly find convex vertices that form valid ears
 *   4. Remove ears (emit triangles) until only one triangle remains
 * 
 * WHY EAR CLIPPING:
 *   - Simple to implement and understand
 *   - Works for any simple polygon (no self-intersections)
 *   - O(n²) complexity is acceptable for typical mesh face sizes
 *   - Robust with proper floating-point tolerance
 */

"use strict";

// Import helper functions for the ear clipping algorithm
import { signedArea2 } from './signedArea2.js';
import { isConvex } from './isConvex.js';
import { pointInTriangle } from './pointInTriangle.js';

/**
 * triangulateFaceEarClipping - Triangulates a polygon face using ear clipping
 * 
 * @param {Array<number>} face - Array of vertex indices forming the polygon
 *   Example: [0, 1, 2, 3, 4] for a pentagon
 * @param {Array<Array<number>>} V - Vertex positions array [[x,y,z], ...]
 *   Used to access actual coordinates for projection and area calculation
 * 
 * @returns {Array<Array<number>>} Array of triangles, each as [a, b, c] indices
 *   Returns empty array for degenerate polygons (< 3 vertices or zero area)
 * 
 * The algorithm:
 * 1. Handles trivial cases (triangle or degenerate)
 * 2. Projects 3D vertices to 2D (choosing best projection plane)
 * 3. Computes winding order from signed area
 * 4. Iteratively clips ears until the polygon is fully triangulated
 */
export function triangulateFaceEarClipping(face, V) {
  // Handle trivial cases
  if (!face || face.length < 3) return [];  // Degenerate: not enough vertices
  if (face.length === 3) return [[face[0], face[1], face[2]]];  // Already a triangle

  // Get actual vertex positions for the face
  const verts = face.map((idx) => V[idx]);

  // Estimate face normal using Newell's method
  // This is more robust than cross product for non-planar polygons
  // We use it to choose the best 2D projection plane (avoid edge-on views)
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    // Newell's method: accumulate normal components from edge cross products
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }

  // Choose projection plane based on which normal component is largest
  // This avoids projecting onto an edge-on plane (which would cause degeneracy)
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const az = Math.abs(nz);

  // Project 3D vertices to 2D by dropping the dominant axis
  const proj = verts.map((p) => {
    if (ax >= ay && ax >= az) return [p[1], p[2]];  // Drop X (YZ plane)
    if (ay >= ax && ay >= az) return [p[0], p[2]];  // Drop Y (XZ plane)
    return [p[0], p[1]];  // Drop Z (XY plane)
  });

  // Compute signed area to determine winding order
  const area2 = signedArea2(proj);
  
  // Guard: if area is near zero, the polygon is degenerate (collinear points)
  if (Math.abs(area2) < 1e-10) return [];

  // Initialize working arrays
  const n = face.length;
  // idxArr tracks remaining vertex indices (local indices into face array)
  const idxArr = Array.from({ length: n }, (_, i) => i);
  const triangles = [];
  
  // Safety guard to prevent infinite loops on malformed polygons
  let guard = 0;
  
  /**
   * clipEarLocal - Attempts to find and remove one ear from the polygon
   * 
   * @returns {boolean} True if an ear was found and removed, false otherwise
   * 
   * An ear is a convex vertex where the triangle formed by it and its
   * neighbors doesn't contain any other polygon vertices.
   */
  function clipEarLocal() {
    // Try each remaining vertex as a potential ear
    for (let i = 0; i < idxArr.length; i++) {
      // Get the three vertices of the potential ear
      const i0 = idxArr[(i + idxArr.length - 1) % idxArr.length];  // Previous
      const i1 = idxArr[i];                                          // Current
      const i2 = idxArr[(i + 1) % idxArr.length];                   // Next
      
      // Check if the vertex is convex (required for an ear)
      if (!isConvex(proj, i0, i1, i2, area2)) continue;

      // Check if any other vertex lies inside the potential ear triangle
      // If so, this isn't a valid ear
      let hasPoint = false;
      for (let j = 0; j < idxArr.length; j++) {
        // Skip the three vertices of the potential ear itself
        if (j === (i + idxArr.length - 1) % idxArr.length || j === i || j === (i + 1) % idxArr.length) continue;
        
        // Test if this vertex is inside the ear triangle
        if (pointInTriangle(proj[idxArr[j]], proj[i0], proj[i1], proj[i2])) {
          hasPoint = true;
          break;
        }
      }
      if (hasPoint) continue;  // Not an ear - contains other vertices

      // Valid ear found! Emit the triangle using original face indices
      triangles.push([face[i0], face[i1], face[i2]]);
      
      // Remove the ear vertex from the working polygon
      idxArr.splice(i, 1);
      
      return true;  // Successfully clipped one ear
    }
    return false;  // No ear found (shouldn't happen for valid simple polygons)
  }

  // Main loop: clip ears until only one triangle remains
  // Guard prevents infinite loops on malformed input
  while (idxArr.length > 3 && guard++ < 100) {
    if (!clipEarLocal()) break;  // No ear found - polygon might be malformed
  }
  
  // Emit the final triangle (the last 3 vertices)
  if (idxArr.length === 3) triangles.push([face[idxArr[0]], face[idxArr[1]], face[idxArr[2]]]);

  return triangles;
}

// Legacy global export removed; import `triangulateFaceEarClipping` where needed.
