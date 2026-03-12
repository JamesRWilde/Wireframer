export function validateMesh(mesh, name, meshFileName, meshType) {
  if (mesh === undefined || mesh === null) {
    throw new Error(`[loadMesh] Mesh input is ${mesh === null ? 'null' : 'undefined'} for '${name}'.\n  - Source: mesh file did not return a valid OBJ string.`);
  }
  if (!Array.isArray(mesh.V) || mesh.V.length < 3) {
    throw new Error(`[loadMesh] Mesh must have at least 3 vertices.\n  - mesh.V: ${mesh.V ? mesh.V.length : 'missing'}\n  - Mesh file: ${meshFileName || name}\n  - Mesh type: ${meshType}`);
  }
  if (!Array.isArray(mesh.F) || mesh.F.length < 1) {
    throw new Error(`[loadMesh] Mesh must have at least 1 face.\n  - mesh.F: ${mesh.F ? mesh.F.length : 'missing'}\n  - Mesh file: ${meshFileName || name}\n  - Mesh type: ${meshType}`);
  }
}
