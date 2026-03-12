export function mry(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c,0,s, 0,1,0,-s,0,c];
}
