// Parses a face line into triangles and updates state accordingly
// Delegates parsing helpers to separate modules for better modularity.

import { idxFromToken } from './idxFromToken.js';
import { getOrCreateVertIdx } from './getOrCreateVertIdx.js';

export function parseFace(parts, originalLine, state) {
  const rawTokens = parts.slice(1);
  if (rawTokens.length < 3) {
    state.failingLines.push(`[${state.lineNumber}] Malformed face (too few indices): '${originalLine}'`);
    return;
  }
  const faceVerts = rawTokens.map(tok => idxFromToken(tok, state));
  const outOfBounds = faceVerts.filter(i => i.v < 0 || i.v >= state.vertices.length);
  if (outOfBounds.length) {
    state.failingLines.push(`[${state.lineNumber}] Out-of-bounds face indices: '${originalLine}' | Invalid indices: ${outOfBounds.map(x=>x.v).join(', ')}`);
    return;
  }
  for (let i = 1; i < faceVerts.length - 1; i++) {
    const tri = [
      getOrCreateVertIdx(faceVerts[0].v, faceVerts[0].vt, faceVerts[0].vn, state),
      getOrCreateVertIdx(faceVerts[i].v, faceVerts[i].vt, faceVerts[i].vn, state),
      getOrCreateVertIdx(faceVerts[i+1].v, faceVerts[i+1].vt, faceVerts[i+1].vn, state)
    ];
    if ((new Set(tri)).size === 3) {
      state.faces.push({indices: tri, group: state.currentGroup, object: state.currentObject, smoothing: state.currentSmoothing});
    }
  }
}

