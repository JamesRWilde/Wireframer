import { drawBackground } from '../../render/background/background/drawBackground.js';
import { resolveForegroundRenderMode } from './resolveForegroundRenderMode.js';
import { renderGpuPath } from './renderGpuPath.js';
import { renderCpuPath } from './renderCpuPath.js';
import { handleOtherCases } from './handleOtherCases.js';
import { state } from './loopState.js';

export function renderScene(nowMs) {
  // bail out if there's no active model yet
  const currentModel = globalThis.MODEL;
  if (!currentModel) {
    // still need to update background and maybe return early
    drawBackground(nowMs);
    return { bgMs: 0, fgMs: 0, drewCpuForeground: false, backgroundOnSeparateCanvas: false };
  }

  const bgStartMs = performance.now();
  const backgroundOnSeparateCanvas = drawBackground(nowMs) === true;
  const bgMs = performance.now() - bgStartMs;

  const fgStartMs = performance.now();
  let drewCpuForeground = false;

  if (globalThis.morph?.advanceMorphFrame) globalThis.morph.advanceMorphFrame();

  // force CPU path for debugging – ignore GPU entirely
  const mode = 'cpu';

  const morphing = globalThis.morph?.isMorphing?.() ?? false;
  const meshToRender = morphing ? globalThis.morph?.getCurrentMorphMesh?.() ?? currentModel : currentModel;

  // always draw CPU path, skip GPU
  drewCpuForeground = renderCpuPath(meshToRender, backgroundOnSeparateCanvas);
  // ensure GPU canvas isn't accidentally shown
  handleOtherCases(backgroundOnSeparateCanvas, false);

  const fgMs = performance.now() - fgStartMs;
  return { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas };
}
