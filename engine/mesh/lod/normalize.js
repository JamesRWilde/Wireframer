export function normalize(v) {
  const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]) || 1;
  return [v[0]/len, v[1]/len, v[2]/len];
}
