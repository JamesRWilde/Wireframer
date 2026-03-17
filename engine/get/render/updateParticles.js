/**
 * updateParticles.js - Particle Updater Re-export
 *
 * PURPOSE:
 *   Re-exports the workersUpdateParticles function for use by the
 *   background renderer. This module serves as an alias to maintain
 *   consistent import paths across the engine.
 *
 * ARCHITECTURE ROLE:
 *   Provides a clean import path for the particle update logic used
 *   by both the main-thread and worker-based background renderers.
 */

"use strict";

// Re-export from the workers module for consistent import paths
export { workersUpdateParticles } from '@workers/workersUpdateParticles.js';
