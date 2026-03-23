/**
 * computeSphereCenter.js - Center for bounding sphere
 *
 * One function per file module.
 */

"use strict";

export function computeSphereCenter(bboxMin, bboxMax) {
  return [
    (bboxMin[0] + bboxMax[0]) * 0.5,
    (bboxMin[1] + bboxMax[1]) * 0.5,
    (bboxMin[2] + bboxMax[2]) * 0.5,
  ];
}
