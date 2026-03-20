'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getBgRgb() {
  rebuildDerivedCache();
  return renderState.bgRgb;
}
