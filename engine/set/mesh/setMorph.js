/**
 * setMorph.js - Set Morph API
 *
 * PURPOSE:
 *   Sets the morph animation API function that defines how vertices interpolate.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the morph animation function stored in morphState.
 *
 * USAGE:
 *   import { setMorph } from '@engine/set/mesh/setMorph.js';
 *   setMorph(myMorphFunction);
 */

"use strict";

import { morphState } from '@engine/state/mesh/morphState.js';

export function setMorph(api) {
  morphState.api = api;
}
