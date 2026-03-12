export function mrx(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [1,0,0, 0,c,-s, 0,s,c];
}
