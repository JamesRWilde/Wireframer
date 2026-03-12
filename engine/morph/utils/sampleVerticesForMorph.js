export function sampleVerticesForMorph(vertices, count) {
  const n = vertices.length;
  if (count >= n) return vertices.slice();
  const result = [];
  const used = new Set();
  while (result.length < count) {
    const idx = Math.floor(Math.random() * n);
    if (!used.has(idx)) {
      used.add(idx);
      result.push(vertices[idx]);
    }
  }
  return result;
}
