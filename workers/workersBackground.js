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
function initializeWorker(eventData) {
  const { width, height, density, speed, themeMode, mode } = eventData;
  state.width = width;
  state.height = height;
  state.density = (typeof density === 'number') ? density : 1;
  state.speed = (typeof speed === 'number') ? speed : 1;
  state.themeMode = themeMode || 'dark';
  state.mode = mode || state.mode || 'cpu';
  workersParticles(state, particles);
  postMessage({ type: 'ready' });
}

function updateWorker(eventData) {
  const { mode, density, speed, themeMode, timestamp, opacity } = eventData;

  if (mode && mode !== state.mode) {
    state.mode = mode;
    workersParticles(state, particles);
  }

  if (typeof density === 'number' && density !== state.density) {
    state.density = density;
    workersParticles(state, particles);
  }

  if (speed !== undefined) {
    state.speed = speed;
  }
  if (themeMode) {
    state.themeMode = themeMode;
  }

  const velScale = state.speed;
  const opacityScale = opacity || 1;
  const themeAlphaBoost = state.themeMode === 'light' ? 1.75 : 1;

  workersUpdateParticles(
    particles,
    state.width,
    state.height,
    timestamp || 0,
    velScale,
    opacityScale,
    { themeAlphaBoost, mode: state.mode }
  );

  const data = workersPackParticles(particles);
  postMessage({ type: 'particles', data, count: particles.length }, [data.buffer]);
}

function resizeWorker(eventData) {
  const { width, height } = eventData;
  state.width = width;
  state.height = height;
  workersParticles(state, particles);
}

onmessage = (event) => {
  const { type } = event.data;

  try {
    if (type === 'init') {
      initializeWorker(event.data);
      return;
    }

    if (type === 'update') {
      updateWorker(event.data);
      return;
    }

    if (type === 'resize') {
      resizeWorker(event.data);
    }
  } catch (error) {
    postMessage({ type: 'error', message: error.message, stack: error.stack });
  }
};
