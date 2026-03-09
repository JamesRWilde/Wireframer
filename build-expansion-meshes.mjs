import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const meshDir = path.join(__dirname, 'meshes');

class MeshBuilder {
  constructor() {
    this.positions = [];
    this.faces = [];
  }

  addVertex(x, y, z) {
    this.positions.push([Number(x), Number(y), Number(z)]);
    return this.positions.length - 1;
  }

  addFace(indices) {
    if (!Array.isArray(indices) || indices.length < 3) return;
    this.faces.push(indices.map((n) => Math.max(0, Math.floor(n))));
  }

  addQuad(a, b, c, d) {
    this.addFace([a, b, c, d]);
  }

  addTri(a, b, c) {
    this.addFace([a, b, c]);
  }

  merge(other) {
    const offset = this.positions.length;
    for (const p of other.positions) this.positions.push(p);
    for (const f of other.faces) this.faces.push(f.map((i) => i + offset));
  }
}

function clampInt(v, lo, hi) {
  return Math.max(lo, Math.min(hi, Math.floor(v)));
}

function addUvSphere(builder, { cx, cy, cz, rx, ry, rz, lat, lon }) {
  const latSteps = clampInt(lat, 6, 40);
  const lonSteps = clampInt(lon, 8, 64);
  const rings = [];

  for (let i = 0; i <= latSteps; i++) {
    const v = i / latSteps;
    const t = v * Math.PI;
    const st = Math.sin(t);
    const ct = Math.cos(t);
    const ring = [];

    for (let j = 0; j < lonSteps; j++) {
      const u = (j / lonSteps) * Math.PI * 2;
      const su = Math.sin(u);
      const cu = Math.cos(u);
      ring.push(builder.addVertex(cx + rx * st * cu, cy + ry * ct, cz + rz * st * su));
    }

    rings.push(ring);
  }

  for (let i = 0; i < latSteps; i++) {
    const a = rings[i];
    const b = rings[i + 1];
    for (let j = 0; j < lonSteps; j++) {
      const n = (j + 1) % lonSteps;
      if (i === 0) {
        builder.addTri(a[j], b[j], b[n]);
      } else if (i === latSteps - 1) {
        builder.addTri(a[j], a[n], b[j]);
      } else {
        builder.addQuad(a[j], a[n], b[n], b[j]);
      }
    }
  }
}

function addCylinder(builder, { ax, ay, az, bx, by, bz, radius, segments, capA = true, capB = true }) {
  const seg = clampInt(segments, 6, 48);
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const len = Math.hypot(dx, dy, dz) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const uz = dz / len;

  let px = 0;
  let py = 1;
  let pz = 0;
  if (Math.abs(uy) > 0.85) {
    px = 1;
    py = 0;
    pz = 0;
  }

  let vx = uy * pz - uz * py;
  let vy = uz * px - ux * pz;
  let vz = ux * py - uy * px;
  const vLen = Math.hypot(vx, vy, vz) || 1;
  vx /= vLen;
  vy /= vLen;
  vz /= vLen;

  let wx = uy * vz - uz * vy;
  let wy = uz * vx - ux * vz;
  let wz = ux * vy - uy * vx;

  const ringA = [];
  const ringB = [];

  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const ox = (vx * ca + wx * sa) * radius;
    const oy = (vy * ca + wy * sa) * radius;
    const oz = (vz * ca + wz * sa) * radius;
    ringA.push(builder.addVertex(ax + ox, ay + oy, az + oz));
    ringB.push(builder.addVertex(bx + ox, by + oy, bz + oz));
  }

  for (let i = 0; i < seg; i++) {
    const n = (i + 1) % seg;
    builder.addQuad(ringA[i], ringA[n], ringB[n], ringB[i]);
  }

  if (capA) {
    const c = builder.addVertex(ax, ay, az);
    for (let i = 0; i < seg; i++) {
      const n = (i + 1) % seg;
      builder.addTri(c, ringA[n], ringA[i]);
    }
  }

  if (capB) {
    const c = builder.addVertex(bx, by, bz);
    for (let i = 0; i < seg; i++) {
      const n = (i + 1) % seg;
      builder.addTri(c, ringB[i], ringB[n]);
    }
  }
}

