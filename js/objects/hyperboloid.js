'use strict';

(function registerHyperboloid(global) {
  const { buildRevolution } = global.WireframeGeometry;

  function buildHyperboloid() {
    const stacks = 16;
    const profile = [];

    for (let i = 0; i <= stacks; i++) {
      const t = (i / stacks) * 2 - 1;
      const y = t * 1.10;
      const r = Math.sqrt(0.30 + 0.70 * t * t);
      profile.push([r, y]);
    }

    return buildRevolution(profile, 24);
  }

  global.WireframeObjectRegistry.register({ name: 'Hyperboloid', build: buildHyperboloid });
})(window);
