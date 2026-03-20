/**
 * getMorphDuration.js - Get Morph Duration
 *
 * PURPOSE:
 *   Returns the current morph animation duration in milliseconds.
 *
 * ARCHITECTURE ROLE:
 *   Getter for the morph animation duration from morphState.
 *
 * USAGE:
 *   import { getMorphDuration } from '@engine/get/mesh/getMorphDuration.js';
 *   const duration = getMorphDuration();
 */

"use strict";

import { morphState } from '@engine/state/mesh/morphState.js';

export function getMorphDuration() {
  return morphState.durationMs;
}
