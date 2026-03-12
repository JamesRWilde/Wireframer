export function filterValidEdges(E, V) {
  const n = V.length;
  return (E || []).filter(e =>
    Array.isArray(e) && e.length === 2 &&
    Number.isInteger(e[0]) && Number.isInteger(e[1]) &&
    e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1]
  );
}
