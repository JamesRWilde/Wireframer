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
    // Mesh files (OBJ-style format)
    'meshes/acorn.mesh.js',
    'meshes/capsule.mesh.js',
    'meshes/cinquefoil-knot.mesh.js',
    'meshes/cone.mesh.js',
    'meshes/cube.mesh.js',
    'meshes/cylinder.mesh.js',
    'meshes/diamond.mesh.js',
    'meshes/hilbert-curve.mesh.js',
    'meshes/house.mesh.js',
    'meshes/hyperboloid.mesh.js',
    'meshes/icosahedron.mesh.js',
    'meshes/jerusalem-cube.mesh.js',
    'meshes/mandelbulb.mesh.js',
    'meshes/menger-sponge.mesh.js',
    'meshes/mobius-strip.mesh.js',
    'meshes/octahedron.mesh.js',
    'meshes/prism.mesh.js',
    'meshes/pyramid.mesh.js',
    'meshes/sierpinski-pyramid.mesh.js',
    'meshes/sierpinski-tetrahedron.mesh.js',
    'meshes/sphere.mesh.js',
    'meshes/spring.mesh.js',
    'meshes/star-prism.mesh.js',
    'meshes/tetrahedron.mesh.js',
    'meshes/torus-knot.mesh.js',
    'meshes/torus.mesh.js',
    'meshes/wine-glass.mesh.js',
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
