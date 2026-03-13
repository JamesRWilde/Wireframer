export function createEdgeFilter(mode, edgeClassification) {
  if (!edgeClassification) return () => true;

  return (edge) => {
    const lo = Math.min(edge[0], edge[1]);
    const hi = Math.max(edge[0], edge[1]);
    const key = `${lo}|${hi}`;
    const cls = edgeClassification.get(key);

    if (mode === 'front') return cls === 'front' || cls === 'silhouette';
    if (mode === 'back') return cls === 'back' || cls === 'silhouette';
    return true;
  };
}
