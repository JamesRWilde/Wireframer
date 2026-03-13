"use strict";

import { startMorph } from './morphing/startMorph.js';
import { advanceMorphFrame } from './morphing/advanceMorphFrame.js';
import { getCurrentMorphMesh } from './morphing/getCurrentMorphMesh.js';
import { isMorphing } from './morphing/isMorphing.js';
import { stopMorph } from './morphing/stopMorph.js';

// Morph duration constant
globalThis.MORPH_DURATION_MS = 1600;

// Expose morph API globally so finalizeModel and renderScene can use it
globalThis.morph = {
  startMorph,
  advanceMorphFrame,
  getCurrentMorphMesh,
  isMorphing,
  stopMorph,
};
