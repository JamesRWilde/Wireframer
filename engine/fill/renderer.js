'use strict';

function drawSolidFillModel(model, alphaScale = 1) {
  const opacity = FILL_OPACITY * alphaScale;
  if (!model || !model.V.length || opacity <= 0.001) return;

  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const T = frameData.T;
  const P2 = frameData.P2;

  if (!model._triFaces) model._triFaces = getModelTriangles(model);

  const triFaces = model._triFaces;
  if (!triFaces.length) return;

  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

  const shadingMode = getModelShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const triCornerNormals = useSmoothShading ? getModelTriCornerNormals(model, triFaces) : null;
  const seamExpandPx = useSmoothShading ? DENSE_SEAM_EXPAND_PX : 0;

  let triOrder = model._triOrder;
  if (!triOrder || triOrder.length !== triFaces.length) {
    triOrder = new Array(triFaces.length);
    for (let i = 0; i < triFaces.length; i++) triOrder[i] = { tri: triFaces[i], triIndex: i, z: 0 };
    model._triOrder = triOrder;
  }

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const item = triOrder[i];
    item.tri = tri;
    item.triIndex = i;
    item.z = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
  }
  triOrder.sort((a, b) => b.z - a.z);

  fillLayerCtx.globalCompositeOperation = 'source-over';
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    const normal = resolveTriangleNormal(item, T, triCornerNormals, useSmoothShading);
    if (!normal) continue;

    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading);
    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);
    fillTriangleOnLayer(fillLayerCtx, tri2d, shadeColor);
  }

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = opacity;
  ctx.drawImage(fillLayerCanvas, 0, 0);
  ctx.restore();
}