function addCone(builder, { ax, ay, az, bx, by, bz, radius, segments, cap = true }) {
  const seg = clampInt(segments, 6, 48);
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const len = Math.hypot(dx, dy, dz) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const uz = dz / len;

  let px = 0;
  let py = 1;
  let pz = 0;
  if (Math.abs(uy) > 0.85) {
    px = 1;
    py = 0;
    pz = 0;
  }

  let vx = uy * pz - uz * py;
  let vy = uz * px - ux * pz;
  let vz = ux * py - uy * px;
  const vLen = Math.hypot(vx, vy, vz) || 1;
  vx /= vLen;
  vy /= vLen;
  vz /= vLen;

  let wx = uy * vz - uz * vy;
  let wy = uz * vx - ux * vz;
  let wz = ux * vy - uy * vx;

  const ring = [];
  const tip = builder.addVertex(bx, by, bz);

  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const ox = (vx * ca + wx * sa) * radius;
    const oy = (vy * ca + wy * sa) * radius;
    const oz = (vz * ca + wz * sa) * radius;
    ring.push(builder.addVertex(ax + ox, ay + oy, az + oz));
  }

  for (let i = 0; i < seg; i++) {
    const n = (i + 1) % seg;
    builder.addTri(ring[i], ring[n], tip);
  }

  if (cap) {
    const c = builder.addVertex(ax, ay, az);
    for (let i = 0; i < seg; i++) {
      const n = (i + 1) % seg;
      builder.addTri(c, ring[n], ring[i]);
    }
  }
}

function addBox(builder, { cx, cy, cz, sx, sy, sz }) {
  const x0 = cx - sx / 2;
  const x1 = cx + sx / 2;
  const y0 = cy - sy / 2;
  const y1 = cy + sy / 2;
  const z0 = cz - sz / 2;
  const z1 = cz + sz / 2;

  const v = [
    builder.addVertex(x0, y0, z0),
    builder.addVertex(x1, y0, z0),
    builder.addVertex(x1, y1, z0),
    builder.addVertex(x0, y1, z0),
    builder.addVertex(x0, y0, z1),
    builder.addVertex(x1, y0, z1),
    builder.addVertex(x1, y1, z1),
    builder.addVertex(x0, y1, z1),
  ];

  builder.addQuad(v[0], v[1], v[2], v[3]);
  builder.addQuad(v[4], v[7], v[6], v[5]);
  builder.addQuad(v[0], v[4], v[5], v[1]);
  builder.addQuad(v[3], v[2], v[6], v[7]);
  builder.addQuad(v[1], v[5], v[6], v[2]);
  builder.addQuad(v[0], v[3], v[7], v[4]);
}

function buildCar(detail) {
  const b = new MeshBuilder();
  const segWheel = clampInt(12 + detail * 10, 10, 32);
  const sideSlices = clampInt(8 + detail * 8, 8, 24);

  const xMin = -1.22;
  const xMax = 1.22;
  const rings = [];

  for (let i = 0; i <= sideSlices; i++) {
    const t = i / sideSlices;
    const x = xMin + (xMax - xMin) * t;

    const nose = Math.exp(-Math.pow((t - 0.08) / 0.13, 2));
    const cabin = Math.exp(-Math.pow((t - 0.55) / 0.2, 2));
    const trunk = Math.exp(-Math.pow((t - 0.87) / 0.15, 2));

    const halfW = 0.56 - 0.08 * nose - 0.07 * trunk;
    const baseY = -0.17;
    const shoulderY = 0.12 + 0.04 * cabin - 0.03 * nose;
    const roofY = 0.26 + 0.22 * cabin - 0.03 * nose - 0.04 * trunk;

    const z = halfW;
    const ring = [
      b.addVertex(x, roofY, 0),
      b.addVertex(x, roofY - 0.02, z * 0.55),
      b.addVertex(x, shoulderY, z),
      b.addVertex(x, baseY, z * 0.92),
      b.addVertex(x, baseY, z * 0.45),
      b.addVertex(x, baseY, -z * 0.45),
      b.addVertex(x, baseY, -z * 0.92),
      b.addVertex(x, shoulderY, -z),
      b.addVertex(x, roofY - 0.02, -z * 0.55),
    ];

    rings.push(ring);
  }

  for (let i = 0; i < rings.length - 1; i++) {
    const a = rings[i];
    const c = rings[i + 1];
    for (let j = 0; j < a.length; j++) {
      const n = (j + 1) % a.length;
      b.addQuad(a[j], a[n], c[n], c[j]);
    }
  }

  b.addFace([...rings[0]]);
  b.addFace([...rings[rings.length - 1]].reverse());

  addBox(b, { cx: 0.08, cy: 0.24, cz: 0, sx: 0.62, sy: 0.16, sz: 0.76 });

  const wheelX = [-0.72, 0.74];
  const wheelZ = [-0.56, 0.56];
  for (const x of wheelX) {
    for (const z of wheelZ) {
      addCylinder(b, {
        ax: x,
        ay: -0.29,
        az: z - 0.08,
        bx: x,
        by: -0.29,
        bz: z + 0.08,
        radius: 0.2,
        segments: segWheel,
      });
    }
  }

  return b;
}

