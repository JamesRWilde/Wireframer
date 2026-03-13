/**
 * frameBudget.js - Frame Budget and Adaptive Quality Management
 * 
 * PURPOSE:
 *   Tracks rolling average frame time and adjusts rendering quality to
 *   maintain target FPS. When frame time exceeds budget, reduces quality
 *   of expensive operations to keep the frame rate smooth.
 * 
 * ARCHITECTURE ROLE:
 *   Called by runFrame.js to check frame budget and by renderers to get
 *   current quality level. Provides a feedback loop between frame timing
 *   and rendering quality.
 * 
 * QUALITY LEVELS:
 *   - high: Full quality (smooth shading, specular, full LOD)
 *   - medium: Reduced quality (flat shading, no specular, reduced LOD)
 *   - low: Minimal quality (flat shading, no specular, lowest LOD, skip fill)
 * 
 * ADAPTIVE BEHAVIOR:
 *   - Tracks rolling average of last N frame times
 *   - Downgrades quality when average exceeds budget
 *   - Upgrades quality when average is well under budget
 *   - Hysteresis prevents quality oscillation
 */

"use strict";

// Target frame time for 60 FPS (16.67ms)
const TARGET_FRAME_TIME_MS = 16.67;

// Frame time budget thresholds (in ms)
const BUDGET_HIGH = 14;   // Below this: can increase quality
const BUDGET_MEDIUM = 18; // Above this: should decrease quality
const BUDGET_LOW = 24;    // Above this: aggressive quality reduction

// Rolling average window size
const WINDOW_SIZE = 30;

// Frame time history (circular buffer)
const frameTimes = new Float32Array(WINDOW_SIZE);
let frameTimeIndex = 0;
let frameTimeCount = 0;

// Current quality level
let currentQuality = 'high';

// Hysteresis counters (prevent oscillation)
let upgradeCounter = 0;
let downgradeCounter = 0;
const UPGRADE_THRESHOLD = 15;  // Frames under budget before upgrading
const DOWNGRADE_THRESHOLD = 5; // Frames over budget before downgrading

/**
 * updateFrameTime - Records a frame time for budget tracking
 * 
 * @param {number} frameMs - Frame time in milliseconds
 */
export function updateFrameTime(frameMs) {
  frameTimes[frameTimeIndex] = frameMs;
  frameTimeIndex = (frameTimeIndex + 1) % WINDOW_SIZE;
  if (frameTimeCount < WINDOW_SIZE) frameTimeCount++;
}

/**
 * getAverageFrameTime - Gets the rolling average frame time
 * 
 * @returns {number} Average frame time in milliseconds
 */
export function getAverageFrameTime() {
  if (frameTimeCount === 0) return 0;

  let sum = 0;
  for (let i = 0; i < frameTimeCount; i++) {
    sum += frameTimes[i];
  }
  return sum / frameTimeCount;
}

/**
 * determineTargetQuality - Determines target quality based on frame time
 * 
 * @param {number} avgFrameTime - Average frame time in ms
 * @returns {string|null} Target quality or null if no change needed
 */
function determineTargetQuality(avgFrameTime) {
  if (avgFrameTime > BUDGET_LOW) return 'low';
  if (avgFrameTime > BUDGET_MEDIUM) return 'medium';
  if (avgFrameTime < BUDGET_HIGH) return 'high';
  return null;
}

/**
 * applyQualityChange - Applies quality change with hysteresis
 * 
 * @param {string} targetQuality - Target quality level
 * @param {number} avgFrameTime - Average frame time for logging
 */
function applyQualityChange(targetQuality, avgFrameTime) {
  const isDowngrade = getQualityPriority(targetQuality) < getQualityPriority(currentQuality);
  const isUpgrade = getQualityPriority(targetQuality) > getQualityPriority(currentQuality);

  if (isDowngrade) {
    downgradeCounter++;
    upgradeCounter = 0;
    if (downgradeCounter >= DOWNGRADE_THRESHOLD) {
      currentQuality = targetQuality;
      downgradeCounter = 0;
      if (globalThis.DEBUG_BUDGET) {
        console.log('[frameBudget] Downgraded to', targetQuality.toUpperCase(), 'quality (avg:', avgFrameTime.toFixed(2), 'ms)');
      }
    }
  } else if (isUpgrade) {
    upgradeCounter++;
    downgradeCounter = 0;
    if (upgradeCounter >= UPGRADE_THRESHOLD) {
      currentQuality = targetQuality;
      upgradeCounter = 0;
      if (globalThis.DEBUG_BUDGET) {
        console.log('[frameBudget] Upgraded to', targetQuality.toUpperCase(), 'quality (avg:', avgFrameTime.toFixed(2), 'ms)');
      }
    }
  } else {
    // No change needed, reset counters
    upgradeCounter = 0;
    downgradeCounter = 0;
  }
}

/**
 * getQualityPriority - Gets numeric priority for quality level
 * 
 * @param {string} quality - Quality level
 * @returns {number} Priority (higher = better quality)
 */
function getQualityPriority(quality) {
  switch (quality) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

/**
 * checkBudget - Checks frame budget and adjusts quality level
 * 
 * @returns {string} Current quality level ('high', 'medium', 'low')
 */
export function checkBudget() {
  const avgFrameTime = getAverageFrameTime();
  if (avgFrameTime === 0) return currentQuality;

  const targetQuality = determineTargetQuality(avgFrameTime);
  if (targetQuality === null) {
    // In the middle range, reset counters
    upgradeCounter = 0;
    downgradeCounter = 0;
  } else {
    applyQualityChange(targetQuality, avgFrameTime);
  }

  return currentQuality;
}

/**
 * getQualityLevel - Gets the current quality level
 * 
 * @returns {string} 'high', 'medium', or 'low'
 */
export function getQualityLevel() {
  return currentQuality;
}

/**
 * shouldSkipFill - Whether to skip fill rendering at current quality
 * 
 * @returns {boolean} True if fill should be skipped
 */
export function shouldSkipFill() {
  return currentQuality === 'low';
}

/**
 * shouldUseSpecular - Whether to use specular highlights
 * 
 * @returns {boolean} True if specular should be used
 */
export function shouldUseSpecular() {
  return currentQuality === 'high';
}

/**
 * shouldUseSmoothShading - Whether to use smooth shading
 * 
 * @returns {boolean} True if smooth shading should be used
 */
export function shouldUseSmoothShading() {
  return currentQuality !== 'low';
}

/**
 * getLodScale - Gets LOD reduction factor for current quality
 * 
 * @returns {number} LOD scale (1.0 = full, 0.5 = half detail)
 */
export function getLodScale() {
  switch (currentQuality) {
    case 'high': return 1;
    case 'medium': return 0.7;
    case 'low': return 0.4;
    default: return 1;
  }
}

/**
 * resetBudget - Resets budget tracking (e.g., after model change)
 */
export function resetBudget() {
  frameTimeIndex = 0;
  frameTimeCount = 0;
  upgradeCounter = 0;
  downgradeCounter = 0;
  currentQuality = 'high';
}
