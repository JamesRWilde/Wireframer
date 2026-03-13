export function computeBoundingBox(V) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const [x, y, z] of V) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  return { minX, maxX, minY, maxY, minZ, maxZ, extent };
}
