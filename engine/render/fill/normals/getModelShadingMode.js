export function getModelShadingMode(model, triFaces) {
  // Engine-owned mesh only
  const mode = (model && model._shadingMode) || 'auto';
  if (mode === 'flat' || mode === 'smooth') return mode;
  return triFaces.length > 80 ? 'smooth' : 'flat';
}
