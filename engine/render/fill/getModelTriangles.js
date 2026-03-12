export function getModelTriangles(model) {
  if (!model) return [];
  if (model.triangles) return model.triangles;
  if (model.F) return model.F.map(f => f.indices || f);
  return [];
}
