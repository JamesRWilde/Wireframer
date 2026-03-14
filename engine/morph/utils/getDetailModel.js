/**
 * getDetailModel.js - Current LOD Model Accessor
 * 
 * PURPOSE:
 *   Returns the current LOD (Level of Detail) model for rendering. This
 *   provides a fallback chain: use the current LOD model if available,
 *   otherwise fall back to the base (full detail) model.
 * 
 * ARCHITECTURE ROLE:
 *   Used by morph utilities to get the current model for morph source
 *   or comparison. Provides a safe accessor with fallback logic.
 * 
 * WHY SEPARATE:
 *   The LOD model may or may not be set depending on whether the user
 *   has adjusted the detail slider. This function provides a clean
 *   fallback without requiring callers to check multiple globals.
 */

"use strict";

/**
 * getDetailModel - Gets the current LOD model with fallback
 * 
 * @returns {Object|null} The current LOD model, or base model, or null
 * 
 * Priority:
 * 1. CURRENT_LOD_MODEL (if LOD slider has been used)
 * 2. BASE_MODEL (full detail model)
 * 3. null (if no model is loaded)
 */
export function getDetailModel() {
  return globalThis.CURRENT_LOD_MODEL || globalThis.BASE_MODEL;
}
