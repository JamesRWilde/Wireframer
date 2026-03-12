export function updateAdjacency(adjacency, u, v) {
  adjacency[v].forEach((neighbor) => {
    if (neighbor !== u) {
      adjacency[neighbor].delete(v);
      adjacency[neighbor].add(u);
      adjacency[u].add(neighbor);
    }
  });
  adjacency[v].clear();
}
