export function mvec(M, p) {
  return [
    M[0]*p[0]+M[1]*p[1]+M[2]*p[2],
    M[3]*p[0]+M[4]*p[1]+M[5]*p[2],
    M[6]*p[0]+M[7]*p[1]+M[8]*p[2],
  ];
}
