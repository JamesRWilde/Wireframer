/**
 * checkParseResults.js - Parse Result Validation
 * 
 * PURPOSE:
 *   Validates that OBJ parsing produced usable results. Throws an error
 *   if the mesh has no vertices, no faces, or if any parse errors were
 *   encountered during parsing.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineToRuntime after parsing completes. Acts as a gatekeeper
 *   to ensure only valid meshes proceed to the rendering pipeline.
 * 
 * WHY VALIDATE:
 *   A mesh with no vertices or faces cannot be rendered. Parse errors
 *   may indicate corrupted or malformed OBJ files. Failing fast with
 *   a clear error message helps diagnose loading issues.
 */

/**
 * checkParseResults - Validates parsing results and throws on failure
 * 
 * @param {Array} uniqueVerts - Parsed unique vertices
 * @param {Array} faces - Parsed faces
 * @param {Array<string>} failingLines - Parse error messages
 * @param {Object} [overrides={}] - Options for error messages
 * 
 * @throws {Error} If vertices or faces are empty, or if parse errors occurred
 */
export function parseCheckResults(uniqueVerts, faces, failingLines, overrides = {}) {
  // Check for empty mesh or parse errors
  if (uniqueVerts.length === 0 || faces.length === 0 || failingLines.length > 0) {
    console.error('[InitMeshEngineToRuntime] Mesh load failure:', {
      meshFile: overrides.meshFileName || 'unknown',
      meshType: overrides.meshType || 'OBJ',
      vertices: uniqueVerts.length,
      faces: faces.length,
      errors: failingLines.slice(0, 10),  // Show first 10 errors
      errorCount: failingLines.length
    });
    throw new Error('[InitMeshEngineToRuntime] Mesh load failure');
  }
}