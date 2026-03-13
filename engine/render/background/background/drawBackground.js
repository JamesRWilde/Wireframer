/**
 * drawBackground.js - Background Particle Rendering Entry Point
 * 
 * PURPOSE:
 *   Orchestrates the complete background rendering pipeline each frame.
 *   This includes seeding particles if needed, updating their positions,
 *   drawing the background color, and rendering particles with appropriate
 *   blending modes.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderScene each frame to draw the animated particle background.
 *   Returns true to indicate background was drawn on a separate canvas.
 * 
 * RENDERING PIPELINE:
 *   1. Get canvas and context
 *   2. Get theme colors (background and particle)
 *   3. Seed particles if needed (first frame or resize)
 *   4. Update particle positions and properties
 *   5. Draw background base color
 *   6. Draw particles with appropriate blend mode
 */

// Import canvas accessor
import { getBackgroundCanvas } from './getBackgroundCanvas.js';

// Import theme color accessor
import { getBackgroundColors } from './getBackgroundColors.js';

// Import particle seeding (lazy initialization)
import { seedParticlesIfNeeded } from './seedParticles.js';

// Import particle position update
import { updateParticles } from './updateParticles.js';

// Import particle rendering
import { drawParticles } from './drawParticles.js';

// Particle array (persists across frames)
let particles = [];

/**
 * drawBackground - Renders the animated particle background
 * 
 * @param {number} nowMs - Current timestamp from requestAnimationFrame
 * 
 * @returns {boolean} True if background was drawn successfully
 * 
 * The function:
 * 1. Gets canvas and validates it exists
 * 2. Seeds particles on first call or after resize
 * 3. Updates particle positions based on time
 * 4. Draws background color and particles
 */
export function drawBackground(nowMs) {
  // Get canvas state (context, width, height)
  const canvasState = getBackgroundCanvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  // Get theme colors for background and particles
  const { bgColor, particleColor } = getBackgroundColors();

  // Seed particles if needed (first frame or after resize)
  const { velScale, opacityScale, themeAlphaBoost } = seedParticlesIfNeeded(particles, w, h);
  
  // Get current time for particle animation
  const now = nowMs ?? performance.now();

  // Update particle positions and properties
  updateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost);

  // Draw background base color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Draw particles with appropriate blend mode
  ctx.save();
  // Light mode: multiply (darkens), Dark mode: screen (brightens)
  ctx.globalCompositeOperation = globalThis.THEME_MODE === 'light' ? 'multiply' : 'screen';

  drawParticles(ctx, particles, particleColor, opacityScale, themeAlphaBoost);

  ctx.restore();

  // Debug log if no particles
  if (particles.length === 0) console.debug('[drawBackground] no particles to draw');
  
  return true;
}
