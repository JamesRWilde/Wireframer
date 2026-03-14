/**
 * faceQuadric.js - Face Plane Quadric Construction
 * 
 * PURPOSE:
 *   Constructs a quadric error metric for a triangle face's plane. The quadric
 *   represents the squared distance from any point to the plane containing
 *   the triangle. This is used in Quadric Error Metrics (QEM) mesh simplification.
 * 
 * ARCHITECTURE ROLE:
 *   Used by LOD algorithms to compute per-vertex quadrics by summing the
 *   quadrics of all adjacent faces. The resulting vertex quadric measures
 *   how far a point is from the planes of all faces touching that vertex.
 * 
 * MATHEMATICAL BASIS:
 *   For a plane with normal n = [nx, ny, nz] and distance d from origin:
 *   The plane equation is: nx*x + ny*y + nz*z + d = 0
 *   
 *   The quadric matrix Q for this plane is:
 *   Q = [nx*nx  nx*ny  nx*nz  nx*d]
 *       [nx*ny  ny*ny  ny*nz  ny*d]
 *       [nx*nz  ny*nz  nz*nz  nz*d]
 *       [nx*d   ny*d   nz*d   d*d ]
 *   
 *   The squared distance from point p to the plane is: p^T * Q * p
 */

"use strict";

// Import vector normalization
import { normalize } from './normalize.js';

// Import cross product for normal calculation
import { cross } from './cross.js';

// Import dot product for distance calculation
import { dot } from './dot.js';

/**
 * faceQuadric - Constructs quadric for a triangle's plane
 * 
 * @param {Array<number>} a - First vertex [x, y, z]
 * @param {Array<number>} b - Second vertex [x, y, z]
 * @param {Array<number>} c - Third vertex [x, y, z]
 * 
 * @returns {Array<number>} Quadric as 10-element array [a,b,c,d,e,f,g,h,i,j]
 *   Represents the upper triangle of the 4x4 quadric matrix
 */
export function faceQuadric(a, b, c) {
  // Compute face normal via cross product of edge vectors
  const normal = normalize(cross(
    [b[0]-a[0], b[1]-a[1], b[2]-a[2]],  // Edge vector a->b
    [c[0]-a[0], c[1]-a[1], c[2]-a[2]]   // Edge vector a->c
  ));
  
  // Compute plane distance from origin: d = -n·a
  const d = -dot(normal, a);
  
  // Extract normal components
  const [nx, ny, nz] = normal;
  
  // Construct quadric matrix (upper triangle as flat array)
  return [nx*nx, nx*ny, nx*nz, nx*d, ny*ny, ny*nz, ny*d, nz*nz, nz*d, d*d];
}
