/**
 * vertex-transform-worker.js - Vertex Transformation Web Worker
 * 
 * PURPOSE:
 *   Performs matrix multiplication and perspective projection on vertex data
 *   in a separate thread, freeing the main thread for rendering and UI.
 * 
 * ARCHITECTURE ROLE:
 *   Receives flat Float32Array vertex data and rotation matrix, computes
 *   transformed 3D positions (T) and projected 2D screen coordinates (P2),
 *   then transfers results back to main thread via zero-copy transferable.
 * 
 * MESSAGE PROTOCOL:
 *   Main → Worker:
 *     { type: 'transform', vertices: Float32Array, rotation: Float32Array,
 *       fov, halfW, halfH, modelCy, frameId }
 * 
 *   Worker → Main:
 *     { type: 'transformed', T: Float32Array, P2: Float32Array, frameId }
 * 
 * DATA FORMAT:
 *   - vertices: [x0,y0,z0, x1,y1,z1, ...] flat Float32Array
 *   - rotation: [r00,r01,r02, r10,r11,r12, r20,r21,r22] flat Float32Array
 *   - T: [tx0,ty0,tz0, tx1,ty1,tz1, ...] transformed positions
 *   - P2: [px0,py0, px1,py1, ...] projected 2D coordinates
 */

"use strict";

/**
 * transformVertices - Performs matrix multiply + perspective projection
 * 
 * @param {Float32Array} V - Flat vertex array [x0,y0,z0, x1,y1,z1, ...]
 * @param {Float32Array} R - Rotation matrix [r00,r01,r02, r10,r11,r12, r20,r21,r22]
 * @param {number} fov - Field of view scale factor
 * @param {number} halfW - Half canvas width
 * @param {number} halfH - Half canvas height
 * @param {number} modelCy - Model center Y offset
 * 
 * @returns {{ T: Float32Array, P2: Float32Array }} Transformed and projected arrays
 */
function transformVertices(V, R, fov, halfW, halfH, modelCy) {
  const vertexCount = V.length / 3;
  const T = new Float32Array(vertexCount * 3);
  const P2 = new Float32Array(vertexCount * 2);

  // Extract rotation matrix components (row-major)
  const r00 = R[0], r01 = R[1], r02 = R[2];
  const r10 = R[3], r11 = R[4], r12 = R[5];
  const r20 = R[6], r21 = R[7], r22 = R[8];

  for (let i = 0; i < vertexCount; i++) {
    const vi = i * 3;
    const pi = i * 2;

    // Read vertex position
    const vx = V[vi];
    const vy = V[vi + 1];
    const vz = V[vi + 2];

    // Matrix multiply: T = R * V
    const tx = r00 * vx + r01 * vy + r02 * vz;
    const ty = r10 * vx + r11 * vy + r12 * vz;
    const tz = r20 * vx + r21 * vy + r22 * vz;

    // Store transformed position
    T[vi] = tx;
    T[vi + 1] = ty;
    T[vi + 2] = tz;

    // Orthographic projection: no depth-dependent scaling.
    // The OBJ shape is preserved exactly — no perspective distortion.
    P2[pi] = halfW + tx * fov;
    P2[pi + 1] = halfH - (ty - modelCy) * fov;
  }

  return { T, P2 };
}

// Worker message handler
onmessage = (event) => {
  const { type, vertices, rotation, fov, halfW, halfH, modelCy, frameId } = event.data;

  if (type === 'transform') {
    try {
      const { T, P2 } = transformVertices(vertices, rotation, fov, halfW, halfH, modelCy);

      // Transfer buffers back (zero-copy)
      postMessage(
        { type: 'transformed', T, P2, frameId },
        [T.buffer, P2.buffer]
      );
    } catch (error) {
      postMessage({
        type: 'error',
        message: error.message,
        frameId
      });
    }
  }
};
