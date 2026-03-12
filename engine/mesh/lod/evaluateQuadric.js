export function evaluateQuadric(q, p) {
  const [x, y, z] = p;
  const [a, b, c, d, e, f, g, h, i, j] = q;
  return a*x*x + 2*b*x*y + 2*c*x*z + 2*d*x + e*y*y + 2*f*y*z + 2*g*y + h*z*z + 2*i*z + j;
}
