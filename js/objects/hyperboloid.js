'use strict';

(function registerHyperboloid(global) {
  const { buildRevolution, detailCount } = global.WireframeGeometry;

  function buildHyperboloid(options = {}) {
    const detail = options.detail ?? 1;
    const stacks = detailCount(30, detail, 16, 1);
    const segs = detailCount(56, detail, 28, 2);
    const profile = [];

    for (let i = 0; i <= stacks; i++) {
      const t = (i / stacks) * 2 - 1;
      const y = t * 1.10;
      const r = Math.sqrt(0.30 + 0.70 * t * t);
      profile.push([r, y]);
    }

    return buildRevolution(profile, segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Hyperboloid', build: buildHyperboloid });
})(window);
