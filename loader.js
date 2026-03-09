'use strict';

(function initObjectLoader(global) {
  function normalizeMapEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        return {
          name: typeof entry.name === 'string' ? entry.name : null,
          file: typeof entry.file === 'string' ? entry.file : null,
          resolver: typeof entry.resolver === 'string' ? entry.resolver : null,
        };
      })
      .filter((entry) => entry && entry.file)
      .filter((entry) => entry.file.endsWith('.json') && !entry.file.includes('/') && !entry.file.includes('..'))
      .filter((entry) => !entry.resolver || /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(entry.resolver));
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

  async function loadMappedMeshes(entries) {
    for (const entry of entries) {
      const resolverName = entry.resolver || fileToResolver(entry.file);
      const providers = global.WireframeMeshResolvers;
      const provider =
        (resolverName && providers && typeof providers[resolverName] === 'function' && providers[resolverName]) ||
        (resolverName && typeof global[resolverName] === 'function' && global[resolverName]) ||
        null;

      if (!provider) {
        throw new Error(`Missing static mesh resolver for ${entry.file} (${resolverName || 'none'}).`);
      }

      const payload = await provider({ entry });
      if (!payload || typeof payload !== 'object') {
        throw new Error(`Invalid mesh payload for ${entry.name || entry.file || 'unnamed entry'}.`);
      }
      registerMeshPayload(payload, entry.name, entry.file);
    }
  }

  global.WireframeObjectsReady = (async () => {
    if (!global.WireframeObjectRegistry || typeof global.WireframeObjectRegistry.register !== 'function') {
      throw new Error('WireframeObjectRegistry not initialized. Ensure registry.js loads before loader.js.');
    }

    const entries = normalizeMapEntries(global.WireframeMeshMap);
    if (!entries.length) {
      throw new Error('WireframeMeshMap is empty or invalid.');
    }

    await loadMappedMeshes(entries);
    if (!global.OBJECTS || !global.OBJECTS.length) {
      throw new Error('No mesh objects were registered from WireframeMeshMap.');
    }

    return global.OBJECTS;
  })();
})(window);
