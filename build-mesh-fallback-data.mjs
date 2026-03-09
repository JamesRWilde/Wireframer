import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = __dirname;

const meshManifestPath = path.join(repoRoot, 'mesh-manifest.json');
const outPath = path.join(repoRoot, 'mesh-fallback-data.js');

function resolverNameForFile(fileName) {
  const stem = String(fileName || '')
    .replace(/\.mesh\.json$/i, '')
    .replace(/\.json$/i, '');
  const safe = stem.replace(/[^A-Za-z0-9_$]+/g, '_');
  return `mesh_${safe}`;
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(meshManifestPath, 'utf8'));
  const files = Array.isArray(manifest.files) ? manifest.files : [];

  const fallbackList = [];
  for (const entry of files) {
    if (!entry || typeof entry.file !== 'string') continue;
    const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : null;
    fallbackList.push({
      name: name || entry.file.replace(/\.mesh\.json$/i, '').replace(/\.json$/i, ''),
      file: entry.file,
      resolver: resolverNameForFile(entry.file),
    });
  }

  const content = `'use strict';\n\n(function initEmbeddedMeshList(global) {\n  global.WireframeEmbeddedMeshList = ${JSON.stringify(fallbackList)};\n})(window);\n`;
  await fs.writeFile(outPath, content, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outPath)} with ${fallbackList.length} fallback list entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
