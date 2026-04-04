/**
 * stateBakeState.js - State Holder for the Baker's Pristine Shelf Model
 *
 * PURPOSE:
 *   Holds the pristine model produced by initBakeMesh after it has baked
 *   raw OBJ data once. This shelf model serves as the single source of
 *   truth for all downstream operations — cloning, decimation, morphing,
 *   and any operation that needs a fresh start.
 *
 * ARCHITECTURE ROLE:
 *   Written once by initLoad.js (the baker). Read directly by setDecimateToCap
 *   and any code that needs to grab a fresh clone of the original baked model.
 *   The shelf is accessed directly via `bakeState._bakedShelfModel` — no getter
 *   wrapper is needed for a single state variable.
 *
 * WHY THIS EXISTS:
 *   Without a persisted shelf, operations like increasing the detail slider
 *   after decimation would have to re-parse the OBJ or derive geometry
 *   backwards from a degraded copy. The baker bakes once and puts the cake
 *   on this shelf. Everyone else works from the cake. Nobody re-bakes.
 */

"use strict";

/**
 * bakeState - Container for the baker's shelf model
 *
 * _bakedShelfModel {Object|null}
 *   The pristine model baked from raw OBJ data at load time.
 *   Set once by initLoad.js, never modified after that.
 *   Any operation that needs a fresh copy clones from here.
 *   Nobody re-parses the OBJ — the shelf is always the source of truth.
 */
export const bakeState = {
  _bakedShelfModel: null,
};
