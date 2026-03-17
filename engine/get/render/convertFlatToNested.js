/**
 * convertFlatToNested.js - Flat Array to Nested Array Converter
 *
 * PURPOSE:
 *   Converts flat Float32Array vertex data (packed as [x,y,z,x,y,z,...])
 *   back to nested arrays ([[x,y,z], [x,y,z], ...]) for use by modules
 *   that expect the standard vertex format.
 *
 * ARCHITECTURE ROLE:
 *   Called by frameData.js to convert worker transform results back to
 *   the nested array format used by the CPU fill renderer and other
 *   modules.
 *
 * DETAILS:
 *   The worker returns flat arrays for transfer efficiency. This
 *   converter restores the nested format without modifying the originals.
 */

"use strict";

/**
 * convertFlatToNested - Converts flat vertex/position arrays to nested format
 *
 * @param {Float32Array|Array} flatT - Flat 3D positions (x,y,z packed sequentially)
 * @param {Float32Array|Array} flatP2 - Flat 2D positions (x,y packed sequentially)
 * @param {number} vertexCount - Number of vertices
 * @returns {{ T: Array<Array<number>>, P2: Array<Array<number>> }}
 *   Nested arrays of 3D and 2D positions
 */
export function convertFlatToNested(flatT, flatP2, vertexCount) {
  const T = new Array(vertexCount);
  const P2 = new Array(vertexCount);

  for (let i = 0; i < vertexCount; i++) {
    // Compute flat indices: 3 components per 3D vertex, 2 components per 2D vertex
    const ti = i * 3;
    const pi = i * 2;

    // Reconstruct nested arrays from flat data
    T[i] = [flatT[ti], flatT[ti + 1], flatT[ti + 2]];
    P2[i] = [flatP2[pi], flatP2[pi + 1]];
  }

  return { T, P2 };
}
