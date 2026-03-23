/**
 * setRenderForegroundState.js - Foreground Render Function State
 *
 * PURPOSE:
 *   Holds the mutable reference to the active foreground render function.
 *   Both getter and setter modules access this same state variable.
 *
 * ARCHITECTURE ROLE:
 *   Single source of truth for the render function pointer. The setter
 *   updates this value during initialization or mode switches. The getter
 *   returns it for actual rendering.
 *
 * WHY THIS EXISTS:
 *   ES module exports are read-only bindings, so we can't reassign the
 *   export directly. Wrapping the function pointer in an object allows
 *   mutation while maintaining the module encapsulation pattern.
 *
 * USAGE:
 *   This module should NOT be imported directly by consumers.
 *   Use setGetRenderForeground.js and setRenderForeground.js instead.
 */

"use strict";

/**
 * @type {{ fn: Function|null }} Active foreground render function wrapper
 * We use an object with a property so the reference can be mutated
 * without violating ES module read-only binding rules.
 */
export const renderForegroundState = {
  fn: null
};
