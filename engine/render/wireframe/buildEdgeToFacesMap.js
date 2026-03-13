export function buildEdgeToFacesMap(triFaces) {
  const edgeToFaces = new Map();
  for (const [fi, tri] of triFaces.entries()) {
    const edges = [
      [tri[0], tri[1]],
      [tri[1], tri[2]],
      [tri[2], tri[0]],
    ];
    for (const [a, b] of edges) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (!edgeToFaces.has(key)) edgeToFaces.set(key, []);
      edgeToFaces.get(key).push(fi);
    }
  }
  return edgeToFaces;
}
