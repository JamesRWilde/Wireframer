/**
 * toggle.js - Toggle Between GPU and CPU Rendering
 * 
 * PURPOSE:
 *   Switches between GPU and CPU rendering pipelines when the user
 *   clicks the renderer stat in the HUD. Disposes the current pipeline
 *   completely and initializes the other one.
 * 
 * ARCHITECTURE ROLE:
 *   Called by rendererToggle.js during app startup to attach the click
 *   handler. Manages the complete pipeline swap including cleanup.
 */

"use strict";

import { isGpuMode } from '@engine/set/render/isGpuMode.js';
import { switchToCpuMode } from '@engine/set/render/switchToCpuMode.js';
import { switchToGpuMode } from '@engine/set/render/switchToGpuMode.js';

/**
 * toggleRenderMode - Switches between GPU and CPU rendering
 *
 * Called when user clicks the renderer stat in the HUD. Disposes the
 * current pipeline completely and initializes the other one.
 *
 * @returns {boolean} true if toggle succeeded, false if not supported
 */
export function toggleRenderMode() {
  return isGpuMode() ? switchToCpuMode() : switchToGpuMode();
}


