'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   3-D matrix math  —  3×3 matrices stored as flat 9-element row-major arrays
   [r00, r01, r02,
    r10, r11, r12,
    r20, r21, r22]
───────────────────────────────────────────────────────────────────────── */

/** Multiply two 3×3 matrices: C = A · B */
function mmul(A, B) {
  return [
    A[0]*B[0]+A[1]*B[3]+A[2]*B[6], A[0]*B[1]+A[1]*B[4]+A[2]*B[7], A[0]*B[2]+A[1]*B[5]+A[2]*B[8],
    A[3]*B[0]+A[4]*B[3]+A[5]*B[6], A[3]*B[1]+A[4]*B[4]+A[5]*B[7], A[3]*B[2]+A[4]*B[5]+A[5]*B[8],
    A[6]*B[0]+A[7]*B[3]+A[8]*B[6], A[6]*B[1]+A[7]*B[4]+A[8]*B[7], A[6]*B[2]+A[7]*B[5]+A[8]*B[8],
  ];
}

/** Apply 3×3 matrix M to column vector p → [x,y,z] */
function mvec(M, p) {
  return [
    M[0]*p[0]+M[1]*p[1]+M[2]*p[2],
    M[3]*p[0]+M[4]*p[1]+M[5]*p[2],
    M[6]*p[0]+M[7]*p[1]+M[8]*p[2],
  ];
}

/** Rotation matrices about each world axis */
function mrx(a) { const c=Math.cos(a), s=Math.sin(a); return [1,0,0, 0,c,-s, 0,s,c]; }
function mry(a) { const c=Math.cos(a), s=Math.sin(a); return [c,0,s, 0,1,0,-s,0,c]; }
function mrz(a) { const c=Math.cos(a), s=Math.sin(a); return [c,-s,0, s,c,0, 0,0,1]; }

/**
 * Gram-Schmidt re-orthogonalisation.
 * Call every ~120 frames to correct floating-point drift that accumulates
 * from repeated small-angle matrix multiplications.
 */
function reorthogonalize(R) {
  let x = [R[0],R[1],R[2]], y = [R[3],R[4],R[5]];
  const nx = Math.hypot(...x);  x = x.map(v => v / nx);
  const d  = x[0]*y[0] + x[1]*y[1] + x[2]*y[2];
  y = y.map((v, i) => v - d * x[i]);
  const ny = Math.hypot(...y);  y = y.map(v => v / ny);
  const z  = [x[1]*y[2]-x[2]*y[1], x[2]*y[0]-x[0]*y[2], x[0]*y[1]-x[1]*y[0]];
  return [...x, ...y, ...z];
}
