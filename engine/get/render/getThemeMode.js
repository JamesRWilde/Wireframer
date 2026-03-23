'use strict';

/**
 * getThemeMode - Get Theme Mode
 *
 * PURPOSE:
 *   Returns current theme mode ("light" or "dark").
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getThemeMode.js
 *
 * WHY THIS EXISTS:
 *   Centralizing theme mode retrieval makes UI state transitions reliable
 *   and avoids scattered calls to render state from multiple modules.
 */

// Import render state for theme metadata
import { renderState } from '@engine/state/render/stateRenderState.js';


/**
 * Returns current theme mode ("light" or "dark").
 * @returns {*} The current value from state.
 */
export function getThemeMode() {
  return renderState.themeMode;
}
