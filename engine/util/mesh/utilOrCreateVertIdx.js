/**
 * orCreateVertIdx.js - Unique Vertex Index Management
 * 
 * PURPOSE:
 *   Manages unique vertex indices during OBJ parsing. OBJ format allows
 *   different faces to reference the same position with different normals
 *   or UVs. This function deduplicates vertices while preserving the
 *   position/normal/UV combinations.
 * 
 * ARCHITECTURE ROLE:
 *   Called by parseFace to get or create unique vertex indices. Maintains
 *   a map from (position/normal/UV) combinations to unique indices.
 * 
 * WHY DEDUPLICATION:
 *   OBJ format can have many duplicate vertex positions. Deduplication
 *   reduces memory usage and improves rendering performance while
 *   preserving the visual appearance (smooth normals, texture mapping).
 */

/**
 * orCreateVertIdx - Gets or creates a unique vertex index
 * 
 * @param {number} v - Vertex position index (0-based)
 * @param {number|null} vt - Texture coordinate index (0-based, or null)
 * @param {number|null} vn - Normal index (0-based, or null)
 * @param {Object} state - Parse state with vertices, uvs, normals, vertMap
 * 
 * @returns {number} Unique vertex index in uniqueVerts array
 * 
 * The function:
 * 1. Creates a key from the position/normal/UV combination
 * 2. Returns existing index if key already exists
 * 3. Otherwise creates new unique vertex and returns its index
 */
export function utilOrCreateVertIdx(v, vt, vn, state) {
  // Create unique key from position/normal/UV indices
  const key = `${v}/${vt ?? ''}/${vn ?? ''}`;
  
  // Return existing index if this combination already exists
  if (state.vertMap.has(key)) return state.vertMap.get(key);
  
  // Get position, UV, and normal data (with defaults for missing data)
  const pos = state.vertices[v] || [0,0,0];
  const uv = (vt !== null && state.uvs[vt]) ? state.uvs[vt] : [0,0];
  const norm = (vn !== null && state.normals[vn]) ? state.normals[vn] : [0,0,0];
  
  // Create full vertex: [x, y, z, u, v, nx, ny, nz]
  const fullVert = [pos[0], pos[1], pos[2], uv[0], uv[1], norm[0], norm[1], norm[2]];
  
  // Add to unique vertices array and get its index
  const idx = state.uniqueVerts.length;
  state.uniqueVerts.push(fullVert);
  
  // Store mapping for future lookups
  state.vertMap.set(key, idx);
  
  return idx;
}