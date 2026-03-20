/**
 * physicsState.js - Rotation Physics and Input State
 *
 * PURPOSE:
 *   Centralized state for rotation physics (angular velocities, rotation matrix,
 *   auto-rotation targets) and pointer input tracking (dragging, pointer position).
 *   Provides getters and setters so consumers use module state directly.
 *
 * ARCHITECTURE ROLE:
 *   Single source of truth for physics state. Writers (input handlers, physics
 *   update) call setters; readers (rendering, telemetry) call getters. The
 *   rotation matrix R is the primary output — the render pipeline reads it
 *   each frame to transform vertices.
 *
 * STATE PROPERTIES:
 *   - R: Rotation matrix (Float32Array, 3x3)
 *   - wx, wy, wz: Angular velocities (radians per frame)
 *   - AUTO_WX, AUTO_WY, AUTO_WZ: Target auto-rotation velocities
 *   - dragging: Whether user is currently dragging
 *   - lastPointerX, lastPointerY: Last pointer position for delta calculation
 *   - HOLD_ROTATION_FRAMES: Frames to pause rotation
 *   - _axisAngleX, _axisAngleY: Internal auto-rotation wander state
 */

"use strict";

/**
 * physicsState - Centralized mutable rotation physics state.
 * This module may only define state values. Getters and setters are
 * implemented in engine/get/render/physicsState.js and engine/set/render/physicsState.js.
 */
export const physicsState = {
  R: null,
  wx: 0,
  wy: 0,
  wz: 0,
  AUTO_WX: 0.01,
  AUTO_WY: 0.015,
  AUTO_WZ: 0.0025,
  dragging: false,
  lastPointerX: null,
  lastPointerY: null,
  HOLD_ROTATION_FRAMES: 0,
  axisAngleX: 0,
  axisAngleY: 0,
};

/** @returns {number} Angular velocity around X */
export function getWx() { return _wx; }

/** @returns {number} Angular velocity around Y */
export function getWy() { return _wy; }

/** @returns {number} Angular velocity around Z */
export function getWz() { return _wz; }

/** @returns {number} Target auto-rotation velocity around X */
export function getAutoWx() { return _AUTO_WX; }

/** @returns {number} Target auto-rotation velocity around Y */
export function getAutoWy() { return _AUTO_WY; }

/** @returns {number} Target auto-rotation velocity around Z */
export function getAutoWz() { return _AUTO_WZ; }

/** @returns {boolean} Whether user is currently dragging */
export function isDragging() { return _dragging; }

/** @returns {number|null} Last pointer X position */
export function getLastPointerX() { return _lastPointerX; }

/** @returns {number|null} Last pointer Y position */
export function getLastPointerY() { return _lastPointerY; }

/** @returns {number} Frames remaining to pause rotation */
export function getHoldRotationFrames() { return _HOLD_ROTATION_FRAMES; }

/** @returns {number} Auto-rotation X oscillator angle */
export function getAxisAngleX() { return _axisAngleX; }

/** @returns {number} Auto-rotation Y oscillator angle */
export function getAxisAngleY() { return _axisAngleY; }

// ══════════════════════════════════════════════
// Setters
// ══════════════════════════════════════════════

/** @param {Float32Array|null} r - Rotation matrix */
export function setRotation(r) { _R = r; }

/** @param {number} v - Angular velocity around X */
export function setWx(v) { _wx = v; }

/** @param {number} v - Angular velocity around Y */
export function setWy(v) { _wy = v; }

/** @param {number} v - Angular velocity around Z */
export function setWz(v) { _wz = v; }

/** @param {number} v - Target auto-rotation velocity around X */
export function setAutoWx(v) { _AUTO_WX = v; }

/** @param {number} v - Target auto-rotation velocity around Y */
export function setAutoWy(v) { _AUTO_WY = v; }

/** @param {number} v - Target auto-rotation velocity around Z */
export function setAutoWz(v) { _AUTO_WZ = v; }

/** @param {boolean} v - Whether user is dragging */
export function setDragging(v) { _dragging = v; }

/** @param {number|null} v - Last pointer X position */
export function setLastPointerX(v) { _lastPointerX = v; }

/** @param {number|null} v - Last pointer Y position */
export function setLastPointerY(v) { _lastPointerY = v; }

/** @param {number} v - Frames to pause rotation */
export function setHoldRotationFrames(v) { _HOLD_ROTATION_FRAMES = v; }

/** @param {number} v - Auto-rotation X oscillator angle */
export function setAxisAngleX(v) { _axisAngleX = v; }

/** @param {number} v - Auto-rotation Y oscillator angle */
export function setAxisAngleY(v) { _axisAngleY = v; }

// ══════════════════════════════════════════════
// Convenience helpers
// ══════════════════════════════════════════════

/**
 * decrementHoldRotationFrames - Decrements the hold counter by 1.
 * Call when rotation is paused to count down.
 *
 * @returns {void}
 */
export function decrementHoldRotationFrames() {
  _HOLD_ROTATION_FRAMES--;
}

/**
 * applyFriction - Applies friction to angular velocities (dragging deceleration).
 *
 * Multiplies all three velocities by the given factor (default 0.85).
 * Used when the user is dragging to create smooth deceleration.
 *
 * @param {number} [factor=0.85] - Friction factor (0-1, lower = more friction)
 * @returns {void}
 */
export function applyFriction(factor = 0.85) {
  _wx *= factor;
  _wy *= factor;
  _wz *= factor;
}

/**
 * easeTowardAuto - Eases angular velocities toward auto-rotation targets.
 *
 * Moves each velocity 4% of the way toward its auto target per call.
 * Used when not dragging to produce smooth continuous rotation.
 *
 * @returns {void}
 */
export function easeTowardAuto() {
  _wx += (_AUTO_WX - _wx) * 0.04;
  _wy += (_AUTO_WY - _wy) * 0.04;
  _wz += (_AUTO_WZ - _wz) * 0.04;
}
