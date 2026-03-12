export function filterValidEdges(E, V) {
  if (!globalThis.buildEdgesFromFacesRuntime) {
    // Fallback edge builder
    return E ? E.filter(e => Array.isArray(e) && e.length === 2 && e[0] !== e[1]) : [];
  }
  return globalThis.buildEdgesFromFacesRuntime(E) || [];
}
