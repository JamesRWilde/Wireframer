/**
 * initPresetSwatches.js - Preset Swatch UI Initializer
 *
 * PURPOSE:
 *   Builds the preset color swatch UI and wires click handlers for selecting
 *   preset colors or generating a random preset.
 *
 * ARCHITECTURE ROLE:
 *   Initializes the preset swatch section of the theme controls during app startup.
 *   Provides the user with quick access to pre-defined and random custom colors.
 */

"use strict";

import { presetSwatches, PRESET_SWATCHES, PRESET_SWATCH_BUTTONS, SHUFFLE_SWATCH_NAME } from '../state/uiDom.js';
import { uiColorToHex } from '../get/uiColorToHex.js';
import { uiColorToRgbCss } from '../get/uiColorToRgbCss.js';
import { uiCustomRgb } from '../set/uiCustomRgb.js';
import { uiRandomPresetRgb } from '../get/uiRandomPresetRgb.js';

export function uiPresetSwatches() {
  if (!presetSwatches) return;
  presetSwatches.innerHTML = '';
  PRESET_SWATCH_BUTTONS.length = 0;

  for (const preset of PRESET_SWATCHES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-swatch';
    button.title = `${preset.name} (${GetUiColorToHex(preset.rgb)})`;
    button.setAttribute('aria-label', `${preset.name} preset ${GetUiColorToHex(preset.rgb)}`);
    button.style.setProperty('--swatch-color', GetUiColorToRgbCss(preset.rgb));
    button.addEventListener('click', () => {
      SetUiCustomRgb(preset.rgb, { persist: true, apply: true });
    });

    presetSwatches.appendChild(button);
    PRESET_SWATCH_BUTTONS.push({ button, rgb: preset.rgb });
  }

  const shuffleButton = document.createElement('button');
  shuffleButton.type = 'button';
  shuffleButton.className = 'preset-swatch is-shuffle';
  shuffleButton.title = `${SHUFFLE_SWATCH_NAME} random preset`;
  shuffleButton.setAttribute('aria-label', `${SHUFFLE_SWATCH_NAME} random preset`);
  shuffleButton.addEventListener('click', () => {
    SetUiCustomRgb(GetUiRandomPresetRgb(), { persist: true, apply: true });
  });
  presetSwatches.appendChild(shuffleButton);
}
