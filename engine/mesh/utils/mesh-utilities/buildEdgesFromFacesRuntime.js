export function buildEdgesFromFacesRuntime(faces) {
  const E = [];
  const edgeSet = new Set();

  function addEdge(a, b) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = `${lo}|${hi}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    E.push([lo, hi]);
  }

  for (const face of faces || []) {
    let indices = face && face.indices ? face.indices : face;
    // If still not a flat array, try to flatten (handles nested arrays)
    if (Array.isArray(indices) && indices.length === 1 && Array.isArray(indices[0])) {
      indices = indices[0];
    }
    if (!Array.isArray(indices) || indices.length < 2) continue;
    for (let i = 0; i < indices.length; i++) {
      addEdge(indices[i], indices[(i + 1) % indices.length]);
    }
  }

  return E;
}
