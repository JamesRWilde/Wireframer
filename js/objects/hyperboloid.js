'use strict';

(function registerHyperboloid(global) {
  const { buildRevolution } = global.WireframeGeometry;

  function buildHyperboloid(options = {}) {
    const detail = Math.max(0.5, Math.min(1.4, Number(options.detail) || 1));
    const t = (detail - 0.5) / 0.9;

    // Vertices = (stacks + 1) * segs
    // Target max around 800 and minimum around 60.
    const stacksMin = 5;
    const stacksMax = 31;
    const segsMin = 10;
    const segsMax = 25;

    const stacks = Math.max(stacksMin, Math.round(stacksMin + (stacksMax - stacksMin) * t));
    const segsRaw = segsMin + (segsMax - segsMin) * t;
    const segs = Math.max(segsMin, Math.round(segsRaw / 2) * 2);
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
