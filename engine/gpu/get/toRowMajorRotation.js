const IDENTITY3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function toRowMajorRotation(m) {
  return Array.isArray(m) && m.length === 9 ? m : IDENTITY3;
}
