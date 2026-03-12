// Vertex caching: given indices, either returns existing unique vert index or
// creates a new entry in uniqueVerts and vertMap on the state object.
export function getOrCreateVertIdx(v, vt, vn, state) {
  const key = `${v}/${vt ?? ''}/${vn ?? ''}`;
  if (state.vertMap.has(key)) return state.vertMap.get(key);
  const pos = state.vertices[v] || [0,0,0];
  const uv = (vt !== null && state.uvs[vt]) ? state.uvs[vt] : [0,0];
  const norm = (vn !== null && state.normals[vn]) ? state.normals[vn] : [0,0,0];
  const fullVert = [pos[0], pos[1], pos[2], uv[0], uv[1], norm[0], norm[1], norm[2]];
  const idx = state.uniqueVerts.length;
  state.uniqueVerts.push(fullVert);
  state.vertMap.set(key, idx);
  return idx;
}