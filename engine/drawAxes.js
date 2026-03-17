import { projectVertices } from '../render/projectVertices.js';

export function drawAxes(ctx) {
  const R = globalThis.PHYSICS_STATE.R;
  const rotate = v => [
    R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
    R[3]*v[0] + R[4]*v[1] + R[5]*v[2],
    R[6]*v[0] + R[7]*v[1] + R[8]*v[2],
  ];
  const o  = projectVertices(rotate([0,0,0]));
  const px = projectVertices(rotate([1,0,0]));
  const py = projectVertices(rotate([0,1,0]));
  const pz = projectVertices(rotate([0,0,1]));
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
