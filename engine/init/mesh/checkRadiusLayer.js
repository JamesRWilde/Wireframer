/**
 * checkRadiusLayer.js - check one radius shell in the grid for a closer point
 *
 * Architecture:
 *   One function per file.
 */

"use strict";

import { processLayer } from '@engine/init/mesh/processLayer.js';

/**
 * checkRadiusLayer - Search a one-cell-thick shell of the grid around center.
 *
 * It iterates through dx/dy offsets for the current radius and delegates
 * dz search to `processLayer`, returning true if any vertex improved distance.
 *
 * @param {number} radius - Current search radius in grid cells.
 * @param {object} cellContext - Shared context containing grid coordinates, verts, point and best distance index.
 * @returns {boolean} True when a closer vertex is found at this radius.
 */
export function checkRadiusLayer(radius, cellContext) {
  let foundBetter = false;

  // Outer spiral in X/Y plane at current radius
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      // processLayer checks the ring of dz for this dx/dy.
      if (processLayer(dx, dy, radius, cellContext)) foundBetter = true;
    }
  }

  return foundBetter;
}

