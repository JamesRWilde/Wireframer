/**
 * persistCustomRgb.js - Persist Custom RGB to Local Storage
 *
 * PURPOSE:
 *   Stores the current custom RGB color to localStorage for persistence across sessions.
 *
 * ARCHITECTURE ROLE:
 *   Called when the user changes the custom color, allowing it to be restored on reload.
 *
 * DATA FORMAT:
 *   - Stored as a JSON stringified array [r, g, b] under CUSTOM_RGB_KEY.
 */

"use strict";

import {CUSTOM_RGB_KEY}from '@ui/state/dom.js';
import { getCustomRgbState } from '@ui/state/customRgbState.js';

export function customRgb() {
  try {
    localStorage.setItem(CUSTOM_RGB_KEY, JSON.stringify(getCustomRgbState()));
  } catch {
    // Ignore localStorage failures (private mode/quota).
  }
}
