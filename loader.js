'use strict';

(function initObjectLoader(global) {
  const meshDir = 'meshes/';
  const systemDir = '';
  const meshManifestPath = `${systemDir}mesh-manifest.json`;
  const cacheBust = global.WireframerCacheBust || Date.now().toString();
  global.WireframerCacheBust = cacheBust;

  function withCacheBust(src) {
    const fromFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    if (fromFileProtocol) return src;
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

  function readJsonViaXhr(src) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', withCacheBust(src), true);
      req.onreadystatechange = () => {
        if (req.readyState !== 4) return;
        const hasBody = typeof req.responseText === 'string' && req.responseText.trim().length > 0;
        const okHttp = req.status >= 200 && req.status < 300;
        const okFile = req.status === 0 && hasBody;
        if (!(okHttp || okFile)) {
          reject(new Error(`Cannot read ${src}: ${req.status}`));
          return;
        }
        try {
          resolve(JSON.parse(req.responseText));
        } catch (err) {
          reject(new Error(`Invalid JSON in ${src}: ${err && err.message ? err.message : err}`));
        }
      };
      req.onerror = () => reject(new Error(`Network error while loading ${src}`));
      req.send();
    });
  }

  async function readJsonResource(src) {
    try {
      const res = await fetch(src, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Cannot read ${src}: ${res.status}`);
      return await res.json();
    } catch (fetchErr) {
      const fromFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
      if (!fromFileProtocol) {
        throw new Error(`Network error while loading ${src}: ${fetchErr && fetchErr.message ? fetchErr.message : fetchErr}`);
      }

      try {
        return await readJsonViaXhr(src);
      } catch (xhrErr) {
        throw new Error(
          `Cannot load ${src} in file:// mode (fetch and XHR both failed). ` +
          `Provide window.WireframeMeshManifest from host scope, or serve over HTTP. ` +
          `Details: ${xhrErr && xhrErr.message ? xhrErr.message : xhrErr}`
        );
      }
    }
  }

  function normalizeManifestEntries(entries) {
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
      .filter((entry) => entry && entry.file)
      .filter((entry) => entry.file.endsWith('.json'))
      .filter((entry) => !entry.file.includes('/') && !entry.file.includes('..'));
  }

  function getScopedManifestEntries() {
    const payload = global.WireframeMeshManifest;
    if (!payload) return [];
    const files = Array.isArray(payload) ? payload : payload.files;
    return normalizeManifestEntries(files);
  }

  async function readManifestFromJsonFile() {
    const payload = await readJsonResource(meshManifestPath);
    const files = Array.isArray(payload) ? payload : payload.files;
    if (!Array.isArray(files)) throw new Error('Invalid mesh manifest format. Expected array or { files: [] }.');
    return normalizeManifestEntries(files);
  }

  async function resolveManifestEntries() {
    const scoped = getScopedManifestEntries();
    if (scoped.length) return scoped;

    return readManifestFromJsonFile();
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
      const payload = await readJsonResource(`${meshDir}${entry.file}`);
      registerMeshPayload(payload, entry.name, entry.file);
    }

    return global.OBJECTS.length > 0;
  }

  global.WireframeObjectsReady = (async () => {
    await loadScript(`${systemDir}registry.js`);

    const entries = await resolveManifestEntries();
    if (!entries.length) {
      throw new Error('No mesh entries available from manifest.');
    }

    const loaded = await loadMeshObjects(entries);
    if (!loaded) {
      throw new Error('No mesh objects could be loaded from manifest entries.');
    }

    return global.OBJECTS;
  })();
})(window);
