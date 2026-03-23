/**
 * setAutoWy.js - Physics state setter
 *
 * PURPOSE:
 *   Updates physics state property AUTO_WY.
 *
 * ARCHITECTURE ROLE:
 *   Used by input and simulation logic to mutate physics state.
 *
 * WHY THIS EXISTS:
 *   Single-function-per-file setter impl for clean architecture.
 */

"use strict";

import { physicsState } from '@engine/state/render/statePhysicsState.js';

export function setAutoWy(value) {
  physicsState.AUTO_WY = value;
}
