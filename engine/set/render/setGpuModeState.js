/**
 * setGpuModeState.js - GPU Mode Flag State
 *
 * PURPOSE:
 *   Holds the mutable GPU mode flag. Both getter and setter modules
 *   access this same state variable.
 *
 * ARCHITECTURE ROLE:
 *   Single source of truth for whether GPU rendering is active.
 *
 * WHY THIS EXISTS:
 *   ES module exports are read-only bindings, so we can't reassign the
 *   export directly. Wrapping the boolean in an object allows mutation
 *   while maintaining the module encapsulation pattern.
 *
 * USAGE:
 *   This module should NOT be imported directly by consumers.
 *   Use isGpuMode.js and setIsGpuMode.js instead.
 */

"use strict";

/**
 * @type {{ value: boolean }} GPU mode flag wrapper
 * We use an object with a property so the reference can be mutated
 * without violating ES module read-only binding rules.
 */
export const gpuModeState = {
  value: false
};
