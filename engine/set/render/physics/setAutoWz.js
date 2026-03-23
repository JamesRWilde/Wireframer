/**
 * setAutoWz.js - Physics state setter
 *
 * PURPOSE:
 *   Updates physics state property AUTO_WZ.
 *
 * ARCHITECTURE ROLE:
 *   Used by input and simulation logic to mutate physics state.
 *
 * WHY THIS EXISTS:
 *   Single-function-per-file setter impl for clean architecture.
 */

"use strict";

import { physicsState } from '@engine/state/render/statePhysicsState.js';

export function setAutoWz(value) {
  physicsState.AUTO_WZ = value;
}
