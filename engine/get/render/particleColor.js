'use strict';
import { renderState, rebuildDerivedCache } from '@engine/state/render/renderState.js';

export function getParticleColor() {
  rebuildDerivedCache();
  return renderState.particleColor;
}
