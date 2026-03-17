/**
 * parseVertex.js - OBJ Vertex Line Parser
 * 
 * PURPOSE:
 *   Parses an OBJ vertex position line ("v") into a 3D coordinate.
 *   Vertex positions define the geometry of the mesh in 3D space.
 * 
 * ARCHITECTURE ROLE:
 *   Called by parseObjLines for each "v" line in the OBJ file. Stores
 *   parsed vertices in the state for later use when building faces.
 * 
 * OBJ VERTEX FORMAT:
 *   v x y z [w]
 *   Where x, y, z are the 3D coordinates. Optional w is ignored.
 *   Example: "v 1.0 2.0 3.0"
 */

/**
 * parseVertex - Parses an OBJ vertex line
 * 
 * @param {Array<string>} parts - Line parts (e.g., ["v", "1.0", "2.0", "3.0"])
 * @param {Object} state - Parse state with vertices array and failingLines
 */
export function InitMeshEngineParseVertex(parts, state) {
  // Validate: vertex line must have at least 3 components
  if (parts.length < 4) {
    state.failingLines.push(`[${state.lineNumber}] Invalid vertex (too few fields): '${parts.join(' ')}`);
    return;
  }
  
  // Parse vertex components
  const vx = Number(parts[1]);
  const vy = Number(parts[2]);
  const vz = Number(parts[3]);
  
  // Validate: all components must be valid numbers
  if (!Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(vz)) {
    state.failingLines.push(`[${state.lineNumber}] Invalid vertex (non-numeric): '${parts.join(' ')}`);
    return;
  }
  
  // Add vertex to state
  state.vertices.push([vx, vy, vz]);
}