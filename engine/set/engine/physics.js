/**
 * physics.js - Rotation Physics Update
 *
 * PURPOSE:
 *   Updates the model's rotation each frame based on angular velocities and
 *   user input. Handles auto-rotation, drag friction, and rotation matrix
 *   maintenance (re-orthogonalization to prevent drift).
 *
 * ARCHITECTURE ROLE:
 *   Called by runFrame() each frame before rendering. Updates the rotation
 *   matrix via physicsState setters so the rendering pipeline reads a fresh
 *   matrix each frame to transform vertices.
 *
 * PHYSICS MODEL:
 *   - Angular velocities (wx, wy, wz) control rotation speed around each axis
 *   - Auto-rotation gradually eases velocities toward AUTO_* targets
 *   - User drag applies friction to slow rotation
 *   - Rotation matrix is periodically re-orthogonalized to prevent numerical drift
 */

"use strict";

import { applyEulerIncrement } from '@engine/get/render/applyEulerIncrement.js';
import { reorthogonalize } from '@engine/get/render/reorthogonalize.js';
import { state } from '@engine/state/engine/loop.js';
import { getRotation } from '@engine/get/render/getRotation.js';
import { getWx } from '@engine/get/render/getWx.js';
import { getWy } from '@engine/get/render/getWy.js';
import { getWz } from '@engine/get/render/getWz.js';
import { getAutoWx } from '@engine/get/render/getAutoWx.js';
import { getAutoWy } from '@engine/get/render/getAutoWy.js';
import { getAutoWz } from '@engine/get/render/getAutoWz.js';
import { isDragging } from '@engine/get/render/isDragging.js';
import { getHoldRotationFrames } from '@engine/get/render/getHoldRotationFrames.js';
import { getAxisAngleX } from '@engine/get/render/getAxisAngleX.js';
import { getAxisAngleY } from '@engine/get/render/getAxisAngleY.js';
import { setRotation } from '@engine/set/render/setRotation.js';
import { setAutoWx } from '@engine/set/render/setAutoWx.js';
import { setAutoWy } from '@engine/set/render/setAutoWy.js';
import { setAutoWz } from '@engine/set/render/setAutoWz.js';
import { setAxisAngleX } from '@engine/set/render/setAxisAngleX.js';
import { setAxisAngleY } from '@engine/set/render/setAxisAngleY.js';
import { decrementHoldRotationFrames } from '@engine/set/render/decrementHoldRotationFrames.js';
import { applyFriction } from '@engine/set/render/applyFriction.js';
import { easeTowardAuto } from '@engine/set/render/easeTowardAuto.js';

/**
 * physics - Updates rotation physics for the current frame.
 *
 * 1. Checks if rotation is paused (HOLD_ROTATION_FRAMES > 0)
 * 2. Applies angular velocity to rotation matrix
 * 3. Periodically re-orthogonalizes the rotation matrix
 * 4. Updates angular velocities based on drag state
 *
 * @returns {number} Time spent on physics update (milliseconds)
 */
export function physics() {
  const physStartMs = performance.now();

  // Check if rotation is paused (user is interacting)
  if (getHoldRotationFrames() > 0) {
    decrementHoldRotationFrames();
  } else {
    // Rotation is active — apply angular velocities to rotation matrix
    const currentR = getRotation();
    applyEulerIncrement(currentR, getWx(), getWy(), getWz());

    // Periodically re-orthogonalize to prevent numerical drift (~2s at 60fps)
    if ((++state.frameCount) % 120 === 0) {
      setRotation(reorthogonalize(getRotation()));
    }

    if (isDragging()) {
      // User dragging — apply friction for smooth deceleration
      applyFriction(0.85);
    } else {
      // Not dragging — ease toward auto-rotation targets
      easeTowardAuto();

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
  }

  return performance.now() - physStartMs;
}
