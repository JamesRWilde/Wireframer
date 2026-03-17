/**
 * idxFromToken.js - OBJ Face Token Parser
 * 
 * PURPOSE:
 *   Parses a single OBJ face token into vertex, texture, and normal indices.
 *   OBJ face tokens can be in several formats: "v", "v/vt", "v//vn", or "v/vt/vn".
 *   This function handles all formats and returns the parsed indices.
 * 
 * ARCHITECTURE ROLE:
 *   Called by parseFace to extract indices from each vertex reference in a face.
 *   Converts OBJ's 1-based indices to 0-based indices for internal use.
 * 
 * OBJ FACE FORMATS:
 *   - "v": Position only
 *   - "v/vt": Position and texture coordinate
 *   - "v//vn": Position and normal
 *   - "v/vt/vn": Position, texture coordinate, and normal
 */

// Import index parser for handling OBJ's 1-based indexing
import {index}from '@engine/init/mesh/Parse/index.js';

/**
 * idxFromToken - Parses an OBJ face token into indices
 * 
 * @param {string} token - OBJ face token (e.g., "1/2/3", "1//3", "1/2", "1")
 * @param {Object} state - Parse state with vertices, uvs, normals arrays
 * 
 * @returns {{ v: number, vt: number|null, vn: number|null }}
 *   v: Vertex position index (0-based, or -1 if invalid)
 *   vt: Texture coordinate index (0-based, or null if not specified)
 *   vn: Normal index (0-based, or null if not specified)
 */
export function idxFromToken(token, state) {
  // Split token by '/' to get individual indices
  const fields = token.split('/');
  
  // Parse vertex position index (required)
  const vIdx = InitMeshEngineParseIndex(fields[0], state.vertices.length);
  if (vIdx === null) return {v:-1, vt:null, vn:null};
  
  // Parse texture coordinate index (optional)
  const vtIdx = InitMeshEngineParseIndex(fields[1], state.uvs.length);
  
  // Parse normal index (optional)
  const vnIdx = InitMeshEngineParseIndex(fields[2], state.normals.length);
  
  return {v:vIdx, vt:vtIdx, vn:vnIdx};
}