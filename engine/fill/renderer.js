
'use strict';
// Ensure getModelTriangles is available (global or import)
if (typeof getModelTriangles === 'undefined' && typeof window !== 'undefined') {
  if (window.getModelTriangles) getModelTriangles = window.getModelTriangles;
}

function drawSolidFillModel(model, alphaScale = 1) {
  const opacity = FILL_OPACITY * alphaScale;
  if (!model || !model.V.length || opacity <= 0.001) return;

  // Engine-owned mesh only: get frame data
  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const T = frameData.T;
  const P2 = frameData.P2;

  // Triangulate faces (compute fresh, don't modify model)
  // Use triangles and per-corner geometry from meshObj
  let triFaces = model.triangles || getModelTriangles(model);
  if (!triFaces || !triFaces.length) return;
  // Support both array-of-arrays and array-of-objects with .indices
  triFaces = triFaces.map(f => (f && f.indices ? f.indices : f));

  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

  // Shading pipeline (engine-owned)
  const shadingMode = getModelShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const triCornerNormals = useSmoothShading ? getModelTriCornerNormals(model, triFaces) : null;
  const seamExpandPx = useSmoothShading ? DENSE_SEAM_EXPAND_PX : 0;

  const triOrder = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i] = { tri: tri, triIndex: i, z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3 };
  }
  triOrder.sort((a, b) => b.z - a.z);

  fillLayerCtx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < triOrder.length; i++) {
    const { tri, triIndex } = triOrder[i];
    const [a, b, c] = tri;
    // Use per-corner geometry from meshObj
    const va = model.V[a], vb = model.V[b], vc = model.V[c];
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    // Use per-corner normals from meshObj if available
    let normal;
    if (model.triangleNormals && model.triangleNormals[triIndex]) {
      const n0 = model.triangleNormals[triIndex][0];
      const n1 = model.triangleNormals[triIndex][1];
      const n2 = model.triangleNormals[triIndex][2];
      normal = [
        (n0[0] + n1[0] + n2[0]) / 3,
        (n0[1] + n1[1] + n2[1]) / 3,
        (n0[2] + n1[2] + n2[2]) / 3
      ];
    } else {
      normal = [
        (va[5] + vb[5] + vc[5]) / 3,
        (va[6] + vb[6] + vc[6]) / 3,
        (va[7] + vb[7] + vc[7]) / 3
      ];
    }
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
