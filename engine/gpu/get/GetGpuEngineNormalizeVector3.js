export function GetGpuEngineNormalizeVector3(out, v, fallback) {
  const x = Number(v?.[0]);
  const y = Number(v?.[1]);
  const z = Number(v?.[2]);
  const l = Math.hypot(x, y, z);
  if (!Number.isFinite(l) || l < 1e-6) {
    out[0] = fallback[0]; out[1] = fallback[1]; out[2] = fallback[2];
    return out;
  }
  out[0] = x / l; out[1] = y / l; out[2] = z / l;
  return out;
}
