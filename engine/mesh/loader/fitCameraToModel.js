import { computeFrameParams } from '../../render/camera/projection/computeFrameParams.js';

export function fitCameraToModel(model) {
  // sync frame parameters directly
  const params = computeFrameParams(model.V);
  // update globals used by projection and depth bucketing
  if (typeof params.cy === 'number') globalThis.MODEL_CY = params.cy;
  if (typeof params.zHalf === 'number') globalThis.Z_HALF = params.zHalf;

  if (params?.zHalf > 0) {
    let fitZoom = 0.5 * (params.zHalf + 3) / params.zHalf;
    fitZoom = Math.max(globalThis.ZOOM_MIN ?? 0.45, Math.min(globalThis.ZOOM_MAX ?? 2.75, fitZoom));
    globalThis.ZOOM = fitZoom;
    console.log(`[loadMesh-autoFitCamera] MODEL_CY=${params.cy?.toFixed(3)}, Z_HALF=${params.zHalf.toFixed(3)}, fitZoom=${fitZoom.toFixed(3)}`);
  }
}
