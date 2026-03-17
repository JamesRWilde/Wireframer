/**
 * attachInputListenersInit.js - Initialize Input Handling
 * 
 * PURPOSE:
 *   Attaches mouse/touch input listeners for model rotation and zoom.
 *   Called once during app initialization.
 */

"use strict";

import { attachInputListeners } from '../../engine/init/attachInputListeners.js';

export function inputListeners() {
  try {
    const cpuCanvas = document.getElementById('c');
    attachInputListeners(cpuCanvas);
  } catch (e) {
    console.warn('[startApp] attachInputListeners failed', e);
  }
}
