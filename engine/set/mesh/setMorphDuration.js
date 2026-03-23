/**
 * setMorphDuration.js - Set Morph Duration
 *
 * PURPOSE:
 *   Sets the duration of morph animations in milliseconds.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the morph animation duration stored in morphState.
 *
 * USAGE:
 *   import { setMorphDuration } from '@engine/set/mesh/setMorphDuration.js';
 *   setMorphDuration(1600);
 */

"use strict";

import { morphState } from '@engine/state/mesh/stateMorphState.js';

export function setMorphDuration(ms) {
  morphState.durationMs = ms;
}
