export function buildAdjacency(faces, vertCount) {
  const adj = new Array(vertCount).fill(0).map(() => new Set());
  for (const [a, b, c] of faces) {
    adj[a].add(b); adj[a].add(c);
    adj[b].add(a); adj[b].add(c);
    adj[c].add(a); adj[c].add(b);
  }
  return adj;
}
