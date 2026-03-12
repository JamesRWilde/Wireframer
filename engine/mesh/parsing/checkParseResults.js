// Throws an error if parsing results indicate failure (empty verts or faces
// or any parse errors recorded).  Returns nothing on success.
export function checkParseResults(uniqueVerts, faces, failingLines, overrides = {}) {
  if (uniqueVerts.length === 0 || faces.length === 0 || failingLines.length > 0) {
    console.error('[toRuntimeMesh] Mesh load failure:', {
      meshFile: overrides.meshFileName || 'unknown',
      meshType: overrides.meshType || 'OBJ',
      vertices: uniqueVerts.length,
      faces: faces.length,
      errors: failingLines.slice(0, 10),
      errorCount: failingLines.length
    });
    throw new Error('[toRuntimeMesh] Mesh load failure');
  }
}