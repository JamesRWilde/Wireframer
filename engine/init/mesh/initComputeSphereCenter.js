/**
 * computeSphereCenter.js - Center for bounding sphere
 *
 * PURPOSE:
 *   Computes the geometric center of the bounding box.
 *
 * ARCHITECTURE ROLE:
 *   Used by mesh initialization to position the model around the origin.
 *
 * WHY THIS EXISTS:
 *   Provides a clear shared utility for centering objects and avoids
 *   duplicated min/max center calculation logic.
 */

"use strict";

export function computeSphereCenter(bboxMin, bboxMax) {
  return [
    (bboxMin[0] + bboxMax[0]) * 0.5,
    (bboxMin[1] + bboxMax[1]) * 0.5,
    (bboxMin[2] + bboxMax[2]) * 0.5,
  ];
}
