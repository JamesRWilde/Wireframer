/**
 * toggleRenderMode.js - Toggle Between GPU and CPU Rendering
 *
 * PURPOSE:
 *   Switches between GPU and CPU rendering pipelines when called.
 *   Disposes the current pipeline completely and initializes the other one.
 *
 * ARCHITECTURE ROLE:
 *   Public entry point for renderer toggle. Called by HUD click handler.
 *
 * USAGE:
 *   import { toggleRenderMode } from '@engine/set/render/toggleRenderMode.js';
 *   toggleRenderMode();
 */

"use strict";

import { isGpuMode } from '@engine/set/render/isGpuMode.js';
import { switchToCpuMode } from '@engine/set/render/switchToCpuMode.js';
import { switchToGpuMode } from '@engine/set/render/switchToGpuMode.js';

export function toggleRenderMode() {
  return isGpuMode() ? switchToCpuMode() : switchToGpuMode();
}
