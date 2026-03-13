/**
 * getMorphNowVertices.js - Current Morph Vertex Positions
 * 
 * PURPOSE:
 *   Computes the current interpolated vertex positions during a morph animation.
 *   This function reads the morph state and calculates where each vertex should
 *   be at the current time, using cubic easing for smooth motion.
 * 
 * ARCHITECTURE ROLE:
 *   Used by rendering code to get the current morph geometry. Reads from the
 *   legacy window.morph API which stores sampled point sets for morphing.
 * 
 * HOW IT WORKS:
 *   1. Check if morph is active
 *   2. Calculate raw progress (0-1) from elapsed time
 *   3. Apply cubic easing for smooth animation
 *   4. Interpolate each sampled point between source and target
 */

// Import cubic easing function for smooth animation
import { easeInOutCubic } from './easeInOutCubic.js';

/**
 * getMorphNowVertices - Gets current interpolated vertex positions
 * 
 * @param {number} nowMs - Current timestamp in milliseconds
 * 
 * @returns {Array<Array<number>>} Array of interpolated vertex positions
 *   Returns empty array if no morph is active
 * 
 * Each vertex is interpolated as: a + (b - a) * t
 * where t is the eased progress value.
 */
export function getMorphNowVertices(nowMs) {
  // Return empty array if no morph is active
  if (!window.morph || !window.morph.active) return [];
  
  // Calculate raw progress (0-1) from elapsed time
  const tRaw = Math.max(0, Math.min(1, (nowMs - window.morph.startTime) / window.morph.duration));
  
  // Apply cubic easing for smooth animation
  const t = easeInOutCubic(tRaw);
  
  // Create array for interpolated vertices
  const V = new Array(window.morph.sampleCount);
  
  // Interpolate each sampled point
  for (let i = 0; i < window.morph.sampleCount; i++) {
    const a = window.morph.fromPts[i];
    const b = window.morph.toPts[i];
    // Linear interpolation: a + (b - a) * t
    V[i] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  
  return V;
}
