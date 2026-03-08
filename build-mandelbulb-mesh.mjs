import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = __dirname;

const OUT_FILE = path.join(repoRoot, 'meshes', 'mandelbulb.mesh.json');

const POWER = 8;
const BAILOUT = 8;
const MAX_ITER = 14;
const R_MAX = 1.9;
const TARGET_RADIUS = 0.9;

function mandelbulbDistanceEstimator(x, y, z) {
  let zx = x;
  let zy = y;
  let zz = z;
  let dr = 1.0;
  let r = 0.0;

  for (let i = 0; i < MAX_ITER; i++) {
    r = Math.hypot(zx, zy, zz);
    if (r > BAILOUT) break;

    if (r < 1e-9) {
      // Keep stable near the origin.
      dr = 1.0;
      zx = x;
      zy = y;
      zz = z;
      continue;
    }

    const theta = Math.acos(Math.max(-1, Math.min(1, zz / r)));
    const phi = Math.atan2(zy, zx);

    const zr = Math.pow(r, POWER);
    dr = Math.pow(r, POWER - 1) * POWER * dr + 1.0;

    const thetaN = theta * POWER;
    const phiN = phi * POWER;
    const sinTheta = Math.sin(thetaN);

    zx = zr * sinTheta * Math.cos(phiN) + x;
    zy = zr * sinTheta * Math.sin(phiN) + y;
    zz = zr * Math.cos(thetaN) + z;
  }

  if (r <= BAILOUT) return -1;
  // Classic Mandelbulb DE uses log(r) to estimate signed distance from escaped orbit.
  return 0.5 * Math.log(r) * r / dr;
}

function escapedAtRadius(dir, radius) {
  const x = dir[0] * radius;
  const y = dir[1] * radius;
  const z = dir[2] * radius;
  return mandelbulbDistanceEstimator(x, y, z) >= 0;
}

function findSurfaceRadius(dir) {
  const samples = 80;
  let prevR = 0;
  let prevEscaped = escapedAtRadius(dir, prevR);

  for (let i = 1; i <= samples; i++) {
    const r = (i / samples) * R_MAX;
    const escaped = escapedAtRadius(dir, r);

    if (escaped !== prevEscaped) {
      let lo = prevR;
      let hi = r;
      for (let iter = 0; iter < 18; iter++) {
        const mid = (lo + hi) * 0.5;
        const e = escapedAtRadius(dir, mid);
        if (e === prevEscaped) lo = mid;
        else hi = mid;
      }
      return (lo + hi) * 0.5;
    }

    prevR = r;
    prevEscaped = escaped;
  }

  return Math.min(1.2, R_MAX * 0.62);
}

function sphDir(theta, phi) {
  const st = Math.sin(theta);
  return [st * Math.cos(phi), Math.cos(theta), st * Math.sin(phi)];
}

function makeLod(latSeg, lonSeg, key, detail) {
  const positions = [];
  const faces = [];

  // North pole
  const northDir = [0, 1, 0];
  const northR = findSurfaceRadius(northDir);
  positions.push([0, northR, 0]);
  const northIndex = 0;

  const ringStarts = [];

  for (let i = 1; i < latSeg; i++) {
    const theta = (i / latSeg) * Math.PI;
    const ringStart = positions.length;
    ringStarts.push(ringStart);

    for (let j = 0; j < lonSeg; j++) {
      const phi = (j / lonSeg) * Math.PI * 2;
      const dir = sphDir(theta, phi);
      const r = findSurfaceRadius(dir);
      positions.push([dir[0] * r, dir[1] * r, dir[2] * r]);
    }
  }

  // South pole
  const southDir = [0, -1, 0];
  const southR = findSurfaceRadius(southDir);
  const southIndex = positions.length;
  positions.push([0, -southR, 0]);

  if (ringStarts.length > 0) {
    const firstRing = ringStarts[0];
    for (let j = 0; j < lonSeg; j++) {
      const a = firstRing + j;
      const b = firstRing + ((j + 1) % lonSeg);
      faces.push([northIndex, b, a]);
    }

    for (let ri = 0; ri < ringStarts.length - 1; ri++) {
      const ringA = ringStarts[ri];
      const ringB = ringStarts[ri + 1];
      for (let j = 0; j < lonSeg; j++) {
        const a0 = ringA + j;
        const a1 = ringA + ((j + 1) % lonSeg);
        const b0 = ringB + j;
        const b1 = ringB + ((j + 1) % lonSeg);
        faces.push([a0, a1, b1, b0]);
      }
    }

    const lastRing = ringStarts[ringStarts.length - 1];
    for (let j = 0; j < lonSeg; j++) {
      const a = lastRing + j;
      const b = lastRing + ((j + 1) % lonSeg);
      faces.push([southIndex, a, b]);
    }
  }

  // Normalize extents to target radius and keep nicely centered.
  let maxMag = 0;
  for (const p of positions) {
    maxMag = Math.max(maxMag, Math.hypot(p[0], p[1], p[2]));
  }
  const s = maxMag > 1e-9 ? TARGET_RADIUS / maxMag : 1;
  for (const p of positions) {
    p[0] *= s;
    p[1] *= s;
    p[2] *= s;
  }

  return {
    key,
    detail,
    positions,
    faces,
  };
}

async function main() {
  const lods = [
    makeLod(14, 24, 'low', 0.6),
    makeLod(22, 36, 'mid', 1.0),
    makeLod(30, 48, 'high', 1.4),
  ];

  const payload = {
    format: 'indexed-polygons-v1',
    name: 'Mandelbulb',
    shadingMode: 'smooth',
    creaseAngleDeg: 55,
    lods,
  };

  await fs.writeFile(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, OUT_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
