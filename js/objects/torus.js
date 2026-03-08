
'use strict';

(function registerTorus(global) {
  const { detailCount } = global.WireframeGeometry;

  function buildTorus(options = {}) {
    const detail = options.detail ?? 1;
    const R = 0.70;
    const r = 0.28;
    const maj = detailCount(56, detail, 28, 2);
    const min = detailCount(32, detail, 16, 2);
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
