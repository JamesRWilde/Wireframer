'use strict';

(function registerSpring(global) {
  function buildSpring(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;
    const turns = 5;

    // Vertices = turns * segsPerTurn * sides.
    // Target minimum around 100.
    const segsPerTurnMin = 5;
    const segsPerTurnMax = 34;
    const sidesMin = 4;
    const sidesMax = 12;
    const segsPerTurn = Math.max(
      segsPerTurnMin,
      Math.round(segsPerTurnMin + (segsPerTurnMax - segsPerTurnMin) * t)
    );
    const sides = Math.max(
      sidesMin,
      Math.round(sidesMin + (sidesMax - sidesMin) * t)
    );
    const tubeR = 0.10;
    const R = 0.68;
    const height = 1.80;
    const N = turns * segsPerTurn;
    const V = [];
    const E = [];
    const F = [];

    for (let i = 0; i < N; i++) {
      const t = i / N;
      const angle = t * turns * Math.PI * 2;
      const cx = R * Math.cos(angle);
      const cy = -height / 2 + t * height;
      const cz = R * Math.sin(angle);

      const dt = 0.0001;
      const t2 = t + dt;
      const angle2 = t2 * turns * Math.PI * 2;
      let tx = R * Math.cos(angle2) - cx;
      let ty = height * dt;
      let tz = R * Math.sin(angle2) - cz;
      const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
      tx /= tl;
      ty /= tl;
      tz /= tl;

      let nx = Math.cos(angle);
      let ny = 0;
      let nz = Math.sin(angle);
      const d = nx * tx + ny * ty + nz * tz;
      nx -= d * tx;
      ny -= d * ty;
      nz -= d * tz;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= nl;
      ny /= nl;
      nz /= nl;

      const bx = ty * nz - tz * ny;
      const by = tz * nx - tx * nz;
      const bz = tx * ny - ty * nx;

      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2;
        const c = Math.cos(a) * tubeR;
        const s = Math.sin(a) * tubeR;
        V.push([cx + c * nx + s * bx, cy + c * ny + s * by, cz + c * nz + s * bz]);
      }
    }

    for (let i = 0; i < N; i++) {
      for (let k = 0; k < sides; k++) {
        const cur = i * sides + k;
        E.push([cur, i * sides + (k + 1) % sides]);
        if (i < N - 1) {
          E.push([cur, (i + 1) * sides + k]);
          const a = i * sides + k;
          const b = i * sides + (k + 1) % sides;
          const c = (i + 1) * sides + (k + 1) % sides;
          const d = (i + 1) * sides + k;
          F.push([a, b, c, d]);
        }
      }
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Spring', build: buildSpring });
})(window);
