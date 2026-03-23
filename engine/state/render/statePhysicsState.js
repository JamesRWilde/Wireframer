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

// --- Getters ---

/** Returns auto-rotation target x angular velocity. */
export function getAutoWx() { return physicsState.AUTO_WX; }

/** Returns auto-rotation target y angular velocity. */
export function getAutoWy() { return physicsState.AUTO_WY; }

/** Returns auto-rotation target z angular velocity. */
export function getAutoWz() { return physicsState.AUTO_WZ; }

/** Returns axis-angle x component. */
export function getAxisAngleX() { return physicsState.axisAngleX; }

/** Returns axis-angle y component. */
export function getAxisAngleY() { return physicsState.axisAngleY; }

/** Returns last recorded pointer x position. */
export function getLastPointerX() { return physicsState.lastPointerX; }

/** Returns last recorded pointer y position. */
export function getLastPointerY() { return physicsState.lastPointerY; }

/** Returns 4x4 rotation matrix. */
export function getRotation() { return physicsState.R; }

/** Returns x-axis angular velocity. */
export function getWx() { return physicsState.wx; }

/** Returns y-axis angular velocity. */
export function getWy() { return physicsState.wy; }

/** Returns z-axis angular velocity. */
export function getWz() { return physicsState.wz; }

/** Returns whether the user is currently dragging. */
export function isDragging() { return physicsState.dragging; }

// --- Setters ---

/** Sets auto-rotation target angular velocity around x. */
export function setAutoWx(value) { physicsState.AUTO_WX = value; }

/** Sets auto-rotation target angular velocity around y. */
export function setAutoWy(value) { physicsState.AUTO_WY = value; }

/** Sets auto-rotation target angular velocity around z. */
export function setAutoWz(value) { physicsState.AUTO_WZ = value; }

/** Sets axis-angle x component for rotation. */
export function setAxisAngleX(value) { physicsState.axisAngleX = value; }

/** Sets axis-angle y component for rotation. */
export function setAxisAngleY(value) { physicsState.axisAngleY = value; }

/** Sets whether the user is currently dragging. */
export function setDragging(value) { physicsState.dragging = value; }

/** Sets last recorded pointer x position. */
export function setLastPointerX(value) { physicsState.lastPointerX = value; }

/** Sets last recorded pointer y position. */
export function setLastPointerY(value) { physicsState.lastPointerY = value; }

/** Sets 4x4 rotation matrix. */
export function setRotation(value) { physicsState.R = value; }

/** Sets x-axis angular velocity. */
export function setWx(value) { physicsState.wx = value; }

/** Sets y-axis angular velocity. */
export function setWy(value) { physicsState.wy = value; }

/** Sets z-axis angular velocity. */
export function setWz(value) { physicsState.wz = value; }
