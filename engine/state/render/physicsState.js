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
 *   - _axisAngleX, _axisAngleY: Internal auto-rotation wander state
 */

"use strict";

/**
 * physicsState - Centralized mutable rotation physics state.
 * This module only defines the state object. Getters, setters, and actions
 * are implemented in engine/get/render/physics/ and engine/set/render/physics/.
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
  axisAngleX: 0,
  axisAngleY: 0,
};
