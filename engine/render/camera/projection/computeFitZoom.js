export function computeFitZoom(params) {
  if (!params || !params.zHalf || params.zHalf <= 0 || typeof window === 'undefined') {
    return 1.0;
  }
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  // Solve for ZOOM: (minDim * 0.90 * ZOOM) * params.zHalf / (params.zHalf + 3) = minDim * 0.45
  // => ZOOM = 0.5 * (params.zHalf + 3) / params.zHalf
  const fitZoom = 0.5 * (params.zHalf + 3) / params.zHalf;
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoom));
}
