/**
 * sortVerticesForMorph.js - Vertex Sorting for Morph Preparation
 * 
 * PURPOSE:
 *   Sorts vertices in a consistent order for morphing. By sorting both
 *   source and target meshes with the same comparison function, we create
 *   a correspondence between vertices that produces smoother morph transitions.
 * 
 * ARCHITECTURE ROLE:
 *   Used during morph preparation to order vertices before creating point
 *   sets. The sorting ensures that vertices at similar positions in both
 *   meshes are matched together during interpolation.
 * 
 * HOW IT WORKS:
 *   1. Deep copy each vertex (to avoid mutating original)
 *   2. Sort using compareMorphVertices (Y, then angle, then radius)
 *   3. Return sorted array
 */

"use strict";

// Import the vertex comparison function for sorting
import { compareMorphVertices } from './compareMorphVertices.js';

/**
 * sortVerticesForMorph - Sorts vertices for morph correspondence
 * 
 * @param {Array<Array<number>>} vertices - Vertex positions to sort
 * 
 * @returns {Array<Array<number>>} Sorted copy of vertices
 *   Original array is not modified
 * 
 * The sorting order (defined by compareMorphVertices):
 * 1. Y coordinate (vertical position)
 * 2. Angle in XZ plane (horizontal direction)
 * 3. Distance from Y axis (radius)
 */
export function sortVerticesForMorph(vertices) {
  return vertices
    // Deep copy each vertex to avoid mutating original
    .map((v) => [v[0], v[1], v[2]])
    // Sort using morph-specific comparison
    .sort(compareMorphVertices);
}
