/**
 * buildVertexToFaces.js - Helper to build vertex-to-face adjacency list
 *
 * PURPOSE:
 *   For each vertex, records the indices of all faces (triangles) that include it.
 *   Used to quickly find all faces sharing a vertex, for normal smoothing and mesh analysis.
 *
 * @param {Array<Array<number>>} triFaces - Array of triangle vertex indices (each triangle is [v0, v1, v2])
 * @param {number} vertexCount - Number of vertices in the model
 * @returns {Array<Array<number>>} Array mapping vertex index to array of face indices
 *
 * HOW IT WORKS:
 *   - Allocates an array of length vertexCount, each entry is an array of face indices.
 *   - For each triangle, adds its index to the adjacency list for each of its three vertices.
 *   - Result: vertexToFaces[v] gives all triangle indices that include vertex v.
 *
 * EXAMPLE USAGE:
 *   const vertexToFaces = buildVertexToFaces(triFaces, model.V.length);
 *   // vertexToFaces[vertexIndex] -> array of triangle indices
 */
export function cpuEngineBuildVertexToFaces(triFaces, vertexCount) {
  // Allocate output array: one entry per vertex
  const vertexToFaces = Array.from({ length: vertexCount }, () => []);
  // For each triangle, add its index to each of its three vertices' lists
  triFaces.forEach((tri, i) => {
    vertexToFaces[tri[0]].push(i);
    vertexToFaces[tri[1]].push(i);
    vertexToFaces[tri[2]].push(i);
  });
  // Return adjacency list: vertexToFaces[vertexIndex] = [faceIdx1, faceIdx2, ...]
  return vertexToFaces;
}
