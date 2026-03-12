// Converts an OBJ index token to zero-based index, handling negative indices.
// Returns null for invalid or zero values (OBJ indices are 1-based).
export function parseIndex(str, arrayLen) {
  if (!str) return null;
  let i = Number(str);
  if (!Number.isFinite(i) || i === 0) return null;
  return i > 0 ? i - 1 : arrayLen + i;
}