function buildDog(detail) {
  const b = new MeshBuilder();
  const sphereLat = clampInt(8 + detail * 6, 8, 22);
  const sphereLon = clampInt(12 + detail * 8, 10, 30);
  const cylSeg = clampInt(9 + detail * 7, 8, 26);

  addUvSphere(b, { cx: 0, cy: 0.02, cz: 0, rx: 0.66, ry: 0.32, rz: 0.28, lat: sphereLat, lon: sphereLon });
  addUvSphere(b, { cx: 0.7, cy: 0.16, cz: 0, rx: 0.28, ry: 0.24, rz: 0.21, lat: sphereLat - 1, lon: sphereLon - 2 });
  addCylinder(b, { ax: 0.9, ay: 0.1, az: 0, bx: 1.18, by: 0.07, bz: 0, radius: 0.1, segments: cylSeg });

  addCone(b, { ax: 0.63, ay: 0.35, az: 0.12, bx: 0.76, by: 0.54, bz: 0.19, radius: 0.08, segments: cylSeg - 2 });
  addCone(b, { ax: 0.63, ay: 0.35, az: -0.12, bx: 0.76, by: 0.54, bz: -0.19, radius: 0.08, segments: cylSeg - 2 });

  const legX = [-0.42, -0.08, 0.3, 0.56];
  const legZ = [-0.16, 0.16];
  for (const x of legX) {
    for (const z of legZ) {
      addCylinder(b, {
        ax: x,
        ay: -0.02,
        az: z,
        bx: x + 0.02,
        by: -0.56,
        bz: z,
        radius: x > 0.2 ? 0.065 : 0.075,
        segments: cylSeg,
      });
    }
  }

  addCylinder(b, {
    ax: -0.7,
    ay: 0.18,
    az: 0,
    bx: -1.08,
    by: 0.42,
    bz: 0,
    radius: 0.05,
    segments: cylSeg,
    capB: false,
  });

  return b;
}

function buildCat(detail) {
  const b = new MeshBuilder();
  const sphereLat = clampInt(8 + detail * 6, 8, 22);
  const sphereLon = clampInt(12 + detail * 8, 10, 30);
  const cylSeg = clampInt(10 + detail * 8, 8, 28);

  addUvSphere(b, { cx: 0, cy: 0.05, cz: 0, rx: 0.58, ry: 0.27, rz: 0.24, lat: sphereLat, lon: sphereLon });
  addUvSphere(b, { cx: 0.64, cy: 0.2, cz: 0, rx: 0.24, ry: 0.21, rz: 0.2, lat: sphereLat - 1, lon: sphereLon - 2 });

  addCone(b, { ax: 0.57, ay: 0.34, az: 0.11, bx: 0.68, by: 0.58, bz: 0.19, radius: 0.075, segments: cylSeg - 2 });
  addCone(b, { ax: 0.57, ay: 0.34, az: -0.11, bx: 0.68, by: 0.58, bz: -0.19, radius: 0.075, segments: cylSeg - 2 });

  const legX = [-0.34, -0.02, 0.24, 0.48];
  const legZ = [-0.13, 0.13];
  for (const x of legX) {
    for (const z of legZ) {
      addCylinder(b, {
        ax: x,
        ay: -0.02,
        az: z,
        bx: x + 0.02,
        by: -0.56,
        bz: z,
        radius: 0.052,
        segments: cylSeg,
      });
    }
  }

  const tailPoints = [
    [-0.6, 0.18, 0],
    [-0.84, 0.3, 0.04],
    [-1.04, 0.46, 0.1],
    [-1.16, 0.66, 0.08],
  ];
  for (let i = 0; i < tailPoints.length - 1; i++) {
    const a = tailPoints[i];
    const c = tailPoints[i + 1];
    addCylinder(b, {
      ax: a[0], ay: a[1], az: a[2],
      bx: c[0], by: c[1], bz: c[2],
      radius: 0.04 - i * 0.008,
      segments: cylSeg,
      capA: i === 0,
      capB: i === tailPoints.length - 2,
    });
  }

  return b;
}

