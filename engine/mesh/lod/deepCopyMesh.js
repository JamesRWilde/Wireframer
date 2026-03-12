export function deepCopyMesh(model) {
  return {
    V: model.V.map(v => v.slice()),
    F: model.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    E: model.E ? model.E.map(e => e.slice()) : [],
    _meshFormat: model._meshFormat,
    _shadingMode: model._shadingMode,
    _creaseAngleDeg: model._creaseAngleDeg,
    groups: model.groups ? model.groups.slice() : undefined,
    objects: model.objects ? model.objects.slice() : undefined,
    smoothingGroups: model.smoothingGroups ? model.smoothingGroups.slice() : undefined,
    triangleNormals: model.triangleNormals ? model.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: model.triangleUVs ? model.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}