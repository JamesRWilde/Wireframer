import { clearGpuSceneCanvas } from '../../render/gpu/runtime/clearGpuSceneCanvas.js';
import { drawSolidFillModel } from '../../render/fill/renderer/drawSolidFillModel.js';
import { drawWireframeModel } from '../../render/wireframe/drawWireframeModel.js';
import { setCpuCanvasHidden } from './setCpuCanvasHidden.js';
import { setGpuCanvasHidden } from './setGpuCanvasHidden.js';
import { project } from '../../render/camera/projection/project.js';
import { getOrCreateWireLayer } from '../getOrCreateWireLayer.js';

function drawAxes(ctx) {
  const R = globalThis.PHYSICS_STATE.R;
  const rotate = v => [
    R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
    R[3]*v[0] + R[4]*v[1] + R[5]*v[2],
    R[6]*v[0] + R[7]*v[1] + R[8]*v[2],
  ];
  const o  = project(rotate([0,0,0]));
  const px = project(rotate([1,0,0]));
  const py = project(rotate([0,1,0]));
  const pz = project(rotate([0,0,1]));
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(px[0], px[1]); ctx.stroke();
  ctx.strokeStyle = 'green';
  ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(py[0], py[1]); ctx.stroke();
  ctx.strokeStyle = 'blue';
  ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(pz[0], pz[1]); ctx.stroke();
  ctx.restore();
}

export function renderCpuPath(meshToRender, backgroundOnSeparateCanvas) {
  // debug entry log removed
  const ctx = globalThis.ctx;
  setCpuCanvasHidden(false);
  setGpuCanvasHidden(true);
  if (globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame) {
    clearGpuSceneCanvas();
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = false;
  }
  // always clear the main canvas before drawing; it doesn't hurt even if the
  // background is on another layer, and guarantees no ghosting occurs.
  if (ctx) {
    if (globalThis.DEBUG_CLEAR) {
      console.debug('[renderCpuPath] clearing canvas', ctx.canvas?.id, 'W,H', globalThis.W, globalThis.H);
    }
    ctx.save();
    // also reset transform just in case it drifted
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
    if (globalThis.DEBUG_CLEAR) console.debug('[renderCpuPath] cleared main canvas');
  }
  // Always clear the fill layer before drawing
  if (globalThis.fillLayerCtx && globalThis.fillLayerCanvas) {
    globalThis.fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
    globalThis.fillLayerCtx.clearRect(0, 0, globalThis.W, globalThis.H);
  }
  // Draw fill to its own layer (full alpha)
  drawSolidFillModel(meshToRender, 1);

  // Draw wireframe to its own offscreen layer (full alpha)
  let wireLayer = getOrCreateWireLayer();
  const wireCtx = wireLayer.ctx;
  wireCtx.clearRect(0, 0, globalThis.W, globalThis.H);
  // Temporarily swap global ctx for wireframe rendering
  const prevCtx = globalThis.ctx;
  globalThis.ctx = wireCtx;
  drawWireframeModel(meshToRender, 1); // always draw at full alpha, composite later
  globalThis.ctx = prevCtx;

  // Two-pass compositing: back wireframe under fill, front wireframe over fill (explicit context and mode)
  if (ctx) {
    const w = globalThis.W, h = globalThis.H;
    // 1. Draw back-facing wireframe edges to a temp layer
    const backWireLayer = document.createElement('canvas');
    backWireLayer.width = w;
    backWireLayer.height = h;
    const backWireCtx = backWireLayer.getContext('2d');
    drawWireframeModel(meshToRender, 1, backWireCtx, 'back');

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    // 2. Composite back wireframe under fill, modulated by (1 - fill opacity)
    // When fill is opaque (100%), back wireframe is completely hidden
    // When fill is transparent, back wireframe becomes visible
    if (globalThis.FILL_OPACITY < 0.999) {
      ctx.globalAlpha = globalThis.WIRE_OPACITY * (1 - globalThis.FILL_OPACITY);
      ctx.drawImage(backWireLayer, 0, 0);
    }
    // 3. Draw fill layer with its opacity
    ctx.globalAlpha = globalThis.FILL_OPACITY;
    ctx.drawImage(globalThis.fillLayerCanvas, 0, 0);
    // 4. Draw front-facing/silhouette wireframe edges on top
    // Front wireframe visibility is modulated by wire opacity
    drawWireframeModel(meshToRender, 1, ctx, 'front');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // show orientation axes for debugging rotation
  if (globalThis.DEBUG_SHOW_AXES && ctx) {
    drawAxes(ctx);
  }

  return true;
}
