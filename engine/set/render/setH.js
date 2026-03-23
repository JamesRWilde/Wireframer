'use strict';

/**
 * setH - Set H
 *
 * PURPOSE:
 *   Sets viewport height in css pixels.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/render/setH.js
 */

import { viewportState } from '@engine/state/render/stateViewportState.js';


/**
 * Sets viewport height in css pixels.
 * @param {*} v - The value to set.
 */
export function setH(v) {
  viewportState.H = v;
}
