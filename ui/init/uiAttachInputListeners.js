/**
 * attachInputListenersInit.js - Initialize Input Handling
 * 
 * PURPOSE:
 *   Attaches mouse/touch input listeners for model rotation and zoom.
 *   Called once during app initialization.
 */

"use strict";

import { attachInputListeners } from '../../engine/init/renderEngineAttachInputListeners.js';

export function uiAttachInputListeners() {
  try {
    const cpuCanvas = document.getElementById('c');
    attachInputListeners(cpuCanvas);
  } catch (e) {
    console.warn('[startApp] attachInputListeners failed', e);
  }
}
