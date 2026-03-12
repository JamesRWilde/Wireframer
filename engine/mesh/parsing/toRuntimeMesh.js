import { parseObjLines } from './parseObjLines.js';
import { validateRawObjText } from './validateRawObjText.js';
import { checkParseResults } from './checkParseResults.js';
import { buildMeshObject } from './buildMeshObject.js';

export function toRuntimeMesh(rawObjText, overrides = {}) {
  if (rawObjText === undefined || rawObjText === null) {
    console.error('[toRuntimeMesh] Input mesh is undefined/null.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ' });
    throw new Error('[toRuntimeMesh] Input mesh is undefined/null');
  }
  if (typeof rawObjText !== 'string') {
    console.error('[toRuntimeMesh] Input mesh is not a string.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ', inputType: typeof rawObjText });
    throw new Error('Mesh definition must be an OBJ string.');
  }
  // Debug logging removed to avoid console spam
  const parseStart = Date.now();

  // split + validate lines
  const lines = validateRawObjText(rawObjText, overrides);

  // parse into raw data
  const {uniqueVerts, faces, failingLines} = parseObjLines(lines, overrides);
  globalThis.lastMeshParseErrors = failingLines;
  console.log(`[toRuntimeMesh] parse complete: uniqueVerts=${uniqueVerts.length}, F=${faces.length}, errors=${failingLines.length}, duration=${Date.now()-parseStart}ms`);

  // check for parse errors
  checkParseResults(uniqueVerts, faces, failingLines, overrides);

  // build final mesh object
  const meshObj = buildMeshObject(uniqueVerts, faces);

  // sanity validate
  if (!Array.isArray(meshObj.V) || !Array.isArray(meshObj.F)) {
    console.error('[toRuntimeMesh] Returned mesh object V or F is not an array.', meshObj);
    throw new Error('[toRuntimeMesh] Returned mesh object V or F is not an array');
  }
  return meshObj;
}

// Expose to global scope for loader.js (legacy global path)
globalThis.toRuntimeMesh = toRuntimeMesh;