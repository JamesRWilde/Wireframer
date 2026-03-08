'use strict';

function frame(nowMs = 0) {
  requestAnimationFrame(frame);

  // Physics
  R = mmul(mry(wy), mmul(mrx(wx), mmul(mrz(wz), R)));
  if (++frameCount % 120 === 0) R = reorthogonalize(R);

  if (!dragging) {
    wx += (AUTO_WX - wx) * 0.04;
    wy += (AUTO_WY - wy) * 0.04;
    wz += (AUTO_WZ - wz) * 0.04;
  } else {
    wx *= 0.85;
    wy *= 0.85;
  }

  // Draw
  drawBackground(nowMs);

  if (MORPH && MORPH.active) {
    const tRaw = Math.max(0, Math.min(1, (nowMs - MORPH.startMs) / MORPH.durationMs));
    const t = easeInOutCubic(tRaw);
    drawSolidFillModel(MORPH.fromModel, (1 - t) * 0.65);
    drawSolidFillModel(MORPH.toModel, t * 0.65);
    if (WIRE_OPACITY > 0.001) {
      // Keep wireframes as faint context; primary effect is moving geometry points.
      drawWireframeModel(MORPH.fromModel, (1 - t) * 0.25 * WIRE_OPACITY);
      drawWireframeModel(MORPH.toModel, t * 0.25 * WIRE_OPACITY);
    }
    drawMorphPoints(nowMs, tRaw, t);
  } else {
    drawSolidFillModel(MODEL, 1);
    if (WIRE_OPACITY > 0.001) drawWireframeModel(MODEL, WIRE_OPACITY);
  }
}

function startApp() {
  initObjectSelector();
  requestAnimationFrame(frame);
}

const ready = window.WireframeObjectsReady || Promise.resolve();
ready.then(startApp).catch((err) => {
  console.error(err);
  document.getElementById('obj-label').textContent = 'Failed to load objects';
  requestAnimationFrame(frame);
});
