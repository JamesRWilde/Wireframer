/**
 * seedParticles.js - Particle Initialization Module
 * 
 * PURPOSE:
 *   Creates and manages the particle array for the background animation.
 *   Handles lazy initialization, density changes, and window resizing.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawBackground to ensure particles exist before rendering.
 *   Returns scale factors needed for particle updates and rendering.
 * 
 * PARTICLE LIFECYCLE:
 *   - Particles are created on first frame or when density/size changes
 *   - Each particle has random position, velocity, size, and alpha
 *   - Particles persist across frames (array is reused)
 */

/** Maximum density multiplier - controls particle crowding */
const MAX_DENSITY_MULT = 1.6;

/** Maximum velocity multiplier - controls particle speed */
const MAX_VELOCITY_MULT = 1;

/** Last canvas dimensions - used to detect resize */
let lastSize = { w: 0, h: 0 };

/** Last density setting - used to detect density changes */
let lastDensity = 1;

/**
 * createParticle - Creates a single particle with random properties
 * 
 * @param {number} w - Canvas width for random position generation
 * @param {number} h - Canvas height for random position generation
 * @param {number} [velocityScale=1] - Multiplier for particle velocity
 * 
 * @returns {Object} Particle object with position, velocity, size, and alpha properties
 * 
 * Particle properties:
 * - x, y: Random position within canvas bounds
 * - vx, vy: Velocity components based on random angle and speed
 * - size: Random diameter between 0.5 and 2.1 pixels
 * - alphaBase: Base opacity between 0.2 and 1.0
 * - phase: Random phase offset for pulsing animation
 * - speed: Movement speed factor for animation timing
 * - alpha: Current computed alpha (updated each frame)
 */
function createParticle(w, h, velocityScale = 1) {
  // Random speed between 0.2 and 1.0
  const speed = 0.2 + Math.random() * 0.8;
  
  // Random direction angle (full 360 degrees)
  const angle = (Math.random() - 0.5) * Math.PI * 2;
  
  // Convert angle to velocity components, scaled by speed and velocity scale
  const vx = Math.cos(angle) * speed * velocityScale;
  const vy = Math.sin(angle) * speed * velocityScale;
  
  return {
    // Random position within canvas bounds
    x: Math.random() * w,
    y: Math.random() * h,
    // Velocity components for movement
    vx,
    vy,
    // Random size (diameter) between 0.5 and 2.1 pixels
    size: 0.5 + Math.random() * 1.6,
    // Base opacity between 0.2 and 1.0
    alphaBase: 0.2 + Math.random() * 0.8,
    // Random phase for pulsing animation offset
    phase: Math.random() * Math.PI * 2,
    // Speed factor for animation timing
    speed,
    // Current alpha (computed each frame, initialized to 0)
    alpha: 0,
  };
}

/**
 * seedParticlesIfNeeded - Creates or recreates particles if needed
 * 
 * @param {Array<Object>} particles - Particle array to populate (modified in place)
 * @param {number} w - Current canvas width
 * @param {number} h - Current canvas height
 * 
 * @returns {{ velScale: number, opacityScale: number, themeAlphaBoost: number }}
 *   Scale factors for particle updates and rendering
 * 
 * The function:
 * 1. Calculates target particle count based on canvas area and density setting
 * 2. Checks if reseeding is needed (density change, resize, or empty array)
 * 3. Creates new particles with random properties if needed
 * 4. Returns scale factors for velocity, opacity, and theme alpha boost
 */
export function seedParticlesIfNeeded(particles, w, h) {
  // Calculate base particle count from canvas area (1 particle per 45000 pixels)
  const baseCount = Math.max(8, Math.round((w * h) / 45000));
  
  // Get density percentage from UI slider (default 100%)
  const densityPct = globalThis.BG_PARTICLE_DENSITY_PCT ?? 1;
  const density = densityPct * MAX_DENSITY_MULT;
  
  // Get velocity percentage from UI slider (default 100%)
  const velocityPct = globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1;
  const velocityScale = velocityPct * MAX_VELOCITY_MULT;

  // Determine if reseeding is needed
  const mustReseed = density !== lastDensity;
  const sizeChanged = lastSize.w !== w || lastSize.h !== h;
  
  // Reseed if density changed, canvas resized, or no particles exist
  if (mustReseed || !particles.length || sizeChanged) {
    // Clear existing particles
    particles.length = 0;
    
    // Calculate target count with density multiplier
    const count = Math.max(0, Math.round(baseCount * density));
    
    // Create new particles
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(w, h, velocityScale));
    }
    
    // Update tracking state
    lastSize = { w, h };
    lastDensity = density;
  }

  // Calculate scale factors for particle updates
  const velScale = velocityPct * MAX_VELOCITY_MULT;
  const opacityScale = (globalThis.BG_PARTICLE_OPACITY_PCT ?? 1) * 1;
  
  // Light mode needs higher alpha boost for visibility against light background
  const themeAlphaBoost = globalThis.THEME_MODE === 'light' ? 1.75 : 1;

  return { velScale, opacityScale, themeAlphaBoost };
}
