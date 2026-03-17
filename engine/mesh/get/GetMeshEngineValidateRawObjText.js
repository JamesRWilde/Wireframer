/**
 * GetMeshEngineValidateRawObjText.js - Raw OBJ Text Validation
 * 
 * PURPOSE:
 *   Validates raw OBJ file text and splits it into lines for parsing.
 *   This is the first step in the OBJ parsing pipeline, ensuring the
 *   input is valid before attempting to parse it.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineToRuntime before parsing begins. Acts as a gatekeeper
 *   to catch invalid input early with clear error messages.
 * 
 * VALIDATION CHECKS:
 *   1. Input is not null or undefined
 *   2. Input is a string
 *   3. Splitting produces at least one line
 */

/**
 * GetMeshEngineValidateRawObjText - Validates and splits raw OBJ text
 * 
 * @param {string} rawObjText - Raw OBJ file content
 * @param {Object} [overrides={}] - Options for error messages
 * @param {string} [overrides.meshFileName] - Source filename for errors
 * @param {string} [overrides.meshType] - Mesh format type for errors
 * 
 * @returns {Array<string>} Array of OBJ file lines
 * @throws {Error} If input is invalid
 */
export function GetMeshEngineValidateRawObjText(rawObjText, overrides = {}) {
  // Check for null/undefined input
  if (rawObjText === undefined || rawObjText === null) {
    console.error('[InitMeshEngineToRuntime] Input mesh is undefined/null.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ' });
    throw new Error('[InitMeshEngineToRuntime] Input mesh is undefined/null');
  }
  
  // Check for string type
  if (typeof rawObjText !== 'string') {
    console.error('[InitMeshEngineToRuntime] Input mesh is not a string.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ', inputType: typeof rawObjText });
    throw new Error('Mesh definition must be an OBJ string.');
  }
  
  // Split text into lines (handles both Unix and Windows line endings)
  const lines = rawObjText.split(/\r?\n/);
  
  // Validate that we got at least one line
  if (!Array.isArray(lines) || lines.length === 0) {
    console.error('[InitMeshEngineToRuntime] OBJ lines array is invalid or empty.', lines);
    throw new Error('[InitMeshEngineToRuntime] OBJ lines array is invalid or empty');
  }
  
  return lines;
}