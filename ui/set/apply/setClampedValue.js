/**
 * applyClampedValue.js - Apply Clamped Value to Input Element
 *
 * PURPOSE:
 *   Applies a clamped value from a stored state object to an input element.
 *   Ensures UI controls always display a valid value within allowed bounds.
 *
 * ARCHITECTURE ROLE:
 *   Utility used by restoreState to consistently apply saved state values
 *   to the UI controls while enforcing min/max ranges.
 *
 * @param {Object} params
 * @param {Object} params.state - The deserialized UI state object from localStorage
 * @param {string} params.key - Key name in the state object
 * @param {HTMLInputElement} params.element - DOM element to update
 * @param {number} params.min - Minimum allowed value
 * @param {number} params.max - Maximum allowed value
 * @param {number} params.defaultValue - Default value to use when state value is missing or invalid
 */
import { utilClampNumber }from '@ui/get/color/utilClampNumber.js';

export function setClampedValue({ state, key, element, min, max, defaultValue }) {
  if (!(key in state) || !element) return;
  element.value = String(utilClampNumber(state[key], min, max, defaultValue));
}
