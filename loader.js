'use strict';

(function initObjectLoader(global) {
  const meshDir = 'meshes/';
  const systemDir = '';
  const meshManifestPath = `${systemDir}mesh-manifest.json`;
  const embeddedMeshFallbackPath = `${systemDir}mesh-fallback-data.js`;
  const cacheBust = global.WireframerCacheBust || Date.now().toString();
  global.WireframerCacheBust = cacheBust;

  function withCacheBust(src) {
    const join = src.includes('?') ? '&' : '?';
    return `${src}${join}v=${cacheBust}`;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = withCacheBust(src);
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function readMeshManifest() {
    let res;
    try {
      res = await fetch(meshManifestPath, { cache: 'no-store' });
    } catch (err) {
      const fromFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
      if (fromFileProtocol) {
        throw new Error(
          `Cannot load ${meshManifestPath} via file://. Serve Wireframer over HTTP (e.g. python -m http.server 5500).`
        );
      }
      throw new Error(`Network error while loading ${meshManifestPath}: ${err && err.message ? err.message : err}`);
    }
    if (!res.ok) throw new Error(`Cannot read ${meshManifestPath}: ${res.status}`);
    const payload = await res.json();
    const files = Array.isArray(payload) ? payload : payload.files;
    if (!Array.isArray(files)) throw new Error('Invalid mesh manifest format. Expected array or { files: [] }.');

    return files
      .map((entry) => {
        if (typeof entry === 'string') return { name: null, file: entry };
        if (!entry || typeof entry !== 'object') return null;
        return {
          name: typeof entry.name === 'string' ? entry.name : null,
          file: typeof entry.file === 'string' ? entry.file : null,
        };
      })
      .filter((entry) => entry && entry.file && entry.file.endsWith('.json'))
      .filter((entry) => !entry.file.includes('/') && !entry.file.includes('..'));
  }

  function selectLodMesh(payload, detail) {
    const lods = Array.isArray(payload.lods) ? payload.lods : null;
    if (!lods || !lods.length) return payload;

    const d = Math.max(0.5, Math.min(1.4, Number(detail) || 1));
    let best = lods[0];
    let bestDist = Math.abs((Number(best.detail) || 1) - d);

    for (let i = 1; i < lods.length; i++) {
      const cand = lods[i];
      const dist = Math.abs((Number(cand.detail) || 1) - d);
      if (dist < bestDist) {
        best = cand;
        bestDist = dist;
      }
    }

    return {
      format: payload.format || 'indexed-polygons-v1',
      name: payload.name,
      shadingMode: payload.shadingMode,
      creaseAngleDeg: payload.creaseAngleDeg,
      positions: best.positions,
      faces: best.faces,
      edges: best.edges,
    };
  }

  function registerMeshPayload(payload, nameHint, fileHint) {
    const displayName = nameHint || payload.name || (fileHint ? fileHint.replace(/\.mesh\.json$/i, '').replace(/\.json$/i, '') : 'Unnamed Mesh');

    global.WireframeObjectRegistry.register({
      name: displayName,
      shadingMode: payload.shadingMode,
      creaseAngleDeg: payload.creaseAngleDeg,
      build(options = {}) {
        return selectLodMesh(payload, options.detail);
      },
    });
  }

  async function loadMeshObjects() {
    const entries = await readMeshManifest();
    if (!entries.length) return false;

    for (const entry of entries) {
      const meshPath = `${meshDir}${entry.file}`;
      let res;
      try {
        res = await fetch(meshPath, { cache: 'no-store' });
      } catch (err) {
        throw new Error(`Network error while loading ${meshPath}: ${err && err.message ? err.message : err}`);
      }
      if (!res.ok) throw new Error(`Cannot read ${meshDir}${entry.file}: ${res.status}`);
      const payload = await res.json();
      registerMeshPayload(payload, entry.name, entry.file);
    }

    return true;
  }

  async function loadEmbeddedMeshFallback() {
    await loadScript(embeddedMeshFallbackPath);
    const embedded = global.WireframeEmbeddedMeshes;
    if (!Array.isArray(embedded) || !embedded.length) return false;

    for (const entry of embedded) {
      if (!entry || typeof entry !== 'object') continue;
      const payload = entry.payload || entry.mesh || entry;
      if (!payload || typeof payload !== 'object') continue;
      registerMeshPayload(payload, entry.name, entry.file);
    }

    return global.OBJECTS.length > 0;
  }

  global.WireframeObjectsReady = (async () => {
    await loadScript(`${systemDir}registry.js`);

    const fromFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    if (fromFileProtocol) {
      const loaded = await loadEmbeddedMeshFallback();
      if (!loaded) throw new Error('No embedded mesh fallback objects found for file:// mode.');
      return global.OBJECTS;
    }

    try {
      const loadedMeshes = await loadMeshObjects();
      if (loadedMeshes) return global.OBJECTS;
    } catch (err) {
      console.warn('Wireframer: mesh fetch path failed, trying embedded fallback.', err);
    }

    const loadedFallback = await loadEmbeddedMeshFallback();
    if (!loadedFallback) throw new Error('No mesh objects loaded from manifest or embedded fallback.');
    return global.OBJECTS;
  })();
})(window);
