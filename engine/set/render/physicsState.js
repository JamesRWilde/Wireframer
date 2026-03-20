'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function setRotation(v) { physicsState.R = v; }
export function setWx(v) { physicsState.wx = v; }
export function setWy(v) { physicsState.wy = v; }
export function setWz(v) { physicsState.wz = v; }
export function setAutoWx(v) { physicsState.AUTO_WX = v; }
export function setAutoWy(v) { physicsState.AUTO_WY = v; }
export function setAutoWz(v) { physicsState.AUTO_WZ = v; }
export function setDragging(v) { physicsState.dragging = v; }
export function setLastPointerX(v) { physicsState.lastPointerX = v; }
export function setLastPointerY(v) { physicsState.lastPointerY = v; }
export function setHoldRotationFrames(v) { physicsState.HOLD_ROTATION_FRAMES = v; }
export function setAxisAngleX(v) { physicsState.axisAngleX = v; }
export function setAxisAngleY(v) { physicsState.axisAngleY = v; }

export function decrementHoldRotationFrames() {
  physicsState.HOLD_ROTATION_FRAMES -= 1;
}

export function applyFriction(factor = 0.85) {
  physicsState.wx *= factor;
  physicsState.wy *= factor;
  physicsState.wz *= factor;
}

export function easeTowardAuto() {
  physicsState.wx += (physicsState.AUTO_WX - physicsState.wx) * 0.04;
  physicsState.wy += (physicsState.AUTO_WY - physicsState.wy) * 0.04;
  physicsState.wz += (physicsState.AUTO_WZ - physicsState.wz) * 0.04;
}
