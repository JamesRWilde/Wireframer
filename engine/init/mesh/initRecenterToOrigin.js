/**
 * recenterToOrigin.js - Recenter mesh vertices to the origin
 *
 * PURPOSE:
 *   Translates mesh vertices so the model is centered at the origin.
 *
 * ARCHITECTURE ROLE:
 *   Used by mesh initialization and morphing to keep object coordinate
 *   systems consistent.
 *
 * WHY THIS EXISTS:
 *   Ensures common centering behavior in one place and avoids floating
 *   reference center discrepancies across pipeline stages.
 */

"use strict";

/**
 * recenterToOrigin - Translates all vertices so the mesh is centered at the origin
 *
 * @param {Object} mesh - Mesh object with V (vertices) array
 */
export function recenterToOrigin(mesh) {
  if (!mesh?.V?.length) return;

  let cx = Infinity, cy = Infinity, cz = Infinity;
  let Cx = -Infinity, Cy = -Infinity, Cz = -Infinity;

  for (const v of mesh.V) {
    if (v[0] < cx) cx = v[0];
    if (v[0] > Cx) Cx = v[0];
    if (v[1] < cy) cy = v[1];
    if (v[1] > Cy) Cy = v[1];
    if (v[2] < cz) cz = v[2];
    if (v[2] > Cz) Cz = v[2];
  }

  const centerX = (cx + Cx) * 0.5;
  const centerY = (cy + Cy) * 0.5;
  const centerZ = (cz + Cz) * 0.5;

  for (const v of mesh.V) {
    v[0] -= centerX;
    v[1] -= centerY;
    v[2] -= centerZ;
  }
}
