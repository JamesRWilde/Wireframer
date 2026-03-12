'use strict';

const DEPTH_BUCKETS = 12;
const buckets = Array.from({ length: DEPTH_BUCKETS }, () => []);

function drawWireframeModel(model, alphaScale = 1) {
  if (!model || !model.V.length || !model.E.length || alphaScale <= 0.001) return;
  const wireStrength = Math.max(0, Math.min(1, alphaScale));

  // Engine-owned mesh only
  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const T = frameData.T;
  const P2 = frameData.P2;

  for (let i = 0; i < DEPTH_BUCKETS; i++) buckets[i].length = 0;
  for (let i = 0; i < model.E.length; i++) {
    const edge = model.E[i];
    const a = edge[0];
    const b = edge[1];
    const z = (T[a][2] + T[b][2]) * 0.5;
    const t = Math.max(0, Math.min(0.999, (Z_HALF - z) / (Z_HALF * 2)));
    buckets[Math.floor(t * DEPTH_BUCKETS)].push(edge);
  }

  ctx.save();
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = rgbA(THEME.wireA, 0.11 * wireStrength);
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = rgbA(THEME.wireB, 0.17 * wireStrength);
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();
  ctx.restore();

  ctx.lineWidth = 0.82 + 0.30 * wireStrength;
  for (let i = 0; i < DEPTH_BUCKETS; i++) {
    if (!buckets[i].length) continue;
    const t = (i + 0.5) / DEPTH_BUCKETS;
    const edgeAlpha = (0.06 + Math.pow(t, 1.35) * 0.94) * wireStrength;
    const alp = edgeAlpha.toFixed(3);
    // Bias toward brighter depth tones so wireframe remains readable on black.
    const c = lerpColor(THEME.wireNear, THEME.wireFar, 0.2 + t * 0.8);
    ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alp})`;
    ctx.beginPath();
    for (const [a, bi] of buckets[i]) {
      ctx.moveTo(P2[a][0], P2[a][1]);
      ctx.lineTo(P2[bi][0], P2[bi][1]);
    }
    ctx.stroke();
  }
}
