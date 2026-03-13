/**
 * setGpuCanvasHidden.js - GPU Canvas Visibility Control (No-Op)
 * 
 * PURPOSE:
 *   This is a no-op placeholder for GPU canvas visibility control. In the current
 *   architecture, the GPU canvas (foreground canvas) is kept visible at all times
 *   to prevent confusion during diagnostics and debugging.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderCpuPath and renderGpuPath for API consistency with
 *   setCpuCanvasHidden. However, unlike the CPU canvas, the GPU canvas
 *   (foreground canvas) is intentionally kept visible.
 * 
 * WHY NO-OP:
 *   The foreground canvas serves as the primary drawing surface for both GPU
 *   and CPU rendering paths. Hiding it would:
 *   - Make debugging harder (can't see what's on the canvas)
 *   - Cause confusion about which canvas is active
 *   - Potentially break the CPU path which draws to the foreground canvas
 * 
 *   Instead of hiding, we rely on proper clearing and compositing to prevent
 *   visual artifacts from stale content.
 */

/**
 * setGpuCanvasHidden - Placeholder for GPU canvas visibility control
 * 
 * @param {boolean} hidden - Whether to hide the canvas (ignored in current implementation)
 * 
 * This function is intentionally a no-op. The parameter is accepted for API
 * consistency but not used. The foreground canvas remains visible at all times.
 */
export function setGpuCanvasHidden(hidden) {
  // Intentionally a no-op: keep foreground canvas visible at all times
  // This prevents the CPU path from hiding it and confusing diagnostics
  
  // Suppress unused variable warning - parameter is required for API consistency
  /* eslint-disable no-unused-vars */
  const _ = hidden;
  /* eslint-enable no-unused-vars */
}
