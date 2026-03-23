/**
 * setRenderMeshUnified.js - Unified Triangle Renderer
 *
 * PURPOSE:
 *   Renders a mesh by drawing each triangle with fill and edges in a single pass.
 *   No offscreen canvases, no compositing, no workers. Just triangles with edges.
 *
 * ARCHITECTURE ROLE:
 *   Replaces the 3-layer compositing approach (fill layer + back wire + front wire)
 *   with a simple per-triangle rendering loop. Each triangle is drawn completely
 *   (fill then edges) before moving to the next.
 *
 * RENDERING APPROACH:
 *   1. Sort triangles back-to-front (painter's algorithm)
 *   2. For each triangle:
 *      a. Compute shade color using Blinn-Phong lighting
 *      b. Fill triangle with fill opacity
 *      c. Draw triangle edges with wire opacity
 *   3. Done - no compositing needed
 */

"use strict";

// Import frame data getter — retrieves transformed (T) and projected (P2) vertex positions
import { utilFrameData }from '@engine/util/render/model/utilFrameData.js';
// Import triangle face getter — extracts face index arrays from the model
import { utilModelTriangles }from '@engine/util/render/model/utilModelTriangles.js';
// Import shading mode detector — determines flat vs smooth shading for the model
import { utilShadingMode }from '@engine/util/cpu/utilShadingMode.js';
// Import corner normal computer — computes per-corner normals for smooth shading
import { utilTriCornerNormals }from '@engine/util/render/model/utilTriCornerNormals.js';
// Import triangle normal resolver — determines face/corner normals for lighting
import { utilTriangleNormalCpu }from '@engine/util/render/utilTriangleNormalCpu.js';
// Import triangle shading computer — calculates fill color from normal using Blinn-Phong
import { utilTriangleCpu }from '@engine/util/render/utilTriangleCpu.js';
// Import edge color getter — retrieves the precomputed wireframe edge color
import { getEdgeColor } from '@engine/get/render/getEdgeColor.js';
// Import opacity getters — read the current fill and wire opacity from slider state
import { getFillOpacity } from '@engine/get/render/getFillOpacity.js';
import { getWireOpacity } from '@engine/get/render/getWireOpacity.js';
// Import render state — holds wire width and other rendering parameters
import { renderState } from '@engine/state/render/stateRenderState.js';
// Import depth sort — sorts triangle indices by average z-depth for painter's algorithm
import { setSortTrianglesByDepth } from '@engine/set/cpu/setSortTrianglesByDepth.js';
// Import triangle renderer — draws a single filled + stroked triangle on canvas
import { setRenderTriangle } from '@engine/set/cpu/setRenderTriangle.js';

/**
 * setRenderMeshUnified - Renders mesh with per-triangle fill and edges
 *
 * @param {Object} model - Model with V, F, E data
 * @param {CanvasRenderingContext2D} ctx - Canvas context to draw to
 */
export function setRenderMeshUnified(model, ctx) {
  if (!model?.V?.length || !model?.F?.length || !ctx) return;

  // Get transformed vertices
  const fd = utilFrameData(model);
  if (!fd) return;
  const { T, P2 } = fd;

  // Get triangle faces
  const triFaces = utilModelTriangles(model);
  if (!triFaces?.length) return;

  // Get shading mode and normals
  const shadingMode = utilShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const triCornerNormals = useSmoothShading
    ? utilTriCornerNormals(model, triFaces)
    : null;

  // Read cached derived values from renderState
  const fillAlpha = getFillOpacity();
  const wireAlpha = getWireOpacity();
  const edgeColor = getEdgeColor(); // precomputed, cached

  const triCount = triFaces.length;

  // ── Telemetry: sort ──
  performance.mark('cpu-sort-start');
  const sortedIndices = setSortTrianglesByDepth(triFaces, T, triCount);
  performance.mark('cpu-sort-end');
  performance.measure('cpu-sort', 'cpu-sort-start', 'cpu-sort-end');

  // ── Telemetry: per-phase timing ──
  let tLight = 0;

  // Render each triangle in sorted order
  ctx.save();
  ctx.lineWidth = Number(renderState.wireWidth || 0.2);
  let lastFillStyle = '';

  for (let si = 0; si < triCount; si++) {
    const triIdx = sortedIndices[si];
    const tri = triFaces[triIdx];

    // ── Lighting phase ──
    let t0 = performance.now();

    // Compute normal for lighting
    const normal = utilTriangleNormalCpu(tri, triIdx, T, triCornerNormals, useSmoothShading);
    if (!normal) continue;

    // Compute shade color
    const shadeColor = utilTriangleCpu(normal, useSmoothShading);

    tLight += performance.now() - t0;

    // ── Render phase ──
    const renderOpts = { fillAlpha, edgeColor, wireAlpha };
    const lightingData = { shadeColor };
    lastFillStyle = setRenderTriangle(ctx, tri, P2, renderOpts, lightingData, lastFillStyle);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
