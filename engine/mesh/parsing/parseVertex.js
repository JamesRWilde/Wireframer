// Extracted from toRuntimeMesh; handles a "v" line
export function parseVertex(parts, state) {
  if (parts.length < 4) {
    state.failingLines.push(`[${state.lineNumber}] Invalid vertex (too few fields): '${parts.join(' ')}`);
    return;
  }
  const vx = Number(parts[1]);
  const vy = Number(parts[2]);
  const vz = Number(parts[3]);
  if (!Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(vz)) {
    state.failingLines.push(`[${state.lineNumber}] Invalid vertex (non-numeric): '${parts.join(' ')}`);
    return;
  }
  state.vertices.push([vx, vy, vz]);
}