'use strict';

/**
 * setApplyFriction.js - Angular Velocity Friction
 *
 * PURPOSE:
 *   Applies a friction factor to all angular velocity components,
 *   causing the model's rotation to gradually slow down. This
 *   simulates rotational damping for a natural deceleration effect.
 *
 * ARCHITECTURE ROLE:
 *   Called each physics frame to decay rotation speeds. The default
 *   factor of 0.85 reduces velocities by 15% per frame.
 *
 * WHY THIS EXISTS:
 *   Encapsulates rotation damping behavior so motion physics are central and
 *   easily adjustable from one function.
 */

import { physicsState } from '@engine/state/render/statePhysicsState.js';

/**
 * Multiplies angular velocities by a friction factor to slow rotation.
 * @param {number} [factor=0.85] - The friction multiplier (0-1). Lower = more friction.
 * @returns {void}
 */
export function setApplyFriction(factor = 0.85) {
  physicsState.wx *= factor;
  physicsState.wy *= factor;
  physicsState.wz *= factor;
}
