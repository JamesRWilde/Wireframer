/**
 * presetSwatches.js - Preset Swatch UI Initializer
 *
 * PURPOSE:
 *   Builds the preset color swatch UI and wires click handlers for selecting
 *   preset colors or generating a random preset. Each swatch renders as a
 *   clickable button showing the preset color with a tooltip of its name and hex value.
 *
 * ARCHITECTURE ROLE:
 *   Called during app startup from the theme UI initialization. Populates the
 *   preset swatch container with buttons and registers click handlers that
 *   apply the selected preset color to the current scene.
 *
 * DEPENDENCIES:
 *   - toHex / toRgbCss: Color format conversions for display
 *   - customRgb: Applies and persists the selected preset color
 *   - randomPresetRgb: Generates a random preset for the shuffle button
 *   - DOM refs: presetSwatches container, shared button array for external access
 */

"use strict";

import { utilHex }from '@ui/get/color/utilHex.js';
import { utilRgbCss }from '@ui/get/color/utilRgbCss.js';
import { setCustomRgb }from '@ui/set/setCustomRgb.js';
import { getRandomPresetRgb }from '@ui/get/getRandomPresetRgb.js';
import { PRESET_SWATCHES, PRESET_SWATCH_BUTTONS, presetSwatchesEl, SHUFFLE_SWATCH_NAME }from '@ui/state/stateDom.js';

/**
 * presetSwatches - Builds the preset swatch UI and wires click handlers.
 *
 * Creates a button for each entry in PRESET_SWATCHES, styled with the preset
 * color via a CSS custom property (--swatch-color). Clicking a swatch applies
 * that color to the scene with persist: true (saves to localStorage).
 *
 * Also creates a shuffle button at the end that generates a random preset
 * color when clicked.
 *
 * No-ops if the presetSwatches DOM element is not found.
 *
 * @returns {void}
 */
export function initPresetSwatches() {
  // Bail if the swatch container doesn't exist in the DOM
  if (!presetSwatchesEl) return;

  // Clear any existing swatches and reset the button registry
  presetSwatchesEl.innerHTML = '';
  PRESET_SWATCH_BUTTONS.length = 0;

  // Create a button for each preset color
  for (const preset of PRESET_SWATCHES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-swatch';
    button.title = `${preset.name} (${utilHex(preset.rgb)})`;
    button.setAttribute('aria-label', `${preset.name} preset ${utilHex(preset.rgb)}`);
    button.style.setProperty('--swatch-color', utilRgbCss(preset.rgb));
    button.addEventListener('click', () => {
      setCustomRgb(preset.rgb, { persist: true, apply: true });
    });

    // Append button and register in the shared array for external access
    presetSwatchesEl.appendChild(button);
    PRESET_SWATCH_BUTTONS.push({ button, rgb: preset.rgb });
  }

  // Create shuffle button (random preset on click)
  const shuffleButton = document.createElement('button');
  shuffleButton.type = 'button';
  shuffleButton.className = 'preset-swatch is-shuffle';
  shuffleButton.title = `${SHUFFLE_SWATCH_NAME} random preset`;
  shuffleButton.setAttribute('aria-label', `${SHUFFLE_SWATCH_NAME} random preset`);
  shuffleButton.addEventListener('click', () => {
    setCustomRgb(getRandomPresetRgb(), { persist: true, apply: true });
  });
  presetSwatchesEl.appendChild(shuffleButton);
}
