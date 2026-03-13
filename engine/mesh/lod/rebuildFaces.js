export function rebuildFaces(F, oldToNew) {
  const newFaces = [];
  for (const face of F) {
    const tri = face.map(idx => oldToNew.get(idx));
    if (tri.includes(undefined)) continue;
    if (new Set(tri).size === 3) newFaces.push(tri);
  }
  return newFaces;
}
