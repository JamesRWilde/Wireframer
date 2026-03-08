'use strict';

(function initAppBootstrap() {
  const cacheBust = window.WireframerCacheBust || Date.now().toString();
  window.WireframerCacheBust = cacheBust;
  const orderedFiles = [
    'engine/core.js',
    'engine/physics/input.js',
    'ui/dom-state.js',
    'ui/color-utils.js',
    'ui/theme.js',
    'ui/controls.js',
    'engine/shading/background-gpu.js',
    'engine/background.js',
    'engine/wireframe.js',
    'engine/fill/triangulation.js',
    'engine/fill/normals.js',
    'engine/fill/lighting.js',
    'engine/fill/raster.js',
    'engine/fill/renderer.js',
    'engine/shading/shaders.js',
    'engine/shading/buffers.js',
    'engine/shading/draw.js',
    'engine/shading/core.js',
    'engine/shading/runtime.js',
    'engine/morph.js',
    'engine/loop.js',
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const join = src.includes('?') ? '&' : '?';
      script.src = `${src}${join}v=${cacheBust}`;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load app script: ${src}`));
      document.head.appendChild(script);
    });
  }

  (async () => {
    for (const file of orderedFiles) {
      await loadScript(file);
    }
  })().catch((err) => {
    console.error(err);
    const label = document.getElementById('obj-label');
    if (label) label.textContent = 'Failed to load app';
  });
})();
