/**
 * toRuntime.js - OBJ Text to Runtime Mesh Conversion
 * 
 * PURPOSE:
 *   Converts raw OBJ file text into the engine's internal mesh format.
 *   This is the primary entry point for OBJ parsing, orchestrating the
 *   complete pipeline from raw text to ready-to-use mesh object.
 * 
 * ARCHITECTURE ROLE:
 *   Called by loader.js when loading OBJ files. Consumers import the
 *   function directly and parse OBJ text without relying on globals.
 *
 * WHY THIS EXISTS:
 *   Centralizes OBJ parsing and validation into one place so all
 *   loaders produce consistent mesh objects and error handling.
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
import { parseObjLines }from '@engine/init/mesh/parse/initParseObjLines.js';

// Import raw text validator
import { utilRawObjText }from '@engine/util/mesh/utilRawObjText.js';

// Import parse result checker
import { utilParseCheckResults }from '@engine/util/mesh/utilParseCheckResults.js';

// Import mesh object builder
import { buildObject }from '@engine/init/mesh/build/initBuildObject.js';

// Import winding correction
import { utilFixedWinding }from '@engine/util/mesh/utilFixedWinding.js';
import { setMeshParseErrors } from '@engine/set/mesh/setMeshParseErrors.js';

/**
 * toRuntime - Converts OBJ text to engine mesh format
 * 
 * @param {string} rawObjText - Raw OBJ file content as string
 * @param {Object} [overrides={}] - Optional overrides for error messages
 * @param {string} [overrides.meshFileName] - Source filename for errors
 * @param {string} [overrides.meshType] - Mesh format type for errors
 * 
 * @returns {Object} Mesh object with V, F, E arrays and metadata
 * @throws {Error} If input is invalid or parsing fails critically
 */
export async function toRuntime(text, overrides = {}) {
  // Validate input is not null/undefined
  if (text === undefined || text === null) {
    console.error('[toRuntime] Input mesh is undefined/null.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ' });
    throw new Error('[toRuntime] Input mesh is undefined/null');
  }
  
  // Validate input is a string
  if (typeof text !== 'string') {
    console.error('[toRuntime] Input mesh is not a string.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ', inputType: typeof text });
    throw new Error('Mesh definition must be an OBJ string.');
  }
  
  // Step 1: Split text into lines and validate format
  const lines = utilRawObjText(text, overrides);

  // Step 2: Parse lines into raw mesh data
  const {uniqueVerts, faces, rawEdges, rawLines, materialSections, failingLines} = await parseObjLines(lines, overrides);

  // Store parse errors in shared state for debugging
  setMeshParseErrors(failingLines);

  // Step 3: Check for parse errors
  utilParseCheckResults(uniqueVerts, faces, failingLines, overrides);

  // Step 4: Build final mesh object with all properties
  // Passes raw edges, lines, and material sections through — no auto-deriving
  const meshObj = buildObject(uniqueVerts, faces, rawEdges, rawLines, materialSections);

  // Step 5: Fix face winding (detect inward normals and flip if needed)
  utilFixedWinding(meshObj);

  // Step 6: Sanity validate the result
  if (!Array.isArray(meshObj.V) || !Array.isArray(meshObj.F)) {
    console.error('[toRuntime] Returned mesh object V or F is not an array.', meshObj);
    throw new Error('[toRuntime] Returned mesh object V or F is not an array');
  }

  return meshObj;
}

// No global export; consumers should import toRuntime directly
