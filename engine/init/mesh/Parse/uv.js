/**
 * parseUv.js - OBJ Texture Coordinate Line Parser
 * 
 * PURPOSE:
 *   Parses an OBJ texture coordinate line ("vt") into a 2D UV coordinate.
 *   UV coordinates map 2D textures onto 3D surfaces, defining how texture
 *   pixels correspond to mesh vertices.
 * 
 * ARCHITECTURE ROLE:
 *   Called by parseObjLines for each "vt" line in the OBJ file. Stores
 *   parsed UVs in the state for later use when building faces.
 * 
 * OBJ UV FORMAT:
 *   vt u v
 *   Where u and v are texture coordinates (typically 0-1 range).
 *   Example: "vt 0.5 0.5" (center of texture)
 */

/**
 * parseUv - Parses an OBJ texture coordinate line
 * 
 * @param {Array<string>} parts - Line parts (e.g., ["vt", "0.5", "0.5"])
 * @param {Object} state - Parse state with uvs array
 */
export function uv(parts, state) {
  // Validate: UV line must have 2 components
  if (parts.length < 3) return;
  
  // Parse UV components
  const u = Number(parts[1]);
  const v = Number(parts[2]);
  
  // Validate: both components must be valid numbers
  if (!Number.isFinite(u) || !Number.isFinite(v)) return;
  
  // Add UV to state
  state.uvs.push([u, v]);
}