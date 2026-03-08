'use strict';

(function registerMobiusStrip(global) {
  const { detailCount } = global.WireframeGeometry;

  function buildMobiusStrip(options = {}) {
    const detail = options.detail ?? 1;
    const uSeg = detailCount(140, detail, 72, 2);
    const vSeg = detailCount(16, detail, 8, 1);
    const width = 0.28;

    const V = [];
    for (let i = 0; i < uSeg; i++) {
      const u = (i / uSeg) * Math.PI * 2;
      const cu = Math.cos(u);
      const su = Math.sin(u);
      const chu = Math.cos(u * 0.5);
      const shu = Math.sin(u * 0.5);

      for (let j = 0; j <= vSeg; j++) {
        const t = j / vSeg;
        const v = (t * 2 - 1) * width;
        const x = (0.88 + v * chu) * cu;
        const y = (0.88 + v * chu) * su;
        const z = v * shu * 1.55;
        V.push([x, z, y]);
      }
    }

    const row = vSeg + 1;
    const F = [];
    for (let i = 0; i < uSeg; i++) {
      for (let j = 0; j < vSeg; j++) {
        const a = i * row + j;
        const b = i * row + j + 1;

        let c;
        let d;
        if (i < uSeg - 1) {
          const ni = i + 1;
          c = ni * row + j + 1;
          d = ni * row + j;
        } else {
          // Mobius seam closes with reversed strip index due to half twist.
          c = vSeg - (j + 1);
          d = vSeg - j;
        }

        F.push([a, b, c, d]);
      }
    }

    const E = [];
    const edgeSet = new Set();
    function addEdge(a, b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      E.push([lo, hi]);
    }

    for (const face of F) {
      for (let i = 0; i < face.length; i++) {
        addEdge(face[i], face[(i + 1) % face.length]);
      }
    }

    return { V, E, F };
  }

  global.WireframeObjectRegistry.register({ name: 'Mobius Strip', build: buildMobiusStrip });
})(window);
