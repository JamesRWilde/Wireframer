/**
 * isGpuMode.js - Check GPU Mode Active
 *
 * PURPOSE:
 *   Returns whether GPU rendering mode is currently active.
 *
 * ARCHITECTURE ROLE:
 *   Getter for the GPU mode flag.
 *
 * USAGE:
 *   import { isGpuMode } from '@engine/set/render/isGpuMode.js';
 *   if (isGpuMode()) { ... }
 */

"use strict";

let _isGpuMode = false;

export function isGpuMode() {
  return _isGpuMode;
}
