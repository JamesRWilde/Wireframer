export function computeFrameParams(vertices) {
  // keep this copy for legacy imports; it simply proxies to the projection
  // implementation which now exports the same helper. This avoids importing
  // the whole projection module in non-rendering code.
  const { computeFrameParams: proj } = await import('../../render/camera/projection/computeFrameParams.js');
  return proj(vertices);
}
