import { state } from '../../../core/loop/loopState.js';
import { project } from './project.js';

export function getModelFrameData(model) {
  if (!model?.V?.length) return null;
  if (model._frameData?.id === state.RENDER_FRAME_ID) return model._frameData;

  const V = model.V;
  let T = model._cacheT;
  let P2 = model._cacheP2;
  if (!T || T.length !== V.length || !P2 || P2.length !== V.length) {
    T = new Array(V.length);
    P2 = new Array(V.length);
    for (let i = 0; i < V.length; i++) {
      T[i] = [0, 0, 0];
      P2[i] = [0, 0];
    }
    model._cacheT = T;
    model._cacheP2 = P2;
  }

  const Rmat = globalThis.PHYSICS_STATE?.R;
  if (!Rmat) return null;
  const r00 = Rmat[0], r01 = Rmat[1], r02 = Rmat[2];
  const r10 = Rmat[3], r11 = Rmat[4], r12 = Rmat[5];
  const r20 = Rmat[6], r21 = Rmat[7], r22 = Rmat[8];
  // Clamp ZOOM and Z_HALF to avoid degenerate projections
  const zHalf = Math.max(0.1,
    Math.min(100, 0.5 * Math.hypot(Rmat[0], Rmat[3], Rmat[6])));

  // compute constants once per frame for projection
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fov = Math.min(w, h) * 0.9 * globalThis.ZOOM;
  const halfW = w * 0.5;
  const halfH = h * 0.5;
  const modelCy = globalThis.MODEL_CY;

  // Project all vertices
  for (let i = 0; i < V.length; i++) {
    // transformed vertex in camera/physics space
    const tx = r00 * V[i][0] + r01 * V[i][1] + r02 * V[i][2];
    const ty = r10 * V[i][0] + r11 * V[i][1] + r12 * V[i][2];
    const tz = r20 * V[i][0] + r21 * V[i][1] + r22 * V[i][2];
    // store rotated 3D coords in T so normals computed from T are correct
    T[i][0] = tx;
    T[i][1] = ty;
    T[i][2] = tz;
    // now compute projected screen coords into P2 for drawing
    const d = tz + 3;
    P2[i][0] = halfW + tx * fov / d;
    P2[i][1] = halfH - (ty - modelCy) * fov / d;
  }

  const id = state.RENDER_FRAME_ID;
  model._frameData = { id, T, P2, zHalf };

  // For a fixed light source in world space, we need to transform normals
  // from the rotated coordinate system back to world space. Store the
  // inverse rotation matrix (transpose for orthogonal matrices) so lighting
  // can transform normals to world space for consistent illumination.
  if (Rmat) {
    globalThis.LIGHT_DIR_CAM = null; // Not needed - we transform normals instead
    globalThis.R_INV = [
      r00, r10, r20,  // First column of R^T
      r01, r11, r21,  // Second column of R^T  
      r02, r12, r22   // Third column of R^T
    ];
  }

  return model._frameData;
}