'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getFillOpacity() {
  return renderState.fillOpacity;
}
