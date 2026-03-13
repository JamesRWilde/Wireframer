export function clusterVertices(V, cellMap) {
  const oldToNew = new Map();
  const newVerts = [];

  for (const indices of cellMap.values()) {
    if (!indices.length) continue;

    let sx = 0;
    let sy = 0;
    let sz = 0;
    for (const idx of indices) {
      sx += V[idx][0];
      sy += V[idx][1];
      sz += V[idx][2];
    }

    const newIdx = newVerts.length;
    newVerts.push([sx / indices.length, sy / indices.length, sz / indices.length]);
    for (const idx of indices) oldToNew.set(idx, newIdx);
  }

  return { newVerts, oldToNew };
}
