export function pruneLodCache(cache, maxSize = 12) {
  if (cache.size <= maxSize) return;
  const firstKey = cache.keys().next().value;
  cache.delete(firstKey);
}
