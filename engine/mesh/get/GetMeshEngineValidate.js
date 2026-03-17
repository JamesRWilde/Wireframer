/**
 * GetMeshEngineValidate.js - Mesh Data Validation
 * 
 * PURPOSE:
 *   Validates that a mesh object has the required structure and minimum
 *   data needed for rendering. This catches errors early in the loading
 *   pipeline with clear error messages.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineLoad before processing mesh data. Ensures the mesh
 *   has valid V (vertices) and F (faces) arrays with minimum counts.
 * 
 * WHY VALIDATE:
 *   Mesh data can be malformed due to:
 *   - Parser errors
 *   - Invalid OBJ files
 *   - Network corruption
 *   - Programming errors in mesh generators
 *   Early validation prevents cryptic errors later in the pipeline.
 */

/**
 * GetMeshEngineValidate - Validates mesh data structure and content
 * 
 * @param {Object} mesh - The mesh object to validate
 * @param {string} name - Display name for error messages
 * @param {string} meshFileName - Source filename for error messages
 * @param {string} meshType - Mesh format type for error messages
 * 
 * @throws {Error} If mesh is invalid, with detailed error message
 * 
 * Validation checks:
 * 1. Mesh is not null or undefined
 * 2. V array exists and has at least 3 vertices
 * 3. F array exists and has at least 1 face
 */
export function GetMeshEngineValidate(mesh, name, meshFileName, meshType) {
  // Check 1: Mesh must exist (not null or undefined)
  if (mesh === undefined || mesh === null) {
    throw new Error(`[InitMeshEngineLoad] Mesh input is ${mesh === null ? 'null' : 'undefined'} for '${name}'.\n  - Source: mesh file did not return a valid OBJ string.`);
  }
  
  // Check 2: Must have at least 3 vertices (smallest valid mesh is a triangle)
  if (!Array.isArray(mesh.V) || mesh.V.length < 3) {
    throw new Error(`[InitMeshEngineLoad] Mesh must have at least 3 vertices.\n  - mesh.V: ${mesh.V ? mesh.V.length : 'missing'}\n  - Mesh file: ${meshFileName || name}\n  - Mesh type: ${meshType}`);
  }
  
  // Check 3: Must have at least 1 face
  if (!Array.isArray(mesh.F) || mesh.F.length < 1) {
    throw new Error(`[InitMeshEngineLoad] Mesh must have at least 1 face.\n  - mesh.F: ${mesh.F ? mesh.F.length : 'missing'}\n  - Mesh file: ${meshFileName || name}\n  - Mesh type: ${meshType}`);
  }
}
