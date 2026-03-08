'use strict';

(function registerSphere(global) {
  const { buildRevolution, detailCount } = global.WireframeGeometry;

  function buildSphere(options = {}) {
    const detail = options.detail ?? 1;
    const stacks = detailCount(28, detail, 14, 1);
    const segs = detailCount(56, detail, 28, 2);
    const profile = [];

    for (let i = 0; i <= stacks; i++) {
      const phi = (i / stacks) * Math.PI;
      profile.push([0.95 * Math.sin(phi), 0.95 * Math.cos(phi)]);
    }

    return buildRevolution(profile, segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Sphere', build: buildSphere });
})(window);
