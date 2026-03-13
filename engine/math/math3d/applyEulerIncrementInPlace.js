export function applyEulerIncrementInPlace(R, ax, ay, az) {
  if (R?.length !== 9) return R;
  if ((ax === 0 || !Number.isFinite(ax)) && (ay === 0 || !Number.isFinite(ay)) && (az === 0 || !Number.isFinite(az))) {
    return R;
  }

  const cx = Math.cos(ax), sx = Math.sin(ax);
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const cz = Math.cos(az), sz = Math.sin(az);

  // M = Ry * Rx * Rz
  const m00 = cy * cz + sy * sx * sz;
  const m01 = -cy * sz + sy * sx * cz;
  const m02 = sy * cx;

  const m10 = cx * sz;
  const m11 = cx * cz;
  const m12 = -sx;

  const m20 = -sy * cz + cy * sx * sz;
  const m21 = sy * sz + cy * sx * cz;
  const m22 = cy * cx;

  const r00 = R[0], r01 = R[1], r02 = R[2];
  const r10 = R[3], r11 = R[4], r12 = R[5];
  const r20 = R[6], r21 = R[7], r22 = R[8];

  R[0] = m00 * r00 + m01 * r10 + m02 * r20;
  R[1] = m00 * r01 + m01 * r11 + m02 * r21;
  R[2] = m00 * r02 + m01 * r12 + m02 * r22;

  R[3] = m10 * r00 + m11 * r10 + m12 * r20;
  R[4] = m10 * r01 + m11 * r11 + m12 * r21;
  R[5] = m10 * r02 + m11 * r12 + m12 * r22;

  R[6] = m20 * r00 + m21 * r10 + m22 * r20;
  R[7] = m20 * r01 + m21 * r11 + m22 * r21;
  R[8] = m20 * r02 + m21 * r12 + m22 * r22;

  return R;
}
