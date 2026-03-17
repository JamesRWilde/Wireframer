/**
 * sliderDisplayPercent.js - Slider Percentage Display
 * 
 * PURPOSE:
 *   Converts a slider's current value to a display percentage (0-100%).
 *   Used to show slider position as a percentage in the UI.
 * 
 * ARCHITECTURE ROLE:
 *   Called by syncRenderToggles to update percentage displays next to sliders.
 *   Provides consistent percentage calculation across all slider controls.
 */

"use strict";

/**
 * sliderDisplayPercent - Converts slider value to display percentage
 * 
 * @param {HTMLInputElement} slider - Slider input element with min, max, value
 * 
 * @returns {number} Percentage (0-100) representing slider position
 * 
 * The function:
 * 1. Extracts min, max, and value from slider
 * 2. Returns 0 if any value is invalid or range is zero
 * 3. Calculates percentage: ((value - min) / (max - min)) * 100
 * 4. Rounds to nearest integer
 */
export function getUiSliderDisplayPercent(slider) {
  // Extract slider properties
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = Number(slider.value);
  
  // Validate: all must be finite and max > min
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(value)) return 0;
  
  // Calculate and round percentage
  return Math.round(((value - min) / (max - min)) * 100);
}
