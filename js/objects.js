'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   Shared geometry utilities
   Objects only define their geometry (vertices + edges).
   All rotation, projection and rendering live in app.js.
───────────────────────────────────────────────────────────────────────── */

/**
 * Revolve a 2-D profile around the Y axis to produce a surface of revolution.
 * @param {Array<[number,number]>} profile  Array of [radius, y] pairs.
 * @param {number} segs  Number of angular divisions.
 * @returns {{ V: number[][], E: number[][] }}
 */
function buildRevolution(profile, segs) {
  const V = [], E = [];

  for (let i = 0; i < profile.length; i++) {
    const [r, y] = profile[i];
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      V.push([r * Math.cos(a), y, r * Math.sin(a)]);
    }
  }

  for (let i = 0; i < profile.length; i++) {
    const r = profile[i][0];
    for (let j = 0; j < segs; j++) {
      const cur = i * segs + j;
      if (r > 0.01) E.push([cur, i * segs + (j + 1) % segs]); // ring
      if (i < profile.length - 1) E.push([cur, (i + 1) * segs + j]); // profile
    }
  }
  return { V, E };
}

/**
 * Build a tube mesh along a closed parametric curve.
 * @param {function(t:number):[number,number,number]} curveFn  t ∈ [0, 2π)
 * @param {number} segs    Sample count along the curve.
 * @param {number} sides   Cross-section polygon sides.
 * @param {number} tubeR   Tube radius.
 * @returns {{ V: number[][], E: number[][] }}
 */
function buildTube(curveFn, segs, sides, tubeR) {
  const V = [], E = [], TAU = Math.PI * 2;
  const EPS = TAU / segs * 0.01;

  for (let i = 0; i < segs; i++) {
    const t = (i / segs) * TAU;
    const [cx, cy, cz] = curveFn(t);

    // Numerical tangent
    const [x1, y1, z1] = curveFn(t + EPS);
    let tx = x1-cx, ty = y1-cy, tz = z1-cz;
    const tl = Math.sqrt(tx*tx + ty*ty + tz*tz);
    tx /= tl; ty /= tl; tz /= tl;

    // Normal: T × reference-up (swap reference when near-parallel)
    const up = Math.abs(ty) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let nx = ty*up[2]-tz*up[1], ny = tz*up[0]-tx*up[2], nz = tx*up[1]-ty*up[0];
    const nl = Math.sqrt(nx*nx + ny*ny + nz*nz);
    nx /= nl; ny /= nl; nz /= nl;

    // Binormal: T × N
    const bx = ty*nz-tz*ny, by = tz*nx-tx*nz, bz = tx*ny-ty*nx;

    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * TAU;
      const c = Math.cos(a) * tubeR, s = Math.sin(a) * tubeR;
      V.push([cx + c*nx + s*bx, cy + c*ny + s*by, cz + c*nz + s*bz]);
    }
  }

  for (let i = 0; i < segs; i++) {
    for (let k = 0; k < sides; k++) {
      const cur = i * sides + k;
      E.push([cur, i * sides + (k + 1) % sides]);        // ring
      E.push([cur, ((i + 1) % segs) * sides + k]);       // along tube
    }
  }
  return { V, E };
}

/* ─────────────────────────────────────────────────────────────────────────
   Object builders  —  each returns { V, E }
   All coordinates are normalised to fit within roughly unit radius.
───────────────────────────────────────────────────────────────────────── */

function buildWineGlass() {
  return buildRevolution([
    [0.00,-1.00],[0.48,-1.00],[0.48,-0.87],[0.09,-0.77],
    [0.06,-0.14],[0.06, 0.06],[0.13, 0.22],[0.29, 0.48],
    [0.44, 0.72],[0.52, 0.93],[0.47, 1.08],[0.39, 1.20],[0.37, 1.26],
  ], 24);
}

