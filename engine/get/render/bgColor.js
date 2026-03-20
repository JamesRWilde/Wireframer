'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getBgColor() {
  rebuildDerivedCache();
  return renderState.bgColor;
}
