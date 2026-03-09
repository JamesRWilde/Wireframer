'use strict';

(function initObjectLoader(global) {
  const meshDir = 'meshes/';
  const systemDir = '';
  const meshManifestPath = `${systemDir}mesh-manifest.json`;
  const meshFunctionsPath = `${systemDir}mesh-functions.js`;
  const embeddedMeshFallbackPath = `${systemDir}mesh-fallback-data.js`;
  const cacheBust = global.WireframerCacheBust || Date.now().toString();
  global.WireframerCacheBust = cacheBust;

  function withCacheBust(src) {
    const fromFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    if (fromFileProtocol) return src;
    const join = src.includes('?') ? '&' : '?';
    return `${src}${join}v=${cacheBust}`;
  }

  function resolverNameForFile(fileName) {
    const stem = String(fileName || '')
      .replace(/\.mesh\.json$/i, '')
      .replace(/\.json$/i, '');
    const safe = stem.replace(/[^A-Za-z0-9_$]+/g, '_');
    return `mesh_${safe}`;
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
          `Use scoped resolvers (window.WireframeMeshManifest + window.WireframeMeshResolvers) or HTTP hosting. ` +
          `Details: ${xhrErr && xhrErr.message ? xhrErr.message : xhrErr}`
        );
      }
    }
  }

  function normalizeManifestEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map((entry) => {
        if (typeof entry === 'string') return { name: null, file: entry, resolver: resolverNameForFile(entry) };
        if (!entry || typeof entry !== 'object') return null;
        const file = typeof entry.file === 'string' ? entry.file : null;
        const resolver = typeof entry.resolver === 'string' ? entry.resolver : (file ? resolverNameForFile(file) : null);
        return {
          name: typeof entry.name === 'string' ? entry.name : null,
          file,
          resolver,
        };
      })
      .filter((entry) => entry && (entry.file || entry.resolver))
      .filter((entry) => !entry.file || (entry.file.endsWith('.json') && !entry.file.includes('/') && !entry.file.includes('..')))
      .filter((entry) => !entry.resolver || /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(entry.resolver));
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

  async function readFallbackManifestList() {
    await loadScript(embeddedMeshFallbackPath);
    return normalizeManifestEntries(global.WireframeEmbeddedMeshList);
  }

  async function resolveManifestEntries() {
    const scoped = getScopedManifestEntries();
    if (scoped.length) return scoped;

    try {
      const fromFile = await readManifestFromJsonFile();
      if (fromFile.length) return fromFile;
    } catch (err) {
      console.warn('Wireframer: mesh-manifest.json unavailable, trying fallback list.', err);
    }

    const fallback = await readFallbackManifestList();
    if (fallback.length) return fallback;
    return [];
  }

  async function resolveManifestEntryPayload(entry) {
    if (entry.resolver) {
      const providers = global.WireframeMeshResolvers;
      const provider =
        (providers && typeof providers[entry.resolver] === 'function' && providers[entry.resolver]) ||
        (typeof global[entry.resolver] === 'function' && global[entry.resolver]) ||
        null;

      if (provider) {
        const payload = await provider({ entry });
        if (!payload || typeof payload !== 'object') {
          throw new Error(`Resolver "${entry.resolver}" did not return a mesh object.`);
        }
        return payload;
      }
    }

    if (!entry.file) {
      throw new Error(`Manifest entry missing both file and resolver (${entry.name || 'unnamed entry'}).`);
    }

    return readJsonResource(`${meshDir}${entry.file}`);
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
      const payload = await resolveManifestEntryPayload(entry);
      registerMeshPayload(payload, entry.name, entry.file);
    }

    return global.OBJECTS.length > 0;
  }

  global.WireframeObjectsReady = (async () => {
    await loadScript(`${systemDir}registry.js`);

    try {
      await loadScript(meshFunctionsPath);
    } catch (err) {
      // Optional in served mode where manifest+JSON fetch is available.
      console.warn('Wireframer: mesh-functions.js not found; falling back to file-based mesh resolution.', err);
    }

    const entries = await resolveManifestEntries();
    if (!entries.length) {
      throw new Error('No mesh entries available from scoped manifest, mesh-manifest.json, or fallback list.');
    }

    const loaded = await loadMeshObjects(entries);
    if (!loaded) {
      throw new Error('No mesh objects could be resolved from manifest entries.');
    }

    return global.OBJECTS;
  })();
})(window);
