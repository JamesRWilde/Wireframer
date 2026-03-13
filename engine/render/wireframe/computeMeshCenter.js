export function computeMeshCenter(T) {
  const center = [0, 0, 0];
  for (const v of T) {
    center[0] += v[0];
    center[1] += v[1];
    center[2] += v[2];
  }
  const inv = 1 / T.length;
  center[0] *= inv;
  center[1] *= inv;
  center[2] *= inv;
  return center;
}
