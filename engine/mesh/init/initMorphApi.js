/**
 * initMorphApi.js - Morph API Initialization
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
 *   - startMorph: Begins a morph animation between two models
 *   - advanceMorphFrame: Updates morph state each frame
 *   - getCurrentMorphMesh: Gets the current interpolated mesh
 *   - isMorphing: Checks if a morph is in progress
 *   - stopMorph: Stops the current morph animation
 */

"use strict";

// Import morph API functions
import { startMorph } from './startMorph.js';
import { advanceMorphFrame } from './advanceMorphFrame.js';
import { getCurrentMorphMesh } from '../get/getCurrentMorphMesh.js';
import { isMorphing } from '../get/isMorphing.js';
import { stopMorph } from '../dispose/stopMorph.js';

// Set default morph duration (1.6 seconds)
// This provides a smooth transition that's not too fast or too slow
globalThis.MORPH_DURATION_MS = 1600;

// Expose morph API globally so finalizeModel and renderScene can use it
// This avoids circular imports while providing a clean API
globalThis.morph = {
  startMorph,
  advanceMorphFrame,
  getCurrentMorphMesh,
  isMorphing,
  stopMorph,
};
