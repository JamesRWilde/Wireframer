'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getShadeDarkRgb() {
  rebuildDerivedCache();
  return renderState.shadeDarkRgb;
}
