/**
 * customRgbState.js - Custom RGB application state
 *
 * PURPOSE:
 *   Centralizes custom RGB state for theme/palette/particle rendering.
 *   This module ONLY contains the mutable state variable.
 *   Getters and setters are in ui/get/customRgbState.js and ui/set/customRgbState.js.
 *
 * WHY THIS EXISTS:
 *   Keeps a single sprint of color state so simple UI state changes don't
 *   accidentally diverge across disconnected modules.
 */

"use strict";

/** @type {number[]} Custom user RGB color (0-255 each). */
export const customRgbState = [95, 188, 230];
