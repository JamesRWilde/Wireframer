import { clearGpuSceneCanvas } from '../../render/gpu/runtime/clearGpuSceneCanvas.js';
import { drawSolidFillModel } from '../../render/fill/renderer/drawSolidFillModel.js';
import { drawWireframeModel } from '../../render/wireframe/drawWireframeModel.js';
import { setCpuCanvasHidden } from './setCpuCanvasHidden.js';
import { setGpuCanvasHidden } from './setGpuCanvasHidden.js';
import { project } from '../../render/camera/projection/project.js';

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
    if (window.DEBUG_CLEAR) {
      console.debug('[renderCpuPath] clearing canvas', ctx.canvas && ctx.canvas.id, 'W,H', globalThis.W, globalThis.H);
    }
    ctx.save();
    // also reset transform just in case it drifted
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
    if (window.DEBUG_CLEAR) console.debug('[renderCpuPath] cleared main canvas');
  }
  drawSolidFillModel(meshToRender, 1);
  // for extra safety in debug builds, we can also clear after drawing; this
  // won't affect release performance but helps confirm behaviour.
  if (window.DEBUG_CLEAR && ctx) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
    console.debug('[renderCpuPath] post-clear main canvas');
  }
  if (globalThis.WIRE_OPACITY > 0.001) drawWireframeModel(meshToRender, globalThis.WIRE_OPACITY);

  // show orientation axes for debugging rotation
  if (window.DEBUG_SHOW_AXES && ctx) {
    drawAxes(ctx);
  }

  return true;
}