function buildTorus() {
  const R = 0.70, r = 0.28, maj = 28, min = 16;
  const V = [], E = [];
  for (let i = 0; i < maj; i++) {
    const u = (i / maj) * Math.PI * 2;
    for (let j = 0; j < min; j++) {
      const v = (j / min) * Math.PI * 2;
      V.push([(R + r*Math.cos(v)) * Math.cos(u), r*Math.sin(v), (R + r*Math.cos(v)) * Math.sin(u)]);
      const cur = i * min + j;
      E.push([cur, i * min + (j + 1) % min]);
      E.push([cur, ((i + 1) % maj) * min + j]);
    }
  }
  return { V, E };
}

function buildSphere() {
  const stacks = 12, profile = [];
  for (let i = 0; i <= stacks; i++) {
    const phi = (i / stacks) * Math.PI;
    profile.push([0.95 * Math.sin(phi), 0.95 * Math.cos(phi)]);
  }
  return buildRevolution(profile, 24);
}

function buildCube() {
  const s = 0.82;
  return {
    V: [[-s,-s,-s],[-s,-s,s],[-s,s,-s],[-s,s,s],[s,-s,-s],[s,-s,s],[s,s,-s],[s,s,s]],
    E: [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],
  };
}

function buildIcosahedron() {
  const t = (1 + Math.sqrt(5)) / 2;
  const s = 0.90 / Math.sqrt(1 + t * t);
  const V = [
    [0,s,t*s],[0,-s,t*s],[0,s,-t*s],[0,-s,-t*s],
    [s,t*s,0],[-s,t*s,0],[s,-t*s,0],[-s,-t*s,0],
    [t*s,0,s],[t*s,0,-s],[-t*s,0,s],[-t*s,0,-s],
  ];
  const el2 = 4 * s * s; // expected squared edge length
  const E = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++) {
      const dx=V[i][0]-V[j][0], dy=V[i][1]-V[j][1], dz=V[i][2]-V[j][2];
      if (Math.abs(dx*dx + dy*dy + dz*dz - el2) < 0.01) E.push([i, j]);
    }
  return { V, E };
}

function buildDiamond() {
  const n = 8;
  const V = [[0, 1.10, 0]]; // apex

  const addRing = (r, y, offset = 0) => {
    for (let j = 0; j < n; j++) {
      const a = ((j + offset) / n) * Math.PI * 2;
      V.push([r * Math.cos(a), y, r * Math.sin(a)]);
    }
  };
  addRing(0.42, 0.55);       // crown  — indices 1..n
  addRing(0.85, 0.00, 0.5);  // girdle — indices n+1..2n  (half-step offset for facets)
  addRing(0.45,-0.58);       // pavilion — indices 2n+1..3n
  V.push([0, -1.10, 0]);     // culet

  const E = [];
  const AP = 0, CR = 1, GI = n+1, PA = 2*n+1, CU = 3*n+1;

  for (let j = 0; j < n; j++) {
    E.push([AP, CR+j]);                           // apex → crown
    E.push([CR+j, CR+(j+1)%n]);                   // crown ring
    E.push([CR+j, GI+j]);                         // crown → girdle (two per crown vertex)
    E.push([CR+j, GI+(j+n-1)%n]);
    E.push([GI+j, GI+(j+1)%n]);                   // girdle ring
    E.push([GI+j, PA+j]);                         // girdle → pavilion (two per girdle)
    E.push([GI+j, PA+(j+1)%n]);
    E.push([PA+j, PA+(j+1)%n]);                   // pavilion ring
    E.push([PA+j, CU]);                           // pavilion → culet
  }
  return { V, E };
}

function buildTorusKnot() {
  // (2, 3) torus knot — closes after t ∈ [0, 2π]
  const R = 0.68, r = 0.26, p = 2, q = 3;
  return buildTube(t => {
    const phi = q * t;
    return [
      (R + r*Math.cos(phi)) * Math.cos(p*t),
      r * Math.sin(phi),
      (R + r*Math.cos(phi)) * Math.sin(p*t),
    ];
  }, 80, 5, 0.11);
}

function buildHyperboloid() {
  // Single-sheet hyperboloid: waist at y=0 expands toward ±y
  const stacks = 16, profile = [];
  for (let i = 0; i <= stacks; i++) {
    const t = (i / stacks) * 2 - 1;              // t ∈ [-1, 1]
    const y = t * 1.10;
    const r = Math.sqrt(0.30 + 0.70 * t * t);    // waist r≈0.55, ends r≈1.0
    profile.push([r, y]);
  }
  return buildRevolution(profile, 24);
}

