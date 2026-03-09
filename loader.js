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

  function normalizeFallbackEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
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

  async function readFallbackManifestList() {
    await loadScript(embeddedMeshFallbackPath);
    return normalizeFallbackEntries(global.WireframeEmbeddedMeshList);
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

  async function loadMeshObjects(entries) {
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

  global.WireframeObjectsReady = (async () => {
    await loadScript(`${systemDir}registry.js`);

    try {
      const manifestEntries = await readMeshManifest();
      const loadedMeshes = await loadMeshObjects(manifestEntries);
      if (loadedMeshes) return global.OBJECTS;
    } catch (err) {
      console.warn('Wireframer: mesh manifest fetch failed, trying fallback shape list.', err);
    }

    const fallbackEntries = await readFallbackManifestList();
    if (!fallbackEntries.length) {
      throw new Error('No mesh entries available from manifest or fallback shape list.');
    }

    const loadedFallback = await loadMeshObjects(fallbackEntries);
    if (!loadedFallback) {
      throw new Error(
        'Fallback shape list loaded, but mesh files could not be fetched. Serve Wireframer over HTTP (e.g. python -m http.server 5500).'
      );
    }

    return global.OBJECTS;
  })();
})(window);
