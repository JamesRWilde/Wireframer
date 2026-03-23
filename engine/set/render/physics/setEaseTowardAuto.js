'use strict';

/**
 * setEaseTowardAuto.js - Auto-Rotation Easing
 *
 * PURPOSE:
 *   Gradually interpolates the current angular velocities (wx, wy, wz)
 *   toward their auto-rotation targets (AUTO_WX, AUTO_WY, AUTO_WZ).
 *   Produces a smooth transition to automated spinning.
 *
 * ARCHITECTURE ROLE:
 *   Called each physics frame when auto-rotation is active. Uses a
 *   fixed easing factor of 0.04 for smooth interpolation.
 */

import { physicsState } from '@engine/state/render/statePhysicsState.js';

/**
 * Eases angular velocities toward their auto-rotation targets.
 * @returns {void}
 */
export function setEaseTowardAuto() {
  physicsState.wx += (physicsState.AUTO_WX - physicsState.wx) * 0.04;
  physicsState.wy += (physicsState.AUTO_WY - physicsState.wy) * 0.04;
  physicsState.wz += (physicsState.AUTO_WZ - physicsState.wz) * 0.04;
}
