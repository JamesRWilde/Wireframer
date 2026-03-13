export function normalizeFaces(F) {
  if (!Array.isArray(F) || F.length === 0) return [];
  const first = F[0];
  if (first && typeof first === 'object' && 'indices' in first) {
    return F.map(f => f.indices);
  }
  return F;
}
