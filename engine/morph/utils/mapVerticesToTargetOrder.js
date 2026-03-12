export function mapVerticesToTargetOrder(sourceVertices, targetVertices) {
  const nSource = sourceVertices.length;
  const nTarget = targetVertices.length;
  if (!nSource) return targetVertices.map((v) => [v[0], v[1], v[2]]);

  const MAX_MORPH_POINTS = 300;
  const sampleCount = Math.min(MAX_MORPH_POINTS, nSource, nTarget);

  function randomSample(arr, count) {
    const n = arr.length;
    if (count >= n) return arr.slice();
    const result = [];
    const used = new Set();
    while (result.length < count) {
      const idx = Math.floor(Math.random() * n);
      if (!used.has(idx)) {
        used.add(idx);
        result.push(arr[idx]);
      }
    }
    return result;
  }

  const sourceSample = randomSample(sourceVertices, sampleCount);
  const targetSample = randomSample(targetVertices, sampleCount);

  function getBounds(vertices) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const [x, y, z] of vertices) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    return {
      minX, minY, minZ,
      sx: Math.max(1e-6, maxX - minX),
      sy: Math.max(1e-6, maxY - minY),
      sz: Math.max(1e-6, maxZ - minZ),
    };
  }

  function normalizePoint(v, b) {
    return [
      (v[0] - b.minX) / b.sx,
      (v[1] - b.minY) / b.sy,
      (v[2] - b.minZ) / b.sz,
    ];
  }

  const sourceBounds = getBounds(sourceSample);
  const targetBounds = getBounds(targetSample);
  const sourceNorm = sourceSample.map((v) => normalizePoint(v, sourceBounds));
  const targetNorm = targetSample.map((v) => normalizePoint(v, targetBounds));

  const used = new Array(sourceNorm.length).fill(false);
  const mapped = new Array(targetNorm.length);
  for (let j = 0; j < targetNorm.length; j++) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sourceNorm.length; i++) {
      if (used[i]) continue;
      const dx = sourceNorm[i][0] - targetNorm[j][0];
      const dy = sourceNorm[i][1] - targetNorm[j][1];
      const dz = sourceNorm[i][2] - targetNorm[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = i;
      }
    }
    used[bestIdx] = true;
    mapped[j] = [sourceSample[bestIdx][0], sourceSample[bestIdx][1], sourceSample[bestIdx][2]];
  }

  const mappedFull = new Array(nTarget);
  for (let j = 0; j < nTarget; j++) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < mapped.length; i++) {
      const dx = mapped[i][0] - targetVertices[j][0];
      const dy = mapped[i][1] - targetVertices[j][1];
      const dz = mapped[i][2] - targetVertices[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = i;
      }
    }
    mappedFull[j] = mapped[bestIdx];
  }
  return mappedFull;
}
