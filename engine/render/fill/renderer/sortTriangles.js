export function sortTriangles(triFaces, T) {
  // Reuse a cached array of entries to avoid allocating objects every frame.
  let triOrder = triFaces._triOrderCache;
  if (!triOrder || triOrder.length !== triFaces.length) {
    triOrder = new Array(triFaces.length);
    for (let i = 0; i < triFaces.length; i++) {
      triOrder[i] = { tri: null, triIndex: 0, z: 0 };
    }
    triFaces._triOrderCache = triOrder;
  }
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i].tri = tri;
    triOrder[i].triIndex = i;
    triOrder[i].z = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
  }
  triOrder.sort((a, b) => b.z - a.z);
  return triOrder;
}
