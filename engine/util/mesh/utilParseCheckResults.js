/**
 * checkParseResults.js - Parse Result Validation
 * 
 * PURPOSE:
 *   Validates that OBJ parsing produced usable results. Throws an error
 *   if the mesh has no vertices, no faces, or if any parse errors were
 *   encountered during parsing.
 * 
 * ARCHITECTURE ROLE:
 *   Called by toRuntime after parsing completes. Acts as a gatekeeper
 *   to ensure only valid meshes proceed to the rendering pipeline.
 * 
 * WHY THIS EXISTS:
 *   Prevents invalid or incomplete mesh data from entering the render
 *   pipeline. Quick failure at parse stage avoids undefined behavior
 *   and simplifies debugging of importer issues.
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
export function utilParseCheckResults(uniqueVerts, faces, failingLines, overrides = {}) {
  // Check for empty mesh or parse errors
  if (uniqueVerts.length === 0 || faces.length === 0 || failingLines.length > 0) {
    console.error('[toRuntime] Mesh load failure:', {
      meshFile: overrides.meshFileName || 'unknown',
      meshType: overrides.meshType || 'OBJ',
      vertices: uniqueVerts.length,
      faces: faces.length,
      errors: failingLines.slice(0, 10),  // Show first 10 errors
      errorCount: failingLines.length
    });
    throw new Error('[toRuntime] Mesh load failure');
  }
}