'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getEdgeColor() {
  rebuildDerivedCache();
  return renderState.edgeColor;
}
