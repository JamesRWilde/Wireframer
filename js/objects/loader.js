'use strict';

(function initObjectLoader(global) {
  const objectDir = 'js/objects/';
  const manifestPath = `${objectDir}manifest.json`;
  const fallbackObjectFiles = [
    'wineGlass.js',
    'torus.js',
    'sphere.js',
    'cube.js',
    'icosahedron.js',
    'diamond.js',
    'torusKnot.js',
    'hyperboloid.js',
    'spring.js',
    'octahedron.js',
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function readManifestFiles() {
    const res = await fetch(manifestPath, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Cannot read ${manifestPath}: ${res.status}`);
    const payload = await res.json();
    const files = Array.isArray(payload) ? payload : payload.files;
    if (!Array.isArray(files)) throw new Error('Invalid manifest format. Expected array or { files: [] }.');

    return files
      .filter((file) => typeof file === 'string' && file.endsWith('.js'))
      .filter((file) => file && !file.includes('/') && !file.includes('..'))
      .filter((file) => file !== 'loader.js' && file !== 'registry.js' && file !== 'utils.js');
  }

  async function discoverObjectFiles() {
    try {
      const files = await readManifestFiles();
      if (files.length) return files;
      throw new Error('Manifest exists but contains no object files.');
    } catch {
      // Fall through to directory discovery.
    }

    try {
      const res = await fetch(objectDir, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Cannot list ${objectDir}: ${res.status}`);
      const html = await res.text();
      const matches = [...html.matchAll(/href=["']([^"']+\.js)["']/gi)];
      const candidates = matches
        .map((m) => m[1])
        .map((href) => {
          const path = href.split('?')[0].split('#')[0];
          return path.startsWith(objectDir) ? path.slice(objectDir.length) : path;
        })
        .filter((file) => file && !file.includes('/') && !file.includes('..'))
        .filter((file) => file !== 'loader.js' && file !== 'registry.js' && file !== 'utils.js');

      const uniqueSorted = Array.from(new Set(candidates)).sort();
      if (!uniqueSorted.length) throw new Error('Directory listing did not expose object files.');
      return uniqueSorted;
    } catch {
      // Final fallback when no manifest and no directory listing are available.
      return fallbackObjectFiles.slice();
    }
  }

  global.WireframeObjectsReady = (async () => {
    await loadScript(`${objectDir}registry.js`);
    await loadScript(`${objectDir}utils.js`);

    const objectFiles = await discoverObjectFiles();
    for (const file of objectFiles) {
      await loadScript(`${objectDir}${file}`);
    }

    return global.OBJECTS;
  })();
})(window);
