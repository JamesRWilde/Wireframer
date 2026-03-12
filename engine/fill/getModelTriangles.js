// Engine-owned triangulation: returns array of [a,b,c] triangle indices for all faces in model.F
import { triangulateFaceEarClipping } from './triangulation.js';

export function getModelTriangles(model) {
  if (!model?.F || !model?.V) return [];
  const tris = [];
  for (const face of model.F) {
    let indices = face?.indices ?? face;
    // If still not a flat array, try to flatten (handles nested arrays)
    if (Array.isArray(indices) && indices.length === 1 && Array.isArray(indices[0])) {
      indices = indices[0];
    }
    if (indices.length === 3) {
      tris.push([indices[0], indices[1], indices[2]]);
    } else if (indices.length > 3) {
      // Use engine's ear clipping for n-gons
      const tri = triangulateFaceEarClipping(indices, model.V);
      for (const t of tri) tris.push(t);
    }
  }
  return tris;
}
