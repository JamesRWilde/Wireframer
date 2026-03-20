'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getShadeBrightRgb() {
  rebuildDerivedCache();
  return renderState.shadeBrightRgb;
}
