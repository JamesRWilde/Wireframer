export function cloneMesh(mesh) {
  return {
    V: mesh.V.map(v => v.slice()),
    F: mesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    E: mesh.E.map(e => e.slice()),
    _shadingMode: mesh._shadingMode,
    _creaseAngleDeg: mesh._creaseAngleDeg,
    groups: mesh.groups ? mesh.groups.slice() : undefined,
    objects: mesh.objects ? mesh.objects.slice() : undefined,
    smoothingGroups: mesh.smoothingGroups ? mesh.smoothingGroups.slice() : undefined,
    triangleNormals: mesh.triangleNormals ? mesh.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: mesh.triangleUVs ? mesh.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}
