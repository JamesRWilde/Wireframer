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
 * WHY THIS EXISTS:
 *   Preserves the header convention while fully capturing intent of the
 *   physics state module for future maintainers.
 *
 * STATE PROPERTIES:
 *   - R: Rotation matrix (Float32Array, 3x3)
 *   - wx, wy, wz: Angular velocities (radians per frame)
 *   - AUTO_WX, AUTO_WY, AUTO_WZ: Target auto-rotation velocities
 *   - dragging: Whether user is currently dragging
 *   - lastPointerX, lastPointerY: Last pointer position for delta calculation
 *   - axisAngleX, axisAngleY: Internal auto-rotation wander state
 */

"use strict";

/** Centralized mutable rotation physics state. */
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

// This file stores only physics state and does not export any accessors.
// Getters and setters are implemented in dedicated one-function-per-file
// modules in engine/get/render/physics and engine/set/render/physics.

// End of statePhysicsState.js

