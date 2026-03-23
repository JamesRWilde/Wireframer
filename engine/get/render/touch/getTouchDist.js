/**
 * getTouchDist.js - Touch Distance Calculation
 *
 * PURPOSE:
 *   Calculates the Euclidean distance in pixels between two touch points.
 *
 * ARCHITECTURE ROLE:
 *   Used in gesture recognition modules to assess pinch/zoom distance changes.
 *
 * WHY THIS EXISTS:
 *   Abstracts touch vector math into a reusable helper so touch handlers remain concise.
 */

"use strict";

/**
 * getTouchDist - Computes distance between two touch points.
 * @param {{clientX:number,clientY:number}} t1 - first touch point
 * @param {{clientX:number,clientY:number}} t2 - second touch point
 * @returns {number} Pixel distance between the two touch points.
 */
export function getTouchDist(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}
