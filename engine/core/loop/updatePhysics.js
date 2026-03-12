import { applyEulerIncrementInPlace } from '../../math/math3d/applyEulerIncrementInPlace.js';
import { reorthogonalize } from '../../math/math3d/reorthogonalize.js';
import { state } from './loopState.js';

export function updatePhysics() {
  const physStartMs = performance.now();
  // entry log removed to reduce console spam
  if (globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES > 0) {
    globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES = globalThis.PHYSICS_STATE.HOLD_ROTATION_FRAMES - 1;
  } else {
    const currentR = globalThis.PHYSICS_STATE.R;
    applyEulerIncrementInPlace(currentR, globalThis.PHYSICS_STATE.wx, globalThis.PHYSICS_STATE.wy, globalThis.PHYSICS_STATE.wz);
    if ((++state.frameCount) % 120 === 0) {
      globalThis.PHYSICS_STATE.R = reorthogonalize(globalThis.PHYSICS_STATE.R);
    }

    if (globalThis.PHYSICS_STATE.dragging) {
      // when user is manipulating, apply simple friction to the angular
      // velocity. identical to reference code.
      globalThis.PHYSICS_STATE.wx *= 0.85;
      globalThis.PHYSICS_STATE.wy *= 0.85;
      globalThis.PHYSICS_STATE.wz *= 0.85;
    } else {
      // reference implementation gradually eases the velocities towards the
      // AUTO_* targets. this produces a smooth continuous rotation without
      // the back‑and‑forth oscillation caused by adding a hard baseline.
      globalThis.PHYSICS_STATE.wx += (globalThis.PHYSICS_STATE.AUTO_WX - globalThis.PHYSICS_STATE.wx) * 0.04;
      globalThis.PHYSICS_STATE.wy += (globalThis.PHYSICS_STATE.AUTO_WY - globalThis.PHYSICS_STATE.wy) * 0.04;
      globalThis.PHYSICS_STATE.wz += (globalThis.PHYSICS_STATE.AUTO_WZ - globalThis.PHYSICS_STATE.wz) * 0.04;

      if (window.DEBUG_LOG_PHYSICS) {
        console.log('[updatePhysics] wx,wy,wz',
                    globalThis.PHYSICS_STATE.wx.toFixed(3),
                    globalThis.PHYSICS_STATE.wy.toFixed(3),
                    globalThis.PHYSICS_STATE.wz.toFixed(3));
        console.log('[updatePhysics] R row0',
                    globalThis.PHYSICS_STATE.R[0].toFixed(3),
                    globalThis.PHYSICS_STATE.R[1].toFixed(3),
                    globalThis.PHYSICS_STATE.R[2].toFixed(3));
      }
    }
  }
  return performance.now() - physStartMs;
}
