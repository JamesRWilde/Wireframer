// Performs initial validation on the raw OBJ string and returns an array of
// lines. Throws if the input is null/undefined or not a string or if splitting
// produced no lines.
export function validateRawObjText(rawObjText, overrides = {}) {
  if (rawObjText === undefined || rawObjText === null) {
    console.error('[toRuntimeMesh] Input mesh is undefined/null.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ' });
    throw new Error('[toRuntimeMesh] Input mesh is undefined/null');
  }
  if (typeof rawObjText !== 'string') {
    console.error('[toRuntimeMesh] Input mesh is not a string.', { meshFile: overrides.meshFileName || 'unknown', meshType: overrides.meshType || 'OBJ', inputType: typeof rawObjText });
    throw new Error('Mesh definition must be an OBJ string.');
  }
  // debug log removed
  const lines = rawObjText.split(/\r?\n/);
  if (!Array.isArray(lines) || lines.length === 0) {
    console.error('[toRuntimeMesh] OBJ lines array is invalid or empty.', lines);
    throw new Error('[toRuntimeMesh] OBJ lines array is invalid or empty');
  }
  return lines;
}