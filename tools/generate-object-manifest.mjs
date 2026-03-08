import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const objectsDir = path.join(repoRoot, 'js', 'objects');
const manifestPath = path.join(objectsDir, 'manifest.json');

const excluded = new Set(['loader.js', 'registry.js', 'utils.js']);

function compareNames(a, b) {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

async function generateManifest() {
  const entries = await fs.readdir(objectsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith('.js'))
    .filter((name) => !excluded.has(name))
    .sort(compareNames);

  const content = `${JSON.stringify({ files }, null, 2)}\n`;
  await fs.writeFile(manifestPath, content, 'utf8');

  console.log(`Wrote ${path.relative(repoRoot, manifestPath)} with ${files.length} object file(s).`);
}

generateManifest().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
