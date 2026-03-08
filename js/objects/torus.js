
'use strict';

(function registerTorus(global) {
  function buildTorus(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;
    const R = 0.70;
    const r = 0.28;

    // Vertex count = maj * min.
    // Target minimum around 100.
    const majMin = 10;
    const majMax = 56;
    const minMin = 10;
    const minMax = 32;
    const majRaw = majMin + (majMax - majMin) * t;
    const minRaw = minMin + (minMax - minMin) * t;
    const maj = Math.max(majMin, Math.round(majRaw / 2) * 2);
    const min = Math.max(minMin, Math.round(minRaw / 2) * 2);
    const V = [];
    const E = [];
    const F = [];

    for (let i = 0; i < maj; i++) {
      const u = (i / maj) * Math.PI * 2;
      for (let j = 0; j < min; j++) {
        const v = (j / min) * Math.PI * 2;
        V.push([
          (R + r * Math.cos(v)) * Math.cos(u),
          r * Math.sin(v),
          (R + r * Math.cos(v)) * Math.sin(u),
        ]);
        const cur = i * min + j;
        E.push([cur, i * min + (j + 1) % min]);
        E.push([cur, ((i + 1) % maj) * min + j]);

        const a = i * min + j;
        const b = i * min + (j + 1) % min;
        const c = ((i + 1) % maj) * min + (j + 1) % min;
        const d = ((i + 1) % maj) * min + j;
        F.push([a, b, c, d]);
      }
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Torus', build: buildTorus });
})(window);
