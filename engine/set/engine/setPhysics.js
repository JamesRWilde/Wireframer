/**
 * physics.js - Rotation Physics Update
 *
 * PURPOSE:
 *   Updates the model's rotation each frame based on angular velocities and
 *   user input. Handles auto-rotation, drag friction, and rotation matrix
 *   maintenance (re-orthogonalization to prevent drift).
 *
 * ARCHITECTURE ROLE:
 *   Called by setRunFrame() each frame before rendering. Updates the rotation
 *   matrix via physicsState setters so the rendering pipeline reads a fresh
 *   matrix each frame to transform vertices.
 *
 * WHY THIS EXISTS:
 *   Encapsulates per-frame rotation physics, including auto-rotation and drag,
 *   so the simulation can be maintained and tuned separately from rendering.
 *
 * PHYSICS MODEL:
 *   - Angular velocities (wx, wy, wz) control rotation speed around each axis
 *   - Auto-rotation gradually eases velocities toward AUTO_* targets
 *   - User drag applies friction to slow rotation
 *   - Rotation matrix is periodically re-orthogonalized to prevent numerical drift
 */

"use strict";

// Import Euler angle increment — applies angular velocity to rotation matrix
import { utilEulerIncrement } from '@engine/util/render/utilEulerIncrement.js';
// Import re-orthogonalization — corrects numerical drift in the rotation matrix
import { utilReorthogonalized } from '@engine/util/render/utilReorthogonalized.js';
// Import loop state — holds frame counter used for periodic re-orthogonalization
import { state } from '@engine/state/stateLoop.js';
// Import physics state getters/setters — rotation matrix, angular velocities, drag flags, axis angles
import { getRotation } from '@engine/get/render/physics/getRotation.js';
import { getWx } from '@engine/get/render/physics/getWx.js';
import { getWy } from '@engine/get/render/physics/getWy.js';
import { getWz } from '@engine/get/render/physics/getWz.js';
import { isDragging } from '@engine/get/render/physics/isDragging.js';
import { getAxisAngleX } from '@engine/get/render/physics/getAxisAngleX.js';
import { getAxisAngleY } from '@engine/get/render/physics/getAxisAngleY.js';
import { setRotation } from '@engine/set/render/physics/setRotation.js';
import { setAutoWx } from '@engine/set/render/physics/setAutoWx.js';
import { setAutoWy } from '@engine/set/render/physics/setAutoWy.js';
import { setAutoWz } from '@engine/set/render/physics/setAutoWz.js';
import { setAxisAngleX } from '@engine/set/render/physics/setAxisAngleX.js';
import { setAxisAngleY } from '@engine/set/render/physics/setAxisAngleY.js';
// Import friction applier — decelerates angular velocity during user drag
import { setApplyFriction } from '@engine/set/render/physics/setApplyFriction.js';
// Import auto-rotation ease — smoothly transitions velocities toward auto targets
import { setEaseTowardAuto } from '@engine/set/render/physics/setEaseTowardAuto.js';

/**
 * physics - Updates rotation physics for the current frame.
 *
 * 1. Applies angular velocity to rotation matrix
 * 3. Periodically re-orthogonalizes the rotation matrix
 * 4. Updates angular velocities based on drag state
 *
 * @returns {number} Time spent on physics update (milliseconds)
 */
export function setPhysics() {
  const physStartMs = performance.now();

  // Apply angular velocities to rotation matrix
  const currentR = getRotation();
  utilEulerIncrement(currentR, getWx(), getWy(), getWz());

  // Periodically re-orthogonalize to prevent numerical drift (~2s at 60fps)
  if ((++state.frameCount) % 120 === 0) {
    setRotation(utilReorthogonalized(getRotation()));
  }

  if (isDragging()) {
    // User dragging — apply friction for smooth deceleration
    setApplyFriction(0.85);
  } else {
    // Not dragging — ease toward auto-rotation targets
    setEaseTowardAuto();

    // Slowly orbit the spin axis through 3D space at fixed speed.
    // Two slow oscillators at different rates ensure the axis traces
    // a complex path that eventually visits every orientation.
    if (getAxisAngleX() === 0 && getAxisAngleY() === 0) {
      setAxisAngleX(Math.random() * Math.PI * 2);
      setAxisAngleY(Math.random() * Math.PI * 2);
    }

    // Slow oscillation rates (radians per frame at 60fps)
    // Full cycle: ~140s for X, ~200s for Y — different enough to avoid repetition
    setAxisAngleX(getAxisAngleX() + 0.00075);
    setAxisAngleY(getAxisAngleY() + 0.00052);

    const speed = 0.01;
    const ax = Math.sin(getAxisAngleX());
    const ay = Math.sin(getAxisAngleY());
    const az = Math.cos(getAxisAngleX()) * Math.cos(getAxisAngleY());
    const len = Math.hypot(ax, ay, az);
    setAutoWx((ax / len) * speed);
    setAutoWy((ay / len) * speed);
    setAutoWz((az / len) * speed);
  }

  return performance.now() - physStartMs;
}
