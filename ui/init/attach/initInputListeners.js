/**
 * attachInputListenersInit.js - Initialize Input Handling
 * 
 * PURPOSE:
 *   Attaches mouse/touch input listeners for model rotation and zoom.
 *   Called once during app initialization.
 */

"use strict";

import { initAttachInputListeners }from '@engine/init/render/initAttachInputListeners.js';

export function initInputListeners() {
  try {
    const cpuCanvas = document.getElementById('c');
    initAttachInputListeners(cpuCanvas);
  } catch (e) {
    console.warn('[startApp] initAttachInputListeners failed', e);
  }
}
