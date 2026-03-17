/**
 * InitMeshEngineMorphApi.js - Morph API Initialization
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
 * MORPH API FUNCTIONS:
 *   - InitMeshEngineStartMorph: Begins a morph animation between two models
 *   - InitMeshEngineAdvanceMorphFrame: Updates morph state each frame
 *   - GetMeshEngineCurrentMorph: Gets the current interpolated mesh
 *   - GetMeshEngineIsMorphing: Checks if a morph is in progress
 *   - DisposeMeshEngineStopMorph: Stops the current morph animation
 */

"use strict";

// Import morph API functions
import { startMorph }from '@engine/init/mesh/startMorph.js';
import { advanceMorphFrame }from '@engine/init/mesh/advanceMorphFrame.js';
import { currentMorph }from '@engine/get/mesh/currentMorph.js';
import { isMorphing }from '@engine/get/mesh/isMorphing.js';
import { stopMorph }from '@engine/dispose/mesh/stopMorph.js';

// Set default morph duration (1.6 seconds)
// This provides a smooth transition that's not too fast or too slow
globalThis.MORPH_DURATION_MS = 1600;

// Expose morph API globally so InitMeshEngineFinalizeModel and renderScene can use it
// This avoids circular imports while providing a clean API
globalThis.morph = {
  InitMeshEngineStartMorph,
  InitMeshEngineAdvanceMorphFrame,
  GetMeshEngineCurrentMorph,
  GetMeshEngineIsMorphing,
  DisposeMeshEngineStopMorph,
};
