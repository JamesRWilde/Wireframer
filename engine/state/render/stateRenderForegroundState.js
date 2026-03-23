/**
 * renderForegroundState.js - Foreground render function pointer state
 *
 * PURPOSE:
 *   Contains the mutable state for the active foreground render function
 *   and GPU mode flag. This module ONLY holds the state variables.
 *
 * ARCHITECTURE ROLE:
 *   State module in engine/state/render/. The getter and setter modules
 *   in engine/get/render/ and engine/set/render/ provide controlled access.
 *
 * STATE:
 *   - _renderForeground: The active render function (or null)
 *   - _isGpuMode: Boolean flag indicating GPU rendering is active
 */

"use strict";

export let renderForegroundState = {
  _renderForeground: null,
  _isGpuMode: false
};
