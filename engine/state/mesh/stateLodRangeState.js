/**
 * lodRangeState.js - LOD Range State
 *
 * PURPOSE:
 *   Stores the Level of Detail (LOD) range bounds used to control
 *   mesh tessellation detail. The range has min and max values that
 *   determine which LOD level is selected based on camera distance.
 *
 * ARCHITECTURE ROLE:
 *   Single source of truth for LOD range. Written by setLodRange;
 *   read by getLodRange and the mesh tessellation pipeline.
 *
 * WHY THIS EXISTS:
 *   Signals the intended use of this state module and provides a shared
 *   design intent doc for LOD behavior.
 */

"use strict";

/**
 * lodRangeState - LOD range configuration for mesh detail control.
 * @property {{ min: number, max: number }} value - The LOD range with min and max bounds.
 */
export const lodRangeState = {
  value: {
    min: 3,
    max: 0,
  },
};
