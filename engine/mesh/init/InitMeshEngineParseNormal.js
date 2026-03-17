/**
 * parseNormal.js - OBJ Normal Line Parser
 * 
 * PURPOSE:
 *   Parses an OBJ vertex normal line ("vn") into a 3D normal vector.
 *   Normals are used for lighting calculations to determine how surfaces
 *   reflect light.
 * 
 * ARCHITECTURE ROLE:
 *   Called by parseObjLines for each "vn" line in the OBJ file. Stores
 *   parsed normals in the state for later use when building faces.
 * 
 * OBJ NORMAL FORMAT:
 *   vn nx ny nz
 *   Where nx, ny, nz are the normal vector components.
 *   Example: "vn 0.0 1.0 0.0" (upward-pointing normal)
 */

/**
 * parseNormal - Parses an OBJ normal line
 * 
 * @param {Array<string>} parts - Line parts (e.g., ["vn", "0.0", "1.0", "0.0"])
 * @param {Object} state - Parse state with normals array
 */
export function InitMeshEngineParseNormal(parts, state) {
  // Validate: normal line must have 3 components
  if (parts.length < 4) return;
  
  // Parse normal components
  const nx = Number(parts[1]);
  const ny = Number(parts[2]);
  const nz = Number(parts[3]);
  
  // Validate: all components must be valid numbers
  if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nz)) return;
  
  // Add normal to state
  state.normals.push([nx, ny, nz]);
}