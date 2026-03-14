/**
 * background-worker.js - Background Particle Computation Worker
 *
 * PURPOSE:
 *   Computes and animates particle positions in a separate thread (Web Worker).
 *   Offloads expensive particle simulation from the main thread for smooth UI.
 *
 * ARCHITECTURE ROLE:
 *   Receives commands from the main thread to initialize, update, or resize the particle system.
 *   Uses modular helpers for particle initialization, animation, and packing.
 *   Sends packed Float32Array buffers of particle data back to the main thread for rendering.
 *
 * DATA FORMAT:
 *   - Particle data is packed into a Float32Array containing [x, y, size, alpha] repeating.
 *
 * MESSAGE PROTOCOL:
 *   Main → Worker:
 *     { type: 'init', width, height, density, speed } - Initialize system
 *     { type: 'update', timestamp } - Animate and send particle positions
 *     { type: 'resize', width, height } - Handle canvas resize
 *   Worker → Main:
 *     { type: 'ready' } - Worker initialized
 *     { type: 'particles', data: Float32Array } - Particle positions [x,y,size,alpha,...]
 *     { type: 'error', message, stack } - Error notification
 */

"use strict";

// Particle state array (populated by initParticles)
let particles = [];

// Simulation state (updated by messages from main thread)
let state = {
  density: 50,   // Particle density (0-1, user controlled)
  speed: 1,      // Particle speed (0-1, user controlled)
  width: 1920,   // Canvas width
  height: 1080   // Canvas height
};
import { initParticles } from './background/initParticles.js';
import { updateParticles } from './background/updateParticles.js';
import { packParticles } from './background/packParticles.js';


// Worker message handler
// Web Worker message handler: responds to main thread commands
onmessage = (event) => {
  const { type, width, height, density, speed, timestamp, themeMode } = event.data;

  try {
    switch (type) {
      case 'init':
        // Initialize simulation state and particles
        state.width = width;
        state.height = height;
        state.density = density || 1;
        state.speed = speed || 1;
        state.themeMode = themeMode || 'dark';
        initParticles(state, particles);
        postMessage({ type: 'ready' });
        break;

      case 'update': {
        // Update density if changed (re-seed particles)
        if (density && density !== state.density) {
          state.density = density;
          initParticles(state, particles);
        }
        // Update velocity scale if changed
        if (speed !== undefined) {
          state.speed = speed;
        }
        // Update theme mode if changed
        if (themeMode) {
          state.themeMode = themeMode;
        }

        // Compute velocity and opacity scales
        const velScale = state.speed * 1; // MAX_VELOCITY_MULT = 1
        const opacityScale = event.data.opacity || 1;

        // Animate particles and send packed data to main thread
        updateParticles(particles, state, timestamp || 0, velScale, opacityScale);
        const data = packParticles(particles);
        postMessage({ type: 'particles', data, count: particles.length }, [data.buffer]);
        break;
      }

      case 'resize': {
        // Handle canvas resize and reinitialize particles
        state.width = width;
        state.height = height;
        initParticles(state, particles);
        break;
      }
    }
  } catch (error) {
    // Send error details to main thread for debugging
    postMessage({ type: 'error', message: error.message, stack: error.stack });
  }
};
