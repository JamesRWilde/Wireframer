// Engine-owned triangulation: returns array of [a,b,c] triangle indices for all faces in model.F
function getModelTriangles(model) {
  if (!model || !model.F || !model.V) return [];
  const tris = [];
  for (const face of model.F) {
    if (face.length === 3) {
      tris.push([face[0], face[1], face[2]]);
    } else if (face.length > 3) {
      // Use engine's ear clipping for n-gons
      const tri = triangulateFaceEarClipping(face, model.V);
      for (const t of tri) tris.push(t);
    }
  }
  return tris;
}
// Expose globally for all engine modules
window.getModelTriangles = getModelTriangles;
