/**
 * budgetState.js - Frame Budget Configuration and State
 *
 * PURPOSE:
 *   Defines the frame budget thresholds, quality level constants, and
 *   holds the mutable state for the adaptive quality system. Controls
 *   when the engine should upgrade or downgrade rendering quality based
 *   on frame time performance.
 *
 * ARCHITECTURE ROLE:
 *   Central configuration and state module for the frame budget system.
 *   Read by budget.js, averageTime.js, determineTarget.js, and
 *   qualityApplyChange.js. Written by time.js and qualityApplyChange.js.
 *
 * QUALITY LEVELS:
 *   - 'high': Target <14ms per frame (60+ FPS)
 *   - 'medium': Target <18ms per frame (~55 FPS)
 *   - 'low': Target <24ms per frame (~42 FPS)
 *
 * HYSTERESIS:
 *   Requires sustained DOWNGRADE_THRESHOLD (5) consecutive budget
 *   violations before downgrading, and UPGRADE_THRESHOLD (15) consecutive
 *   under-budget frames before upgrading, to avoid rapid oscillation.
 */

"use strict";

/** Target frame time in milliseconds (16.67ms = 60 FPS) */
export const TARGET_FRAME_TIME_MS = 16.67;

/** High quality budget: 14ms per frame */
export const BUDGET_HIGH = 14;

/** Medium quality budget: 18ms per frame */
export const BUDGET_MEDIUM = 18;

/** Low quality budget: 24ms per frame */
export const BUDGET_LOW = 24;

/** Number of frame times to keep in the circular buffer */
export const WINDOW_SIZE = 30;

/** Consecutive under-budget frames needed before quality upgrade */
export const UPGRADE_THRESHOLD = 15;

/** Consecutive over-budget frames needed before quality downgrade */
export const DOWNGRADE_THRESHOLD = 5;

/**
 * budgetState - Mutable state for the adaptive frame budget system
 * @property {Float32Array} frameTimes - Circular buffer of recent frame durations
 * @property {number} frameTimeIndex - Current write index in the circular buffer
 * @property {number} frameTimeCount - Number of recorded frame times (up to WINDOW_SIZE)
 * @property {string} currentQuality - Active quality level ('high', 'medium', 'low')
 * @property {number} upgradeCounter - Consecutive under-budget frames (for upgrade hysteresis)
 * @property {number} downgradeCounter - Consecutive over-budget frames (for downgrade hysteresis)
 */
export const budgetState = {
  frameTimes: new Float32Array(30),
  frameTimeIndex: 0,
  frameTimeCount: 0,
  currentQuality: 'high',
  upgradeCounter: 0,
  downgradeCounter: 0,
};
