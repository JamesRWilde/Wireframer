/**
 * setToggleRenderMode.js - Toggle Between GPU and CPU Rendering
 *
 * PURPOSE:
 *   Switches between GPU and CPU rendering pipelines when called.
 *   Disposes the current pipeline completely and initializes the other one.
 *
 * ARCHITECTURE ROLE:
 *   Public entry point for renderer toggle. Called by the HUD click handler
 *   when the user clicks the GPU/CPU toggle button.
 *
 * WHY THIS EXISTS:
 *   Provides a single function that the UI layer can call without needing
 *   to know which mode is currently active — it reads the flag internally
 *   and delegates to the appropriate switch function.
 */

"use strict";

// Import the GPU mode getter to determine current rendering state
import { getIsGpuMode } from '@engine/get/render/getIsGpuMode.js';
// Import the CPU mode switch — disposes GPU pipeline, initializes CPU
import { setSwitchToCpuMode } from '@engine/set/render/setSwitchToCpuMode.js';
// Import the GPU mode switch — disposes CPU pipeline, initializes GPU
import { setSwitchToGpuMode } from '@engine/set/render/setSwitchToGpuMode.js';

/**
 * setToggleRenderMode - Toggles between GPU and CPU rendering pipelines.
 * No parameters — reads current mode from state and switches to the other.
 */
export function setToggleRenderMode() {
  // Delegate to the appropriate switch function based on current mode
  return getIsGpuMode() ? setSwitchToCpuMode() : setSwitchToGpuMode();
}
