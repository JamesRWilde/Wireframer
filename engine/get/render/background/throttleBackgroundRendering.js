'use strict';

import { BG_GPU_MIN_INTERVAL_MS } from '@engine/state/render/background/backgroundState.js';

export function throttleBackgroundRendering(lastRenderTime, currentTime) {
  return (currentTime - lastRenderTime) >= BG_GPU_MIN_INTERVAL_MS;
}
