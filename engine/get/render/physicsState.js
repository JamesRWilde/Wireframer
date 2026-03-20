'use strict';

import { physicsState } from '@engine/state/render/physicsState.js';

export function getRotation() { return physicsState.R; }
export function getWx() { return physicsState.wx; }
export function getWy() { return physicsState.wy; }
export function getWz() { return physicsState.wz; }
export function getAutoWx() { return physicsState.AUTO_WX; }
export function getAutoWy() { return physicsState.AUTO_WY; }
export function getAutoWz() { return physicsState.AUTO_WZ; }
export function isDragging() { return physicsState.dragging; }
export function getLastPointerX() { return physicsState.lastPointerX; }
export function getLastPointerY() { return physicsState.lastPointerY; }
export function getHoldRotationFrames() { return physicsState.HOLD_ROTATION_FRAMES; }
export function getAxisAngleX() { return physicsState.axisAngleX; }
export function getAxisAngleY() { return physicsState.axisAngleY; }
