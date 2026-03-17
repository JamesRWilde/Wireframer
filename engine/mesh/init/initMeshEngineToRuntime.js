/**
 * InitMeshEngineToRuntime.js - OBJ Text to Runtime Mesh Conversion
 * 
 * PURPOSE:
 *   Converts raw OBJ file text into the engine's internal mesh format.
 *   This is the primary entry point for OBJ parsing, orchestrating the
 *   complete pipeline from raw text to ready-to-use mesh object.
 * 
 * ARCHITECTURE ROLE:
 *   Called by loader.js when loading OBJ files. Exposed globally as
 *   globalThis.InitMeshEngineToRuntime for flexible access.
 * 
 * PIPELINE:
 *   1. Validate input (must be non-null string)
 *   2. Split text into lines and validate format
 *   3. Parse lines into vertices, faces, normals, UVs
 *   4. Check for parse errors
 *   5. Build final mesh object with all properties
 *   6. Sanity validate the result
 */

// Import OBJ line parser
import { initMeshEngineParseObjLines } from ''./initMeshEngineParseObjLines.js'';

// Import raw text validator
import { getMeshEngineValidateRawObjText } from ''../get/getMeshEngineValidateRawObjText.js'';

// Import parse result checker
import { getMeshEngineParseCheckResults } from ''../get/getMeshEngineParseCheckResults.js'';

// Import mesh object builder
import { initMeshEngineBuildObject } from ''./initMeshEngineBuildObject.js'';

/**
 * InitMeshEngineToRuntime - Converts OBJ text to engine mesh format
 * 
 * @param {string} rawObjText - Raw OBJ file content as string
 * @param {Object} [overrides={}] - Optional overrides for error messages
 * @param {string} [overrides.meshFileName] - Source filename for errors
 * @param {string} [overrides.meshType] - Mesh format type for errors
 * 
 * @returns {Object} Mesh object with V, F, E arrays and metadata
 * @throws {Error} If input is invalid or parsing fails critically
 */
export function initMeshEngineToRuntime(rawObjText, overrides = {}) {
  // Validate input is not null/undefined
  if (rawObjText === undefined || rawObjText === null) {
    console.error('[InitMeshEngineToRuntime] Input mesh is undefined/null.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ' });
    throw new Error('[InitMeshEngineToRuntime] Input mesh is undefined/null');
  }
  
  // Validate input is a string
  if (typeof rawObjText !== 'string') {
    console.error('[InitMeshEngineToRuntime] Input mesh is not a string.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ', inputType: typeof rawObjText });
    throw new Error('Mesh definition must be an OBJ string.');
  }
  
  // Step 1: Split text into lines and validate format
  const lines = GetMeshEngineValidateRawObjText(rawObjText, overrides);

  // Step 2: Parse lines into raw mesh data
  const {uniqueVerts, faces, failingLines} = InitMeshEngineParseObjLines(lines, overrides);
  
  // Store parse errors globally for debugging
  globalThis.lastMeshParseErrors = failingLines;

  // Step 3: Check for parse errors
  GetMeshEngineParseCheckResults(uniqueVerts, faces, failingLines, overrides);

  // Step 4: Build final mesh object with all properties
  const meshObj = InitMeshEngineBuildObject(uniqueVerts, faces);

  // Step 5: Sanity validate the result
  if (!Array.isArray(meshObj.V) || !Array.isArray(meshObj.F)) {
    console.error('[InitMeshEngineToRuntime] Returned mesh object V or F is not an array.', meshObj);
    throw new Error('[InitMeshEngineToRuntime] Returned mesh object V or F is not an array');
  }
  
  return meshObj;
}

// Expose to global scope for loader.js (legacy global path)
globalThis.InitMeshEngineToRuntime = InitMeshEngineToRuntime;