function buildTree(detail) {
  const b = new MeshBuilder();
  const seg = clampInt(10 + detail * 8, 8, 28);

  addCylinder(b, { ax: 0, ay: -0.72, az: 0, bx: 0, by: 0.08, bz: 0, radius: 0.16, segments: seg });

  addCone(b, { ax: 0, ay: -0.04, az: 0, bx: 0, by: 0.62, bz: 0, radius: 0.62, segments: seg + 4, cap: false });
  addCone(b, { ax: 0, ay: 0.26, az: 0, bx: 0, by: 0.92, bz: 0, radius: 0.46, segments: seg + 2, cap: false });
  addCone(b, { ax: 0, ay: 0.5, az: 0, bx: 0, by: 1.16, bz: 0, radius: 0.3, segments: seg, cap: false });

  return b;
}

function buildAcorn(detail) {
  const b = new MeshBuilder();
  const lat = clampInt(10 + detail * 7, 8, 26);
  const lon = clampInt(14 + detail * 10, 10, 36);

  addUvSphere(b, { cx: 0, cy: -0.08, cz: 0, rx: 0.38, ry: 0.52, rz: 0.38, lat, lon });
  addUvSphere(b, { cx: 0, cy: 0.28, cz: 0, rx: 0.41, ry: 0.22, rz: 0.41, lat: lat - 2, lon: lon - 2 });
  addCylinder(b, { ax: 0, ay: 0.5, az: 0, bx: 0.03, by: 0.73, bz: -0.02, radius: 0.04, segments: clampInt(8 + detail * 5, 8, 22) });

  return b;
}

function buildPinecone(detail) {
  const b = new MeshBuilder();
  const lat = clampInt(8 + detail * 6, 8, 22);
  const lon = clampInt(10 + detail * 7, 10, 28);

  addUvSphere(b, { cx: 0, cy: 0, cz: 0, rx: 0.3, ry: 0.55, rz: 0.3, lat, lon });

  const rows = clampInt(5 + detail * 4, 5, 12);
  const petals = clampInt(8 + detail * 6, 8, 22);
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const y = -0.4 + t * 0.8;
    const ringR = 0.24 * Math.sin((t * Math.PI) * 0.96) + 0.05;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2 + r * 0.34;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const cx = ca * ringR;
      const cz = sa * ringR;
      const tipX = cx + ca * 0.14;
      const tipY = y + 0.03;
      const tipZ = cz + sa * 0.14;
      addCone(b, {
        ax: cx,
        ay: y,
        az: cz,
        bx: tipX,
        by: tipY,
        bz: tipZ,
        radius: 0.06,
        segments: clampInt(6 + detail * 3, 6, 14),
      });
    }
  }

  addCylinder(b, { ax: 0, ay: 0.52, az: 0, bx: 0, by: 0.72, bz: 0, radius: 0.035, segments: clampInt(8 + detail * 4, 8, 20) });

  return b;
}

function writeMesh(name, file, buildFn, shadingMode = 'smooth') {
  const low = buildFn(0.7);
  const medium = buildFn(1.0);
  const high = buildFn(1.35);

  const payload = {
    format: 'indexed-polygons-v1',
    name,
    shadingMode,
    lods: [
      { key: 'low', detail: 0.7, positions: low.positions, faces: low.faces },
      { key: 'medium', detail: 1.0, positions: medium.positions, faces: medium.faces },
      { key: 'high', detail: 1.35, positions: high.positions, faces: high.faces },
    ],
  };

  return fs.writeFile(path.join(meshDir, file), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function main() {
  await writeMesh('Car', 'car.mesh.json', buildCar, 'smooth');
  await writeMesh('Dog', 'dog.mesh.json', buildDog, 'smooth');
  await writeMesh('Cat', 'cat.mesh.json', buildCat, 'smooth');
  await writeMesh('Tree', 'tree.mesh.json', buildTree, 'smooth');
  await writeMesh('Acorn', 'acorn.mesh.json', buildAcorn, 'smooth');
  await writeMesh('Pinecone', 'pinecone.mesh.json', buildPinecone, 'smooth');
  console.log('Generated upgraded expansion meshes (dog/cat/car/tree/acorn/pinecone).');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
