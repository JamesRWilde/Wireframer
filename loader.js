'use strict';

(function initObjectLoader(global) {
  const systemDir = '';
  const meshScopePath = `${systemDir}mesh-scope.js`;
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

  function normalizeManifestEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map((entry) => {
        if (typeof entry === 'string') return { name: null, file: entry, resolver: null };
        if (!entry || typeof entry !== 'object') return null;
        return {
          name: typeof entry.name === 'string' ? entry.name : null,
          file: typeof entry.file === 'string' ? entry.file : null,
          resolver: typeof entry.resolver === 'string' ? entry.resolver : null,
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

  async function resolveManifestEntries() {
    const scoped = getScopedManifestEntries();
    if (!scoped.length) {
      throw new Error('No bundled mesh manifest found. Ensure mesh-scope.js loads before loader.js.');
    }
    return scoped;
  }

  function fileToResolver(file) {
    if (!file || typeof file !== 'string') return null;
    const stem = file
      .replace(/\.mesh\.json$/i, '')
      .replace(/\.json$/i, '')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return stem ? `mesh_${stem}` : null;
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
      const resolverName = entry.resolver || fileToResolver(entry.file);
      const providers = global.WireframeMeshResolvers;
      const provider =
        (resolverName && providers && typeof providers[resolverName] === 'function' && providers[resolverName]) ||
        (resolverName && typeof global[resolverName] === 'function' && global[resolverName]) ||
        null;

      if (!provider) {
        throw new Error(`No provider found for ${entry.name || entry.file || 'unnamed entry'} (${resolverName || 'no resolver'}).`);
      }

      const payload = await provider({ entry });
      if (!payload || typeof payload !== 'object') {
        throw new Error(`Provider ${resolverName} returned an invalid payload.`);
      }

      registerMeshPayload(payload, entry.name, entry.file);
    }

    return global.OBJECTS.length > 0;
  }

  global.WireframeObjectsReady = (async () => {
    await loadScript(`${systemDir}registry.js`);
    await loadScript(meshScopePath);

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
