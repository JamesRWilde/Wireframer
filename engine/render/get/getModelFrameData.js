import { state } from '../../../engine/loopState.js';
import { sendToWorker } from '../worker/sendToWorker.js';
import { getCachedTransformResult } from './getCachedTransformResult.js';
import { convertFlatToNested } from '../convertFlatToNested.js';
import { transformSync } from '../worker/transformSync.js';

export function getModelFrameData(model) {
  if (!model?.V?.length) return null;
  if (model._frameData?.id === state.RENDER_FRAME_ID) return model._frameData;

  const V = model.V;
  const vertexCount = V.length;
  const Rmat = globalThis.PHYSICS_STATE?.R;
  if (!Rmat) return null;

  const zHalf = Math.max(0.1,
    Math.min(100, 0.5 * Math.hypot(Rmat[0], Rmat[3], Rmat[6])));

  const w = globalThis.innerWidth;
  const h = globalThis.innerHeight;
  const fov = Math.min(w, h) * 0.9 * globalThis.ZOOM;
  const halfW = w * 0.5;
  const halfH = h * 0.5;
  const modelCy = globalThis.MODEL_CY;

  let T, P2;

  const flatV = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    flatV[i * 3] = V[i][0];
    flatV[i * 3 + 1] = V[i][1];
    flatV[i * 3 + 2] = V[i][2];
  }

  const flatR = new Float32Array(Rmat);
  sendToWorker(flatV, flatR, fov, halfW, halfH, modelCy, state.RENDER_FRAME_ID);

  const cached = getCachedTransformResult();
  if (cached?.T && cached?.P2) {
    const converted = convertFlatToNested(cached.T, cached.P2, vertexCount);
    T = converted.T;
    P2 = converted.P2;
  } else {
    const result = transformSync(V, Rmat, fov, halfW, halfH, modelCy, vertexCount);
    T = result.T;
    P2 = result.P2;
  }

  model._cacheT = T;
  model._cacheP2 = P2;
  const id = state.RENDER_FRAME_ID;
  model._frameData = { id, T, P2, zHalf };
  return model._frameData;
}
