

// Populate OBJECTS from window.WIREFRAME_MESHES for UI

window.OBJECTS = [];
if (window.WIREFRAME_MESHES) {
  for (const [name, mesh] of Object.entries(window.WIREFRAME_MESHES)) {
    // Use mesh.name if present, else fallback to filename key
    const displayName = mesh.name || name;
    let highLod = null;
    if (Array.isArray(mesh.lods) && mesh.lods.length) {
      // Find highest detail LOD only
      highLod = mesh.lods.reduce((a, b) => (b.detail > a.detail ? b : a), mesh.lods[0]);
    }
    window.OBJECTS.push({
      name: displayName,
      build: () => {
        // Always use highest detail LOD
        if (highLod) {
          return {
            format: mesh.format || 'indexed-polygons-v1',
            positions: highLod.positions,
            faces: highLod.faces,
            edges: highLod.edges,
            shadingMode: mesh.shadingMode || highLod.shadingMode || 'auto',
            creaseAngleDeg: mesh.creaseAngleDeg || highLod.creaseAngleDeg,
          };
        }
        // No LODs, return as-is
        return mesh;
      },
      shadingMode: mesh._shadingMode || mesh.shadingMode || mesh.shading || 'auto',
      creaseAngleDeg: mesh._creaseAngleDeg || mesh.creaseAngleDeg,
    });
  }
  // Sort alphabetically for dropdown
  window.OBJECTS.sort((a, b) => a.name.localeCompare(b.name));
}

// Loader for static mesh data from window.WIREFRAME_MESHES
window.loadMeshByName = function(name, callback) {
  if (window.WIREFRAME_MESHES && window.WIREFRAME_MESHES[name]) {
    callback(null, window.WIREFRAME_MESHES[name]);
  } else {
    callback(new Error('Mesh not found: ' + name));
  }
};
