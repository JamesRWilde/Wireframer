'use strict';

(function initAppBootstrap() {
  const appDir = 'js/app/';
  const cacheBust = window.WireframerCacheBust || Date.now().toString();
  window.WireframerCacheBust = cacheBust;
  const orderedFiles = [
    'core.js',
    'input.js',
    'ui/dom-state.js',
    'ui/color-utils.js',
    'ui/theme.js',
    'ui/controls.js',
    'render/background-gpu.js',
    'render/background.js',
    'render/wireframe.js',
    'render/fill.js',
    'render/scene-gpu.js',
    'render/morph.js',
    'render/loop.js',
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
      await loadScript(`${appDir}${file}`);
    }
  })().catch((err) => {
    console.error(err);
    const label = document.getElementById('obj-label');
    if (label) label.textContent = 'Failed to load app';
  });
})();
