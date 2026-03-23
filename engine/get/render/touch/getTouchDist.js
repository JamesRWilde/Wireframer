/**
 * Euclidean distance between two touch points.
 */
export function getTouchDist(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}
