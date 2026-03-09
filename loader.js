'use strict';

(function initObjectLoader(global) {
  const meshDir = 'meshes/';
  const cacheBust = global.WireframerCacheBust || Date.now().toString();
  global.WireframerCacheBust = cacheBust;

  function withCacheBust(src) {
    const fromFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    if (fromFileProtocol) return src;
    const join = src.includes('?') ? '&' : '?';
    return `${src}${join}v=${cacheBust}`;
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
    const fromFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    if (fromFileProtocol) return readJsonViaXhr(src);

    const res = await fetch(withCacheBust(src), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Cannot read ${src}: ${res.status}`);
    return res.json();
  }

  function normalizeMapEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        return {
          name: typeof entry.name === 'string' ? entry.name : null,
          file: typeof entry.file === 'string' ? entry.file : null,
        };
      })
      .filter((entry) => entry && entry.file)
      .filter((entry) => entry.file.endsWith('.json') && !entry.file.includes('/') && !entry.file.includes('..'));
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
      const payload = await readJsonResource(`${meshDir}${entry.file}`);
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
