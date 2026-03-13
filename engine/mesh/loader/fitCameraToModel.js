import { computeFrameParams } from '../../render/camera/projection/computeFrameParams.js';

export function fitCameraToModel(model) {
  if (!model?.V?.length) return;

  // Compute bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const v of model.V) {
    if (v[0] < minX) minX = v[0];
    if (v[0] > maxX) maxX = v[0];
    if (v[1] < minY) minY = v[1];
    if (v[1] > maxY) maxY = v[1];
  }

  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const maxExtent = Math.max(sizeX, sizeY);

  // sync frame parameters directly
  const params = computeFrameParams(model.V);
  if (typeof params.cy === 'number') globalThis.MODEL_CY = params.cy;
  if (typeof params.zHalf === 'number') globalThis.Z_HALF = params.zHalf;

  // Set expanded zoom bounds
  globalThis.ZOOM_MIN = 0.1;
  globalThis.ZOOM_MAX = 10;

  if (maxExtent > 0) {
    // Projection: screenPos = dim/2 + coord * (minDim * 0.9 * ZOOM) / (z + 3)
    // For object at z=0 (center), d = 3
    // To fit maxExtent to targetScreenFraction of minDim:
    //   maxExtent * (minDim * 0.9 * ZOOM) / 3 = minDim * targetFraction
    //   ZOOM = 3 * targetFraction / (0.9 * maxExtent)
    
    const targetFraction = 0.5;
    const fitZoom = (3 * targetFraction) / (0.9 * maxExtent);
    
    globalThis.ZOOM = Math.max(globalThis.ZOOM_MIN, Math.min(globalThis.ZOOM_MAX, fitZoom));
    console.log(`[fitCameraToModel] bbox=[${sizeX.toFixed(2)}, ${sizeY.toFixed(2)}], maxExtent=${maxExtent.toFixed(3)}, ZOOM=${globalThis.ZOOM.toFixed(3)}`);
  }
}
