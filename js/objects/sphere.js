'use strict';

(function registerSphere(global) {
  const { buildRevolution } = global.WireframeGeometry;

  function buildSphere(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;

    // Map slider range directly to stack/segment ranges so minimum detail is truly low poly.
    const stacksMin = 6;
    const stacksMax = 28;
    const segsMin = 12;
    const segsMax = 56;

    const stacks = Math.round(stacksMin + (stacksMax - stacksMin) * t);
    const segsRaw = segsMin + (segsMax - segsMin) * t;
    const segs = Math.max(segsMin, Math.round(segsRaw / 2) * 2);
    const profile = [];

    for (let i = 0; i <= stacks; i++) {
      const phi = (i / stacks) * Math.PI;
      profile.push([0.95 * Math.sin(phi), 0.95 * Math.cos(phi)]);
    }

    return buildRevolution(profile, segs);
  }

  global.WireframeObjectRegistry.register({ name: 'Sphere', build: buildSphere });
})(window);
