

// Populate OBJECTS from window.WIREFRAME_MESHES for UI

window.OBJECTS = [];
if (window.WIREFRAME_MESHES) {
  for (const [name, mesh] of Object.entries(window.WIREFRAME_MESHES)) {
    // Use mesh.name if present, else fallback to filename key
    const displayName = mesh.name || name;
    window.OBJECTS.push({
      name: displayName,
      build: ({ detail } = {}) => {
        // If mesh has LODs, pick the highest detail (or closest to requested detail)
        if (Array.isArray(mesh.lods) && mesh.lods.length) {
          // Pick the LOD with the highest detail value (or closest to requested detail)
          let best = mesh.lods[0];
          if (typeof detail === 'number') {
            let bestDelta = Math.abs((best.detail ?? 1) - detail);
            for (const lod of mesh.lods) {
              const delta = Math.abs((lod.detail ?? 1) - detail);
              if (delta < bestDelta) {
                best = lod;
                bestDelta = delta;
              }
            }
          } else {
            // fallback: pick highest detail
            best = mesh.lods.reduce((a, b) => (b.detail > a.detail ? b : a), mesh.lods[0]);
          }
          // Return in canonical format
          return {
            format: mesh.format || 'indexed-polygons-v1',
            positions: best.positions,
            faces: best.faces,
            edges: best.edges,
            shadingMode: mesh.shadingMode || best.shadingMode || 'auto',
            creaseAngleDeg: mesh.creaseAngleDeg || best.creaseAngleDeg,
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
