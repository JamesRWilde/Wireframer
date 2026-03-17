/**
 * projectVerticesVertices.js - Single Point Projection
 * 
 * PURPOSE:
 *   Projects a single 3D point to 2D screen coordinates.
 *   Uses perspective projectVerticesVerticesion with configurable zoom and vertical offset.
 * 
 * ARCHITECTURE ROLE:
 *   Used for projectVerticesVerticesing individual points (e.g., debug markers, UI elements).
 *   For bulk vertex projectVerticesVerticesion, use getModelFrameData instead.
 * 
 * PROJECTION FORMULA:
 *   screenX = centerX + (worldX * fov) / (worldZ + 3)
 *   screenY = centerY - ((worldY - modelCy) * fov) / (worldZ + 3)
 *   The +3 offset prevents division by zero and provides reasonable depth scaling.
 */

/**
 * projectVerticesVertices - Projects a 3D point to 2D screen coordinates
 * 
 * @param {Array<number>} p - 3D point [x, y, z] in world space
 * 
 * @returns {Array<number>} 2D screen coordinates [x, y]
 * 
 * The function:
 * 1. Calculates field of view from viewport size and zoom
 * 2. Applies perspective division with depth offset
 * 3. Centers result in viewport with model vertical offset
 */
export function projectVerticesVertices(p) {
  // Calculate field of view: smaller viewport dimension * 0.9 * zoom
  const fov = Math.min(window.innerWidth, window.innerHeight) * 0.9 * globalThis.ZOOM;
  
  // Depth with offset to prevent division by zero
  const d = p[2] + 3;
  
  // Project to screen coordinates
  return [
    // X: center + (worldX * fov) / depth
    window.innerWidth * 0.5 + p[0] * fov / d,
    // Y: center - ((worldY - modelCy) * fov) / depth (inverted for screen space)
    window.innerHeight * 0.5 - (p[1] - globalThis.MODEL_CY) * fov / d,
  ];
}