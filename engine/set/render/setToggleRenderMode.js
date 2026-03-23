/**
 * setToggleRenderMode.js - Toggle Between GPU and CPU Rendering
 *
 * PURPOSE:
 *   Switches between GPU and CPU rendering pipelines when called.
 *   Disposes the current pipeline completely and initializes the other one.
 *
 * ARCHITECTURE ROLE:
 *   Public entry point for renderer toggle. Called by HUD click handler.
 *
 * USAGE:
 *   import { setToggleRenderMode } from '@engine/set/render/setToggleRenderMode.js';
 *   setToggleRenderMode();
 */

"use strict";

import { isGpuMode as getIsGpuMode } from '@engine/set/render/setIsGpuMode.js';
import { setSwitchToCpuMode } from '@engine/set/render/setSwitchToCpuMode.js';
import { setSwitchToGpuMode } from '@engine/set/render/setSwitchToGpuMode.js';

export function setToggleRenderMode() {
  return getIsGpuMode() ? setSwitchToCpuMode() : setSwitchToGpuMode();
}
