/**
 * fill-render-worker.js - Fill Rendering Web Worker
 * 
 * PURPOSE:
 *   Performs triangle sorting, lighting calculations, and rasterization
 *   in a separate thread using OffscreenCanvas. Frees the main thread
 *   from expensive per-triangle operations.
 * 
 * ARCHITECTURE ROLE:
 *   Receives transformed vertex data and triangle faces, computes lighting,
 *   sorts triangles back-to-front, and rasterizes them to an OffscreenCanvas.
 *   Returns the rendered ImageBitmap for compositing on the main thread.
 *
 * WHY THIS EXISTS:
 *   Documents the worker role and intent, making the communications protocol
 *   explicit for maintenance and debugging.
 *
 * MESSAGE PROTOCOL:
 *   Main → Worker:
 *     { type: 'init', canvas: OffscreenCanvas } - Initialize with canvas
 *     { type: 'render', T, P2, triFaces, triCornerNormals, shadingMode,
 *       theme, fillAlpha, seamExpandPx, frameId } - Render frame
 * 
 *   Worker → Main:
 *     { type: 'ready' } - Worker initialized
 *     { type: 'rendered', imageBitmap: ImageBitmap, frameId } - Rendered frame
 * 
 * DATA FORMAT:
 *   - T: Float32Array of transformed vertices [x0,y0,z0, x1,y1,z1, ...]
 *   - P2: Float32Array of projected vertices [x0,y0, x1,y1, ...]
 *   - triFaces: Uint32Array of triangle indices [i0,i1,i2, i3,i4,i5, ...]
 *   - triCornerNormals: Float32Array of per-corner normals
 */

"use strict";

// OffscreenCanvas context (set during init)
let offCtx = null;
let canvasWidth = 0;
let canvasHeight = 0;
// Worker message handler
onmessage = async (event) => {
  const { type } = event.data;

  try {
    switch (type) {
      case 'init': {
        const { canvas, width, height } = event.data;
        canvasWidth = width;
        canvasHeight = height;
        offCtx = canvas.getContext('2d');
        postMessage({ type: 'ready' });
        break;
      }

      case 'resize': {
        const { width, height } = event.data;
        canvasWidth = width;
        canvasHeight = height;
        break;
      }

      case 'render': {
        if (!offCtx) {
          postMessage({ type: 'error', message: 'Worker not initialized' });
          return;
        }

        const { T, P2, triFaces, triCornerNormals, useSmoothShading, theme, fillAlpha, seamExpandPx, R, frameId } = event.data;
        


        // Clear canvas
        offCtx.setTransform(1, 0, 0, 1, 0, 0);
        offCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        offCtx.globalCompositeOperation = 'source-over';

        // Render triangles
        renderFillTriangles({
          T, P2, triFaces, triCornerNormals, useSmoothShading,
          theme, fillAlpha, seamExpandPx, R, ctx: offCtx
        });

        // Transfer as ImageBitmap
        const imageBitmap = await createImageBitmap(offCtx.canvas);
        postMessage({ type: 'rendered', imageBitmap, frameId }, [imageBitmap]);
        break;
      }
    }
  } catch (error) {
    postMessage({ type: 'error', message: error.message });
  }
};
