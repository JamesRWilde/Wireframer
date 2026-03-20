/**
 * getMorph.js - Get Morph API
 *
 * PURPOSE:
 *   Returns the current morph animation API function.
 *
 * ARCHITECTURE ROLE:
 *   Getter for the morph animation function from morphState.
 *
 * USAGE:
 *   import { getMorph } from '@engine/get/mesh/getMorph.js';
 *   const morphFn = getMorph();
 */

"use strict";

import { morphState } from '@engine/state/mesh/morphState.js';

export function getMorph() {
  return morphState.api;
}
