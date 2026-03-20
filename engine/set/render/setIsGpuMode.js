/**
 * setIsGpuMode.js - Set GPU Mode Flag
 *
 * PURPOSE:
 *   Sets whether GPU rendering mode is active.
 *
 * ARCHITECTURE ROLE:
 *   Setter for the GPU mode flag.
 *
 * USAGE:
 *   import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';
 *   setIsGpuMode(true);
 */

"use strict";

let _isGpuMode = false;

export function setIsGpuMode(value) {
  _isGpuMode = value;
}
