/**
 * getMorphDuration.js - Get Morph Duration
 *
 * PURPOSE:
 *   Returns the current morph animation duration in milliseconds.
 *
 * ARCHITECTURE ROLE:
 *   Getter for the morph animation duration from morphState.
 *
 * WHY THIS EXISTS:
 *   Centralizes morph timing configuration and provides an easy hook for
 *   animation control and progress computations.
 *
 * USAGE:
 *   import { getMorphDuration } from '@engine/get/mesh/getMorphDuration.js';
 *   const duration = getMorphDuration();
 */

"use strict";

// Import morph state for duration parameter retrieval.
import { morphState } from '@engine/state/mesh/stateMorphState.js';

export function getMorphDuration() {
  return morphState.durationMs;
}
