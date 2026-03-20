'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getFillRgb() {
  rebuildDerivedCache();
  return renderState.fillRgb;
}
