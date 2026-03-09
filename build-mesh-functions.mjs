import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = __dirname;

const meshManifestPath = path.join(repoRoot, 'mesh-manifest.json');
const meshDir = path.join(repoRoot, 'meshes');
const outPath = path.join(repoRoot, 'mesh-functions.js');

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

  const entries = [];
  for (const entry of files) {
    if (!entry || typeof entry.file !== 'string') continue;
    const file = entry.file;
    const meshPath = path.join(meshDir, file);
    const payload = JSON.parse(await fs.readFile(meshPath, 'utf8'));
    const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : (payload.name || file);
    const resolver = resolverNameForFile(file);
    entries.push({ name, file, resolver, payload });
  }

  const lines = [];
  lines.push("'use strict';");
  lines.push('');
  lines.push('(function initMeshResolvers(global) {');
  lines.push('  const resolvers = global.WireframeMeshResolvers || (global.WireframeMeshResolvers = {});');
  lines.push('');

  for (const e of entries) {
    lines.push(`  const payload_${e.resolver} = ${JSON.stringify(e.payload)};`);
    lines.push(`  resolvers.${e.resolver} = function ${e.resolver}() { return payload_${e.resolver}; };`);
    lines.push('');
  }

  const scopedManifest = {
    format: 'indexed-polygons-v1-manifest',
    files: entries.map((e) => ({ name: e.name, file: e.file, resolver: e.resolver })),
  };

  lines.push(`  global.WireframeMeshManifest = ${JSON.stringify(scopedManifest)};`);
  lines.push('})(window);');
  lines.push('');

  await fs.writeFile(outPath, lines.join('\n'), 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outPath)} with ${entries.length} resolvers.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
