/**
 * workersBackground.js - Background Particle Web Worker
 *
 * PURPOSE:
 *   Runs as a dedicated Web Worker thread for background particle animation.
 *   Handles particle initialization, position updates, and packing particle
 *   data for transfer back to the main thread for rendering.
 *
 * ARCHITECTURE ROLE:
 *   Instantiated by backgroundWorker.js. Receives messages from the main
 *   thread (init, update, resize) and posts back particle data as
 *   transferable Float32Arrays for zero-copy rendering.
 *
 * MESSAGES RECEIVED:
 *   - init: Initialize particles with canvas dimensions and settings
 *   - update: Update particle positions and return packed data
 *   - resize: Reinitialize particles for new canvas dimensions
 *
 * MESSAGES SENT:
 *   - ready: Worker has completed initialization
 *   - particles: Packed particle data (Float32Array) ready for rendering
 *   - error: An error occurred during processing
 */

"use strict";

// Particle array managed by this worker
let particles = [];

// Worker-local state for canvas dimensions and settings
let state = {
  density: 50,
  speed: 1,
  width: 1920,
  height: 1080,
  themeMode: 'dark'
};

// Import particle management utilities using relative worker path
// (import.map may not be available in worker module context in some browsers)
import { workersParticles }from './workersParticles.js';
import { workersUpdateParticles }from './workersUpdateParticles.js';
import { workersPackParticles }from './workersPackParticles.js';

/**
 * Handles incoming messages from the main thread
 *
 * @param {MessageEvent} event - The message event
 */
onmessage = (event) => {
  const { type, width, height, density, speed, timestamp, themeMode, mode } = event.data;

  try {
    switch (type) {
      case 'init':
        // Initialize particle state and create particles
        state.width = width;
        state.height = height;
        state.density = (typeof density === 'number') ? density : 1;
        state.speed = (typeof speed === 'number') ? speed : 1;
        state.themeMode = themeMode || 'dark';
        state.mode = mode || state.mode || 'cpu';
        workersParticles(state, particles);
        postMessage({ type: 'ready' });
        break;

      case 'update': {
        // Update mode if changed
        if (mode && mode !== state.mode) {
          state.mode = mode;
        }

        // Reseed particles if density changed (allow 0 density)
        if (typeof density === 'number' && density !== state.density) {
          state.density = density;
          workersParticles(state, particles);
        }

        // Update speed and theme settings
        if (speed !== undefined) {
          state.speed = speed;
        }
        if (themeMode) {
          state.themeMode = themeMode;
        }

        // Compute scaling factors for this update
        const velScale = state.speed;
        const opacityScale = event.data.opacity || 1;
        // Light theme needs higher alpha boost for visibility
        const themeAlphaBoost = state.themeMode === 'light' ? 1.75 : 1;

        // Update particle positions and compute alpha values
        workersUpdateParticles(particles, state.width, state.height, timestamp || 0, velScale, opacityScale, themeAlphaBoost);

        // Pack particle data into a transferable Float32Array
        const data = workersPackParticles(particles);

        // Send packed data back to main thread with zero-copy transfer
        postMessage({ type: 'particles', data, count: particles.length }, [data.buffer]);
        break;
      }

      case 'resize': {
        // Reinitialize particles for new canvas dimensions
        state.width = width;
        state.height = height;
        workersParticles(state, particles);
        break;
      }
    }
  } catch (error) {
    // Report errors back to the main thread
    postMessage({ type: 'error', message: error.message, stack: error.stack });
  }
};
