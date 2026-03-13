/**
 * background-worker.js - Background Particle Computation Worker
 * 
 * PURPOSE:
 *   Computes particle positions in a separate thread.
 *   Main thread receives positions and draws them.
 * 
 * MESSAGE PROTOCOL:
 *   Main → Worker:
 *     { type: 'init', width, height, density, speed } - Initialize
 *     { type: 'update', timestamp } - Update particle positions
 *     { type: 'resize', width, height } - Handle resize
 * 
 *   Worker → Main:
 *     { type: 'ready' } - Worker initialized
 *     { type: 'particles', data: Float32Array } - Particle positions [x,y,size,alpha,...]
 */

"use strict";

let particles = [];
let state = {
  density: 50,
  speed: 1,
  width: 1920,
  height: 1080
};

/**
 * initParticles - Initializes particle array
 */
function initParticles() {
  particles = [];
  // Base count: 1 particle per 45000 pixels, min 8
  const baseCount = Math.max(8, Math.round((state.width * state.height) / 45000));
  // Apply density multiplier (density is 0-1 percentage, MAX_DENSITY_MULT = 1.6)
  const densityMult = state.density * 1.6;
  const count = Math.max(0, Math.round(baseCount * densityMult));
  
  for (let i = 0; i < count; i++) {
    // Random angle and speed (velocity is 0-1 percentage, MAX_VELOCITY_MULT = 1)
    const angle = Math.random() * Math.PI * 2;
    const spd = (0.2 + Math.random() * 0.8) * state.speed;
    
    particles.push({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      size: 0.5 + Math.random() * 1.6,
      alphaBase: 0.2 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.8
    });
  }
}

/**
 * updateParticles - Updates particle positions and alpha
 * 
 * @param {number} now - Current timestamp
 * @param {number} velScale - Velocity scale factor
 * @param {number} opacityScale - Opacity scale factor
 */
function updateParticles(now, velScale, opacityScale) {
  const themeAlphaBoost = state.themeMode === 'light' ? 1.75 : 1;
  
  for (const p of particles) {
    // Update position based on velocity and scale
    p.x += p.vx * velScale;
    p.y += p.vy * velScale;

    // Wrap at edges with 4px buffer
    if (p.x < -4) p.x = state.width + 4;
    else if (p.x > state.width + 4) p.x = -4;
    if (p.y < -4) p.y = state.height + 4;
    else if (p.y > state.height + 4) p.y = -4;

    // Compute pulsing alpha
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 * p.speed + p.phase);
    p.alpha = (p.alphaBase + pulse * 0.14) * opacityScale * themeAlphaBoost;
  }
}

/**
 * packParticles - Packs particle data into transferable array
 * 
 * @returns {Float32Array} Packed particle data [x, y, size, alpha, ...]
 */
function packParticles() {
  const data = new Float32Array(particles.length * 4);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const idx = i * 4;
    data[idx] = p.x;
    data[idx + 1] = p.y;
    data[idx + 2] = p.size;
    data[idx + 3] = p.alpha || p.alphaBase || 0.5;
  }
  return data;
}

// Worker message handler
onmessage = (event) => {
  const { type, width, height, density, speed, timestamp, themeMode } = event.data;
  
  try {
    switch (type) {
      case 'init':
        state.width = width;
        state.height = height;
        state.density = density || 1;
        state.speed = speed || 1;
        state.themeMode = themeMode || 'dark';
        initParticles();
        postMessage({ type: 'ready' });
        break;
        
      case 'update': {
        // Update density if changed (re-seed particles)
        if (density && density !== state.density) {
          state.density = density;
          initParticles();
        }
        // Update velocity scale if changed
        if (speed !== undefined) {
          state.speed = speed;
        }
        if (themeMode) {
          state.themeMode = themeMode;
        }
        
        // Compute velocity and opacity scales (matching original code)
        const velScale = state.speed * 1; // MAX_VELOCITY_MULT = 1
        const opacityScale = event.data.opacity || 1;
        
        updateParticles(timestamp || 0, velScale, opacityScale);
        const data = packParticles();
        postMessage({ type: 'particles', data, count: particles.length }, [data.buffer]);
        break;
      }
        
      case 'resize': {
        state.width = width;
        state.height = height;
        initParticles();
        break;
      }
    }
  } catch (error) {
    postMessage({ type: 'error', message: error.message, stack: error.stack });
  }
};