function buildSpring() {
  const turns = 5, segsPerTurn = 16, sides = 7, tubeR = 0.10;
  const R = 0.68, height = 1.80;
  const N = turns * segsPerTurn;
  const V = [], E = [];

  for (let i = 0; i < N; i++) {
    const t = i / N;
    const angle = t * turns * Math.PI * 2;
    const cx = R * Math.cos(angle);
    const cy = -height / 2 + t * height;
    const cz = R * Math.sin(angle);

    // Tangent
    const dt = 0.0001;
    const t2 = t + dt, angle2 = t2 * turns * Math.PI * 2;
    let tx = R*Math.cos(angle2)-cx, ty = height*dt, tz = R*Math.sin(angle2)-cz;
    const tl = Math.sqrt(tx*tx + ty*ty + tz*tz);
    tx /= tl; ty /= tl; tz /= tl;

    // Radially-outward normal projected perpendicular to tangent
    let nx = Math.cos(angle), ny = 0, nz = Math.sin(angle);
    const d = nx*tx + ny*ty + nz*tz;
    nx -= d*tx; ny -= d*ty; nz -= d*tz;
    const nl = Math.sqrt(nx*nx + ny*ny + nz*nz);
    nx /= nl; ny /= nl; nz /= nl;

    const bx = ty*nz-tz*ny, by = tz*nx-tx*nz, bz = tx*ny-ty*nx;

    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      const c = Math.cos(a)*tubeR, s = Math.sin(a)*tubeR;
      V.push([cx + c*nx + s*bx, cy + c*ny + s*by, cz + c*nz + s*bz]);
    }
  }

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < sides; k++) {
      const cur = i * sides + k;
      E.push([cur, i * sides + (k + 1) % sides]);     // ring
      if (i < N - 1) E.push([cur, (i + 1) * sides + k]); // along coil (open)
    }
  }
  return { V, E };
}

function buildDoubleHelix() {
  const turns = 3, N = 120, R = 0.55, height = 2.20;
  const V = [], E = [];

  for (let strand = 0; strand < 2; strand++) {
    const phase = strand * Math.PI;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const angle = t * turns * Math.PI * 2 + phase;
      V.push([R * Math.cos(angle), -height/2 + t*height, R * Math.sin(angle)]);
    }
  }

  // Strand edges
  for (let i = 0; i < N - 1; i++) E.push([i, i + 1]);
  for (let i = 0; i < N - 1; i++) E.push([N + i, N + i + 1]);

  // Rungs
  const rungs = turns * 8;
  for (let r = 0; r < rungs; r++) {
    const i = Math.round((r / rungs) * (N - 1));
    E.push([i, N + i]);
  }
  return { V, E };
}

function buildOctahedron() {
  const s = 1.0;
  const V = [[0,s,0],[0,-s,0],[s,0,0],[-s,0,0],[0,0,s],[0,0,-s]];
  const E = [
    [0,2],[0,3],[0,4],[0,5],
    [1,2],[1,3],[1,4],[1,5],
    [2,4],[4,3],[3,5],[5,2],
  ];
  return { V, E };
}

/* ─────────────────────────────────────────────────────────────────────────
   Object registry  —  add entries here to extend the selector
───────────────────────────────────────────────────────────────────────── */
const OBJECTS = [
  { name: 'Wine Glass',   build: buildWineGlass   },
  { name: 'Torus',        build: buildTorus       },
  { name: 'Sphere',       build: buildSphere      },
  { name: 'Cube',         build: buildCube        },
  { name: 'Icosahedron',  build: buildIcosahedron },
  { name: 'Diamond',      build: buildDiamond     },
  { name: 'Torus Knot',   build: buildTorusKnot   },
  { name: 'Hyperboloid',  build: buildHyperboloid },
  { name: 'Spring',       build: buildSpring      },
  { name: 'Double Helix', build: buildDoubleHelix },
  { name: 'Octahedron',   build: buildOctahedron  },
];
