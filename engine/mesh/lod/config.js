/**
 * config.js - LOD Configuration Constants
 * 
 * PURPOSE:
 *   Defines configuration constants for the LOD (Level of Detail) system.
 *   These values control the minimum and maximum detail levels available
 *   in the application.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by LOD algorithms and UI code that needs to know the LOD
 *   configuration. Provides a single source of truth for LOD constants.
 * 
 * WHY CONSTANTS:
 *   LOD behavior should be consistent across the application. Centralizing
 *   these values makes it easy to adjust LOD behavior globally.
 */

"use strict";

/**
 * GLOBAL_MIN_LOD_PERCENT - Global minimum LOD percentage
 * 
 * This defines the lowest detail level that the LOD system will allow.
 * Models will not be decimated below this percentage of their original
 * vertex count, ensuring a minimum level of visual fidelity.
 * 
 * Value: 5 (5% of original vertices)
 * Range: 1-100
 */
export const GLOBAL_MIN_LOD_PERCENT = 5;
