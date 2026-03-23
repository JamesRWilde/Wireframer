/**
 * morphApi.js - Morph API Initialization
 * 
 * PURPOSE:
 *   Initializes the morphing API and exposes it globally. The morphing system
 *   provides smooth transitions between different 3D models by interpolating
 *   vertex positions over time.
 * 
 * ARCHITECTURE ROLE:
 *   Imported early during engine bootstrap to make the morph API available
 *   before other modules need it. Exposes the API globally for flexible
 *   access without circular imports.
 *
 * WHY THIS EXISTS:
 *   Establishes consistent morph API state and defaults for all engine
 *   modules, avoiding ad-hoc global morph wiring.
 *
 * MORPH API FUNCTIONS:
 *   - startMorph: Begins a morph animation between two models
 *   - advanceMorphFrame: Updates morph state each frame
 *   - currentMorph: Gets the current interpolated mesh
 *   - getIsMorphing: Checks if a morph is in progress

 */

"use strict";

// Import morph API functions
import { startMorph }from '@engine/init/mesh/initStartMorph.js';
import { advanceMorphFrame }from '@engine/init/mesh/initAdvanceMorphFrame.js';
import { getCurrentMorph }from '@engine/get/mesh/getCurrentMorph.js';
import { getIsMorphing }from '@engine/get/mesh/getIsMorphing.js';

// Set default morph duration and API through state modules
import { setMorph } from '@engine/set/mesh/setMorph.js';
import { setMorphDuration } from '@engine/set/mesh/setMorphDuration.js';

setMorphDuration(1600);
setMorph({
  startMorph,
  advanceMorphFrame,
  currentMorph: getCurrentMorph,
  getIsMorphing,
});
