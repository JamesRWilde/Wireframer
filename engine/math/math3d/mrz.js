export function mrz(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c,-s,0, s,c,0, 0,0,1];
}
