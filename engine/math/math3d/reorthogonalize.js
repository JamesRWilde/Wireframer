export function reorthogonalize(R) {
  if (!R || !Array.isArray(R) || R.length < 6) {
    // Return identity 3x3 if input is invalid
    return [1,0,0,0,1,0,0,0,1];
  }
  let x = [R[0],R[1],R[2]], y = [R[3],R[4],R[5]];
  const nx = Math.hypot(...x);  x = x.map(v => v / nx);
  const d  = x[0]*y[0] + x[1]*y[1] + x[2]*y[2];
  y = y.map((v, i) => v - d * x[i]);
  const ny = Math.hypot(...y);  y = y.map(v => v / ny);
  const z  = [x[1]*y[2]-x[2]*y[1], x[2]*y[0]-x[0]*y[2], x[0]*y[1]-x[1]*y[0]];
  return [...x, ...y, ...z];
}
