'use strict';
import { renderState } from '@engine/state/render/renderState.js';
import { rebuildDerivedCache } from '@engine/set/render/physics/rebuildDerivedCache.js';

export function getFillRgb() {
  rebuildDerivedCache();
  return renderState.fillRgb;
}
