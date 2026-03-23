/**
 * modelState.js - Centralized Model State Management
 *
 * PURPOSE:
 *   Single source of truth for the active 3D mesh model and its derivatives
 *   (base model, CPU-safe model, current LOD model, LOD percentage).
 *
 * ARCHITECTURE ROLE:
 *   Imported by mesh loading, LOD switching, and rendering modules.
 *   setActiveModel() is the ONLY function that should change the active model,
 *   ensuring UI stats, telemetry, and render mode stay synchronized.
 *
 * WHY THIS EXISTS:
 *   Highlights the core role of model state in the app architecture and
 *   completes the header standardization requirement.
 *
 * WHY CENTRALIZED:
 *   MODEL, BASE_MODEL, CPU_BASE_MODEL, CURRENT_LOD_MODEL, and CURRENT_LOD_PCT
 *   are tightly coupled — they all change together when a new model loads or
 *   LOD level switches. Keeping them in one module prevents partial updates.
 */

"use strict";

import {statsState} from '@ui/state/stateStats.js';
import { state }from '@engine/state/stateLoop.js';

/**
 * modelState - Mutable model state object.
 * Properties:
 *   model        - The currently active mesh (what's being rendered)
 *   baseModel    - Full-detail model copy (never decimated)
 *   cpuBaseModel - CPU-capped version of the base model (may be pre-decimated)
 *   currentLodModel - Current LOD-decimated model
 *   currentLodPct   - Current LOD percentage (0-1, 1 = full detail)
 */
export const modelState = {
  model: null,
  baseModel: null,
  cpuBaseModel: null,
  currentLodModel: null,
  currentLodPct: 1,
  name: '',
};
