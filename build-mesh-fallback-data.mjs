import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = __dirname;

const meshManifestPath = path.join(repoRoot, 'mesh-manifest.json');
const meshDir = path.join(repoRoot, 'meshes');
const outPath = path.join(repoRoot, 'mesh-fallback-data.js');

async function main() {
  const manifest = JSON.parse(await fs.readFile(meshManifestPath, 'utf8'));
  const files = Array.isArray(manifest.files) ? manifest.files : [];

  const embedded = [];
  for (const entry of files) {
    if (!entry || typeof entry.file !== 'string') continue;
    const p = path.join(meshDir, entry.file);
    const payload = JSON.parse(await fs.readFile(p, 'utf8'));
    embedded.push({
      name: typeof entry.name === 'string' ? entry.name : payload.name,
      file: entry.file,
      payload,
    });
  }

  const content = `'use strict';\n\n(function initEmbeddedMeshes(global) {\n  global.WireframeEmbeddedMeshes = ${JSON.stringify(embedded)};\n})(window);\n`;
  await fs.writeFile(outPath, content, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outPath)} with ${embedded.length} embedded mesh entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
