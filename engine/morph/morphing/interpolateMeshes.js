export function interpolateMeshes(fromMesh, toMesh, t) {
  const n = Math.max(fromMesh.V.length, toMesh.V.length);
  const V = [];
  for (let i = 0; i < n; i++) {
    const a = fromMesh.V[i % fromMesh.V.length];
    const b = toMesh.V[i % toMesh.V.length];
    V.push([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ]);
  }
  return {
    V,
    F: toMesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    E: toMesh.E.map(e => e.slice()),
    _shadingMode: toMesh._shadingMode,
    _creaseAngleDeg: toMesh._creaseAngleDeg,
    groups: toMesh.groups ? toMesh.groups.slice() : undefined,
    objects: toMesh.objects ? toMesh.objects.slice() : undefined,
    smoothingGroups: toMesh.smoothingGroups ? toMesh.smoothingGroups.slice() : undefined,
    triangleNormals: toMesh.triangleNormals ? toMesh.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: toMesh.triangleUVs ? toMesh.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}
