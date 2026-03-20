'use strict';
import { renderState } from '@engine/state/render/renderState.js';
import { rebuildDerivedCache } from '@engine/state/render/rebuildDerivedCache.js';

export function getShadeDarkRgb() {
  rebuildDerivedCache();
  return renderState.shadeDarkRgb;
}
