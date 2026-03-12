// Handles a "vn" line from OBJ
export function parseNormal(parts, state) {
  if (parts.length < 4) return;
  const nx = Number(parts[1]);
  const ny = Number(parts[2]);
  const nz = Number(parts[3]);
  if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nz)) return;
  state.normals.push([nx, ny, nz]);
}