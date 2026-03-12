export function collectEdges(adjacency) {
  const edges = [];
  adjacency.forEach((neighbors, idx) => {
    neighbors.forEach((neighbor) => {
      if (idx < neighbor) edges.push([idx, neighbor]);
    });
  });
  return edges;
}
