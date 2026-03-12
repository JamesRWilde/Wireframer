// Handles a "vt" line from OBJ
export function parseUv(parts, state) {
  if (parts.length < 3) return;
  const u = Number(parts[1]);
  const v = Number(parts[2]);
  if (!Number.isFinite(u) || !Number.isFinite(v)) return;
  state.uvs.push([u, v]);
}