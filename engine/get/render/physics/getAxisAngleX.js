/**
 * getAxisAngleX.js - Physics state getter
 *
 * PURPOSE:
 *   Reads physics state property axisAngleX.
 *
 * ARCHITECTURE ROLE:
 *   Used by render and input modules for physics parameter queries.
 *
 * WHY THIS EXISTS:
 *   Single-function-per-file getter impl for clean architecture.
 */

"use strict";

import { physicsState } from '@engine/state/render/statePhysicsState.js';

export function getAxisAngleX() {
  return physicsState.axisAngleX;
}
