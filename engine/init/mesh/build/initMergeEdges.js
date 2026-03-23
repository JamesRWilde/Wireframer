/**
 * mergeEdges.js - Merge and dedupe edge sets (OBJ + face-derived)
 *
 * PURPOSE:
 *   Merge explicit OBJ edges and face-derived edges into one unique list
 *   while preserving author-provided edges first and deduplicating.
 *
 * ARCHITECTURE ROLE:
 *   Used by OBJ mesh loader to combine explicit and inferred edges in a
 *   deterministic manner.
 *
 * WHY THIS EXISTS:
 *   Ensures edge merging is centralized for consistent behavior and to
 *   avoid duplication in different parsers/loaders.
 */

"use strict";

export function mergeEdges(objEdges, faceEdges) {
  const seen = new Set();
  const result = [];

  // Add OBJ edges first (author-defined priority)
  for (const e of objEdges) {
    const lo = Math.min(e[0], e[1]);
    const hi = Math.max(e[0], e[1]);
    const key = `${lo},${hi}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push([lo, hi]);
    }
  }

  // Add face-derived edges not already present
  for (const e of faceEdges) {
    const lo = Math.min(e[0], e[1]);
    const hi = Math.max(e[0], e[1]);
    const key = `${lo},${hi}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push([lo, hi]);
    }
  }

  return result;
}
