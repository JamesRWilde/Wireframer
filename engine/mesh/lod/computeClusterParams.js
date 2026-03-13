export function computeClusterParams(targetFaces, extent) {
  const clusterCount = Math.max(2, Math.cbrt(targetFaces * 2));
  const cellSize = extent / clusterCount;
  return { clusterCount, cellSize };
}
