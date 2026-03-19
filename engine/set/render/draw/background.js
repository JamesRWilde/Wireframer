/**
 * background.js - Background Renderer
 *
 * PURPOSE:
 *   Renders the animated particle background using either the Web Worker
 *   path (when available) or a main-thread fallback. Draws a solid
 *   background color and composites particles with appropriate blend modes
 *   for the active theme.
 *
 * ARCHITECTURE ROLE:
 *   Called each frame by the render loop to draw the background layer.
 *   Manages worker lifecycle, particle seeding, and theme-aware rendering
 *   (multiply blend for light theme, screen blend for dark theme).
 *
 * DETAILS:
 *   Falls back to main-thread particle updates if the background worker
 *   is not ready. Theme affects blend mode and particle opacity boost.
 */

"use strict";

// Import background canvas getter
import {canvas}from '@engine/get/render/background/canvas.js';

// Import theme-aware color getters
import {colors}from '@engine/get/render/background/colors.js';

// Import particle seeding for main-thread fallback
import { seedParticles }from '@engine/set/render/seedParticles.js';

// Import main-thread particle updater for fallback path
import { workersUpdateParticles }from '@workers/workersUpdateParticles.js';

// Import background worker initialization
import { backgroundWorker }from '@engine/init/render/backgroundWorker.js';

// Import worker readiness check
import { isBackgroundWorkerReady }from '@engine/get/render/isBackgroundWorkerReady.js';

// Import pending worker particles getter
import { pendingWorkerParticles }from '@engine/get/render/pendingWorkerParticles.js';

// Import message sender for background worker
import { postToBackgroundWorker }from '@engine/set/render/postToBackgroundWorker.js';

// Import centralized render state
import { getThemeMode } from '@engine/state/render/renderState.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

// Main-thread particle array (used as fallback when worker is unavailable)
let particles = [];

// Track whether the background worker has been initialized
let workerInitialized = false;

// Reusable bucket arrays to avoid per-frame allocations (16 buckets)
let particleBuckets = null;

// Color parsing cache (Map: colorString -> [r,g,b])
const colorCache = new Map();

/**
 * parseColorToRgb - Parses a color string to RGB components (0-255)
 * @param {string} color - Hex #RRGGBB or rgba() format
 * @returns {[number, number, number]} RGB values
 */
function parseColorToRgb(color) {
  let r = 0, g = 0, b = 0;
  if (color.startsWith('#')) {
    r = Number.parseInt(color.slice(1, 3), 16);
    g = Number.parseInt(color.slice(3, 5), 16);
    b = Number.parseInt(color.slice(5, 7), 16);
  } else {
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
    if (match) {
      r = Number(match[1]);
      g = Number(match[2]);
      b = Number(match[3]);
    }
  }
  return [r, g, b];
}

/**
 * getCachedColorRgb - Gets RGB for a color, using cache if available
 * @param {string} color - Color string to parse
 * @returns {[number, number, number]} Cached or computed RGB
 */
function getCachedColorRgb(color) {
  let rgb = colorCache.get(color);
  if (!rgb) {
    rgb = parseColorToRgb(color);
    colorCache.set(color, rgb);
  }
  return rgb;
}

/**
 * ensureBucketArrays - Ensures bucket arrays exist and are cleared
 * @returns {Array<Array<number>>} 16 empty arrays for bucketing
 */
function ensureBucketArrays() {
  if (!particleBuckets) {
    particleBuckets = new Array(16);
    for (let i = 0; i < 16; i++) {
      particleBuckets[i] = [];
    }
  }
  for (let i = 0; i < 16; i++) {
    particleBuckets[i].length = 0;
  }
  return particleBuckets;
}

/**
 * renderWorkerParticles - Renders particles from background worker (optimized)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Float32Array} data - Packed particle data [x, y, size, alpha, ...]
 * @param {number} count - Number of particles
 * @param {number} opacity - Global opacity multiplier
 * @param {string} particleColor - Particle color string
 * @param {string} themeMode - 'light' or 'dark'
 */
