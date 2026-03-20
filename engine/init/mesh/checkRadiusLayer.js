/**
 * checkRadiusLayer.js - check one radius shell in the grid for a closer point
 *
 * Architecture:
 *   One function per file.
 */

"use strict";

import { processLayer } from '@engine/init/mesh/processLayer.js';

export function checkRadiusLayer(radius, cellContext) {
  let foundBetter = false;

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (processLayer(dx, dy, radius, cellContext)) foundBetter = true;
    }
  }

  return foundBetter;
}
