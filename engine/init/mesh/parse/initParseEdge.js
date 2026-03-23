/**
 * parseEdge.js - OBJ Edge Line Parser
 *
 * PURPOSE:
 *   Parses OBJ edge element lines ("e") into edge pairs. OBJ edges
 *   represent freeform edges, silhouette edges, or explicit wireframe
 *   edges defined by the model author. These are NOT derived from faces
 *   — they are intentional geometry that must be preserved.
 *
 * OBJ EDGE FORMAT:
 *   e v1 v2 [v3 ... vn]
 *   Where v1, v2 are 1-based vertex indices (required).
 *   Additional vertices define a connected edge line.
 *
 * ARCHITECTURE ROLE:
 *   Called by parseObjLines for each "e" line. Stores raw edges for
 *   the mesh builder, which preserves them as-is. Face-derived edges
 *   and explicit OBJ edges are kept separate so the renderer knows
 *   which came from the author and which were computed.
 *
 * WHY THIS EXISTS:
 *   Ensures explicit OBJ edge geometry is preserved and tracked separately
 *   from face-derived connections, enabling accurate wireframe rendering.
 */

export function parseEdge(parts, state) {
  // Need at least "e v1 v2"
  if (parts.length < 3) return;

  // Parse 1-based vertex indices, convert to 0-based
  for (let i = 1; i < parts.length; i++) {
    const idx = Number(parts[i]);
    if (!Number.isFinite(idx) || idx === 0) continue;

    // Each consecutive pair is an edge
    if (i < parts.length - 1) {
      const nextIdx = Number(parts[i + 1]);
      if (!Number.isFinite(nextIdx) || nextIdx === 0) continue;

      const a = idx > 0 ? idx - 1 : state.vertices.length + idx;
      const b = nextIdx > 0 ? nextIdx - 1 : state.vertices.length + nextIdx;

      // Validate bounds
      if (a < 0 || a >= state.vertices.length || b < 0 || b >= state.vertices.length) continue;
      if (a === b) continue;

      // Store as [lo, hi] for consistent deduplication
      state.rawEdges.push(a < b ? [a, b] : [b, a]);
    }
  }
}
