/**
 * drawParticles.js - Particle Rendering Module
 * 
 * PURPOSE:
 *   Renders individual particles to the canvas with proper alpha blending,
 *   glow effects, and debug visualization support.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawBackground each frame to render the particle array.
 *   Handles color parsing (hex/rgba), alpha calculation, and glow effects.
 * 
 * RENDERING TECHNIQUE:
 *   - Each particle is drawn as a circle with shadow blur for glow
 *   - Alpha is computed from particle base alpha, opacity scale, and theme boost
 *   - Debug mode shows red squares instead of circles for visibility
 */

/**
 * drawParticles - Renders all particles to the canvas context
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D canvas rendering context
 * @param {Array<Object>} particles - Array of particle objects with x, y, size, alpha properties
 * @param {string} color - Base color string (hex #RRGGBB or rgba format)
 * @param {number} opacityScale - Global opacity multiplier from UI slider
 * @param {number} themeAlphaBoost - Theme-specific alpha boost (higher in light mode)
 * 
 * @returns {void}
 * 
 * The function:
 * 1. Iterates through each particle
 * 2. In debug mode, draws red squares for visibility
 * 3. Parses color string to rgba with computed alpha
 * 4. Draws circle with glow effect using shadow blur
 */
export function setRenderDrawParticles(ctx, particles, color, opacityScale, themeAlphaBoost) {
  // Store base color for reuse across particles
  const baseColor = color;

  // Render each particle individually
  for (const p of particles) {
    ctx.beginPath();

    // Debug mode: draw red squares instead of circles for visibility
    if (globalThis.DEBUG_PARTICLES) {
      ctx.fillStyle = 'rgba(255,0,0,0.8)';
      ctx.globalAlpha = 1;
      ctx.fillRect(p.x, p.y, 6, 6);
      continue;
    }

    // Calculate final alpha: particle alpha * opacity scale * theme boost
    // Clamp to [0, 1] range to prevent invalid alpha values
    const alpha = Math.max(0, Math.min(1, p.alpha * opacityScale * themeAlphaBoost));
    
    // Parse base color to rgba format, preserving existing rgba or converting hex
    let fillColor = typeof baseColor === 'string' ? baseColor.replace(/rgba?\(/, 'rgba(') : baseColor;

    // Convert hex color (#RRGGBB) to rgba with computed alpha
    if (typeof baseColor === 'string' && baseColor.startsWith('#')) {
      const r = Number.parseInt(baseColor.slice(1, 3), 16);
      const g = Number.parseInt(baseColor.slice(3, 5), 16);
      const b = Number.parseInt(baseColor.slice(5, 7), 16);
      fillColor = `rgba(${r},${g},${b},${alpha})`;
    }

    // Apply fill color and alpha to context
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = alpha;

    // Calculate particle radius (size is diameter, so radius is half)
    const radius = p.size * 0.5;
    
    // Draw circle with glow effect using shadow blur
    // Shadow color matches fill color for consistent glow appearance
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = radius * 2;
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow blur to avoid affecting subsequent draws
    ctx.shadowBlur = 0;
  }
}
