export function computeFrameParams(vertices) {
  if (!Array.isArray(vertices) || vertices.length === 0) {
    return { cy: 0, zHalf: 1 };
  }
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let maxD2 = 0;
  for (const v of vertices) {
    if (v[1] < minY) minY = v[1];
    if (v[1] > maxY) maxY = v[1];
    if (v[2] < minZ) minZ = v[2];
    if (v[2] > maxZ) maxZ = v[2];
    const d2 = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    if (d2 > maxD2) maxD2 = d2;
  }
  const cy = (minY + maxY) * 0.5;
  const zHalf = Math.sqrt(maxD2) * 1.05;
  return { cy, zHalf };
}