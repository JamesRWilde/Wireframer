import { parseIndex } from './parseIndex.js';

// Given a single OBJ face token ("v", "v/vt", "v//vn", "v/vt/vn"),
// return object with zero-based indices or -1 for invalid vertex index.
export function idxFromToken(token, state) {
  const fields = token.split('/');
  const vIdx = parseIndex(fields[0], state.vertices.length);
  if (vIdx === null) return {v:-1, vt:null, vn:null};
  const vtIdx = parseIndex(fields[1], state.uvs.length);
  const vnIdx = parseIndex(fields[2], state.normals.length);
  return {v:vIdx, vt:vtIdx, vn:vnIdx};
}