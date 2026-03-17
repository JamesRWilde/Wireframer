export function getRenderEngineWorkerTransformSync(V, Rmat, fov, halfW, halfH, modelCy, vertexCount) {
  const r00 = Rmat[0], r01 = Rmat[1], r02 = Rmat[2];
  const r10 = Rmat[3], r11 = Rmat[4], r12 = Rmat[5];
  const r20 = Rmat[6], r21 = Rmat[7], r22 = Rmat[8];

  const T = new Array(vertexCount);
  const P2 = new Array(vertexCount);

  for (let i = 0; i < vertexCount; i++) {
    const vx = V[i][0], vy = V[i][1], vz = V[i][2];
    const tx = r00 * vx + r01 * vy + r02 * vz;
    const ty = r10 * vx + r11 * vy + r12 * vz;
    const tz = r20 * vx + r21 * vy + r22 * vz;
    T[i] = [tx, ty, tz];
    const d = tz + 3;
    P2[i] = [halfW + tx * fov / d, halfH - (ty - modelCy) * fov / d];
  }
  return { T, P2 };
}
