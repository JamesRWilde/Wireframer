import { expandTriangleForSeam } from '../raster/expandTriangleForSeam.js';
import { fillTriangleOnLayer } from '../raster/fillTriangleOnLayer.js';

export function renderTrianglesToLayer({ triOrder, model, P2, fillLayerCtx, useSmoothShading, seamExpandPx }) {
  fillLayerCtx.globalCompositeOperation = 'source-over';
  // grab cached shade colors array (must exist courtesy of drawSolidFillModel)
  const shadeColors = model._triShadeColors || [];
  let drawn = 0, skipped = 0;
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;

  for (const { tri, triIndex } of triOrder) {
    const [a, b, c] = tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];
    if (globalThis.DEBUG_TRI_COUNTS) {
      minX = Math.min(minX, ax, bx, cx);
      minY = Math.min(minY, ay, by, cy);
      maxX = Math.max(maxX, ax, bx, cx);
      maxY = Math.max(maxY, ay, by, cy);
    }

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) {
      skipped++;
      if (globalThis.DEBUG_TRI_COUNTS) {
        console.log('[renderTrianglesToLayer] skipping small/degenerate triangle', tri, 'area2', area2.toFixed(3));
      }
      continue;
    }

    let shadeColor;
    if (globalThis.DEBUG_FORCE_RED) {
      shadeColor = [255, 0, 0];
    } else if (globalThis.DEBUG_FORCE_FILL) {
      shadeColor = [255, 255, 255];
    } else {
      shadeColor = shadeColors[triIndex] || [0, 0, 0];
    }

    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);
    fillTriangleOnLayer(fillLayerCtx, tri2d, shadeColor);
    drawn++;
  }
  if (globalThis.DEBUG_TRI_COUNTS) {
    console.log('[renderTrianglesToLayer] drawn', drawn, 'of', triOrder.length, 'skipped', skipped);
    console.log('[renderTrianglesToLayer] bounds', minX.toFixed(1), minY.toFixed(1), maxX.toFixed(1), maxY.toFixed(1));
  }
}
