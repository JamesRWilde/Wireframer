'use strict';

(function initAppBootstrap() {
  const cacheBust = window.WireframerCacheBust || Date.now().toString();
  window.WireframerCacheBust = cacheBust;
  const orderedFiles = [
    // Global variables (must be first)
    'engine/globalVars.js',
    // Core math
    'engine/math3d.js',
    // Geometry/LOD (must be before core.js which uses LODManager)
    'engine/lod.js',
    // Mesh files will now be loaded as .obj via fetch, not as scripts
    // Engine core
    'engine/core.js',
    // Physics/input (depends on math3d)
    'engine/physics/input.js',
    // UI modules
    'ui/dom-state.js',
    'ui/color-utils.js',
    'ui/theme.js',
    'ui/controls.js',
    // Shading modules
    'engine/shading/background-gpu.js',
    'engine/shading/shaders.js',
    'engine/shading/buffers.js',
    'engine/shading/draw.js',
    'engine/shading/core.js',
    'engine/shading/runtime.js',
    // Fill modules
    'engine/fill/triangulation.js',
    'engine/fill/getModelTriangles.js',
    'engine/fill/normals.js',
    'engine/fill/lighting.js',
    'engine/fill/raster.js',
    'engine/fill/renderer.js',
    // Background
    'engine/background.js',
    // Wireframe
    'engine/wireframe.js',
    // Morphing
    'engine/morph.js',
    // Registry and loader
    'registry.js',
    'loader.js',
    // Main loop
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