function renderWorkerParticles(ctx, data, count, opacity, particleColor, themeMode) {
  if (count === 0) return;

  const [baseR, baseG, baseB] = getCachedColorRgb(particleColor);
  const buckets = ensureBucketArrays();

  // Bucket particles by alpha (store as flat [x, y, size])
  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const x = data[idx];
    const y = data[idx + 1];
    const size = data[idx + 2];
    const alpha = Math.max(0, Math.min(1, data[idx + 3] * opacity));
    if (alpha <= 0) continue;
    const bucketIdx = Math.min(15, Math.floor(alpha * 16));
    const bucket = buckets[bucketIdx];
    bucket.push(x, y, size);
  }

  // Render each bucket with fillRect (faster than arc)
  for (let bucketIdx = 0; bucketIdx < 16; bucketIdx++) {
    const bucket = buckets[bucketIdx];
    const bucketLen = bucket.length;
    if (bucketLen === 0) continue;

    const alpha = (bucketIdx + 0.5) / 16;
    ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},${alpha})`;

    for (let j = 0; j < bucketLen; j += 3) {
      const x = bucket[j];
      const y = bucket[j + 1];
      const size = bucket[j + 2];
      const radius = size * 0.5;
      ctx.fillRect(x - radius, y - radius, size, size);
    }
  }
}

/**
 * renderMainThreadParticles - Renders particles on main thread (optimized)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<Object>} particles - Particle array with x, y, size, alpha
 * @param {number} opacityScale - Opacity multiplier
 * @param {number} themeAlphaBoost - Theme-specific alpha boost
 * @param {string} particleColor - Particle color string
 */
function renderMainThreadParticles(ctx, particles, opacityScale, themeAlphaBoost, particleColor) {
  if (particles.length === 0) return;

  const [baseR, baseG, baseB] = getCachedColorRgb(particleColor);
  const buckets = ensureBucketArrays();

  // Bucket particles
  for (const p of particles) {
    const alpha = Math.max(0, Math.min(1, p.alpha * opacityScale * themeAlphaBoost));
    if (alpha <= 0) continue;
    const bucketIdx = Math.min(15, Math.floor(alpha * 16));
    const bucket = buckets[bucketIdx];
    bucket.push(p.x, p.y, p.size);
  }

  // Render buckets
  for (let bucketIdx = 0; bucketIdx < 16; bucketIdx++) {
    const bucket = buckets[bucketIdx];
    const bucketLen = bucket.length;
    if (bucketLen === 0) continue;

    const alpha = (bucketIdx + 0.5) / 16;
    ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},${alpha})`;

    for (let j = 0; j < bucketLen; j += 3) {
      const x = bucket[j];
      const y = bucket[j + 1];
      const size = bucket[j + 2];
      const radius = size * 0.5;
      ctx.fillRect(x - radius, y - radius, size, size);
    }
  }
}

/**
 * background - Renders the animated particle background
 *
 * @param {number} [nowMs] - Current timestamp in milliseconds
 * @returns {boolean} Whether the background was rendered successfully
 */
export function background(nowMs) {
  // Get the background canvas and context
  const canvasState = canvas();
  if (!canvasState) return false;
  const { ctx, w, h } = canvasState;

  // Get theme-aware colors
  const { bgColor, particleColor } = colors();

  // Lazy-initialize the background worker
  if (!workerInitialized) {
    backgroundWorker();
    workerInitialized = true;
  }

  // Worker path: send update command and render received particle data
  if (isBackgroundWorkerReady()) {
    const density = bgState.densityPct;
    const speed = bgState.velocityPct;
    const opacity = bgState.opacityPct;

    // Send update command to background worker
    postToBackgroundWorker({
      type: 'update',
      timestamp: nowMs ?? performance.now(),
      density, speed, opacity,
      themeMode: getThemeMode()
    });

    // Draw solid background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // Render particles received from worker
    const pending = pendingWorkerParticles();
    if (pending) {
      ctx.save();
      ctx.globalCompositeOperation = getThemeMode() === 'light' ? 'multiply' : 'screen';
      renderWorkerParticles(ctx, pending.data, pending.count, opacity, particleColor, getThemeMode());
      ctx.restore();
    }

    return true;
  }

  // Main-thread fallback: seed and update particles locally
  const { velScale, opacityScale, themeAlphaBoost } = seedParticles(particles, w, h);
  const now = nowMs ?? performance.now();

  // Update particle positions and alpha on the main thread
  workersUpdateParticles(particles, w, h, now, velScale, opacityScale, themeAlphaBoost);

  // Draw solid background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Draw particles with appropriate blend mode
  ctx.save();
  ctx.globalCompositeOperation = getThemeMode() === 'light' ? 'multiply' : 'screen';
  renderMainThreadParticles(ctx, particles, opacityScale, themeAlphaBoost, particleColor);
  ctx.restore();

  if (particles.length === 0) console.debug('[drawBackground] no particles to draw');

  return true;
}
