'use strict';

function getMorphFrameParams(nowMs, tRaw) {
  if (!MORPH || !MORPH.active) {
    return { cy: MODEL_CY, zHalf: Z_HALF };
  }

  const points = getMorphNowVertices(nowMs);
  const sampledParams = computeFrameParams(points);
  const targetParams = MORPH.targetFrameParams || sampledParams;
  const blend = Math.max(0, Math.min(1, tRaw));
  return {
    cy: sampledParams.cy + (targetParams.cy - sampledParams.cy) * blend,
    zHalf: sampledParams.zHalf + (targetParams.zHalf - sampledParams.zHalf) * blend,
  };
}

function drawMorphPoints(nowMs, tRaw, t) {
  if (!MORPH || !MORPH.active) return;
  const points = getMorphNowVertices(nowMs);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Draw morphing points and guides (engine-owned mesh only)
  const linkAlpha = (0.08 + (1 - Math.abs(0.5 - t) * 2) * 0.08).toFixed(3);
  ctx.lineWidth = 0.65;
  ctx.strokeStyle = rgbA(THEME.morph, Number(linkAlpha));
  ctx.beginPath();
  for (let i = 0; i < MORPH.sampleCount; i += 2) {
    const pFrom = project(mvec(R, MORPH.fromPts[i]));
    const pTo = project(mvec(R, MORPH.toPts[i]));
    ctx.moveTo(pFrom[0], pFrom[1]);
    ctx.lineTo(pTo[0], pTo[1]);
  }
  ctx.stroke();

  // Particle streaks for morphing
  const tPrev = easeInOutCubic(Math.max(0, tRaw - 0.06));
  for (let i = 0; i < MORPH.sampleCount; i++) {
    const from = MORPH.fromPts[i];
    const to = MORPH.toPts[i];
    const v = points[i];
    const vPrev = [
      from[0] + (to[0] - from[0]) * tPrev,
      from[1] + (to[1] - from[1]) * tPrev,
      from[2] + (to[2] - from[2]) * tPrev,
    ];

    const p = project(mvec(R, v));
    const pPrev = project(mvec(R, vPrev));

    ctx.lineWidth = 1.0;
    ctx.strokeStyle = rgbA(THEME.morph, 0.22);
    ctx.beginPath();
    ctx.moveTo(pPrev[0], pPrev[1]);
    ctx.lineTo(p[0], p[1]);
    ctx.stroke();

    const r = 1.0 + t * 0.55;
    const a = 0.13 + Math.sin((p[0] + p[1] + nowMs * 0.03) * 0.01) * 0.04;
    ctx.beginPath();
    ctx.fillStyle = rgbA(THEME.morph, Math.max(0.06, a));
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Morph completion: engine sets new model
  if (tRaw >= 1) {
    MORPH.active = false;
    setActiveModel(MORPH.toModel, MORPH.targetName);
    MORPH = null;
    HOLD_ROTATION_FRAMES = 1;
    dragging = false; // Always reset drag state after morph
  }
}

function finalizeMorphIfDone(tRaw) {
  if (!MORPH || !MORPH.active) return;
  if (tRaw < 1) return;

  MORPH.active = false;
  // Persist the morphed mesh as the new MODEL
  if (MORPH && MORPH.meshModel) {
    MODEL = MORPH.meshModel;
    setActiveModel(MODEL, MORPH.targetName, MORPH.targetV, MORPH.targetE);
  } else {
    setActiveModel(MORPH.toModel, MORPH.targetName, MORPH.targetV, MORPH.targetE);
  }
  MORPH = null;
  HOLD_ROTATION_FRAMES = 1;
  dragging = false; // Ensure drag state is reset after morph
}
