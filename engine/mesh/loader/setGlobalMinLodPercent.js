/**
 * setGlobalMinLodPercent.js - Global Minimum LOD Percentage
 * 
 * PURPOSE:
 *   Sets the global minimum LOD (Level of Detail) percentage. This defines
 *   the lowest detail level that the LOD system will allow, preventing
 *   models from being decimated beyond a certain point.
 * 
 * ARCHITECTURE ROLE:
 *   Called by configuration code or UI controls to set the minimum LOD
 *   threshold. This value is used by LOD algorithms to ensure models
 *   maintain a minimum level of detail.
 * 
 * WHY A GLOBAL MINIMUM:
 *   Some models can be decimated to near-zero vertices, which breaks
 *   rendering and looks terrible. A global minimum ensures all models
 *   maintain at least some visual fidelity.
 */

/**
 * setGlobalMinLodPercent - Sets the global minimum LOD percentage
 * 
 * @param {number} percent - Minimum LOD percentage (1-100)
 *   Values are clamped to the range [1, 100]
 *   Default is 5% if invalid value provided
 * 
 * The value is stored in globalThis.GLOBAL_MIN_LOD_PERCENT for access
 * by LOD algorithms throughout the application.
 */
export function setGlobalMinLodPercent(percent) {
  // Clamp to valid range and store globally
  // Minimum of 1% ensures at least some geometry is preserved
  // Maximum of 100% means no minimum restriction
  globalThis.GLOBAL_MIN_LOD_PERCENT = Math.max(1, Math.min(100, Number(percent) || 5));
}
