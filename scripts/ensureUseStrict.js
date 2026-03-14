// Script to ensure each file listed in use-strict-tracking.md contains a leading "use strict"; directive.
// This is used to keep strict mode consistent across the legacy JS codebase.

const fs = require('fs');
const path = require('path');

const baseDir = process.cwd();
const trackingPath = path.join(baseDir, 'use-strict-tracking.md');
const trackingText = fs.readFileSync(trackingPath, 'utf8');

const lines = trackingText.split(/\r?\n/);
const results = [];

for (const line of lines) {
  const match = line.match(/^\s*- \[( |x)\] (.+\.js)\s*$/);
  if (!match) continue;

  const relPath = match[2];
  const absPath = path.join(baseDir, relPath);
  const exists = fs.existsSync(absPath);

  if (!exists) {
    results.push({ path: relPath, status: 'MISSING' });
    continue;
  }

  const fileText = fs.readFileSync(absPath, 'utf8');

  // Normalize BOM so we can safely inspect the first meaningful line.
  const hasBom = fileText.startsWith('\uFEFF');
  const normalized = hasBom ? fileText.slice(1) : fileText;

  const fileLines = normalized.split(/\r?\n/);

  // Find first non-empty line to detect an existing strict directive.
  const strictLineRegex = /^(['"])use strict\1\s*;?$/;
  const firstNonEmptyIndex = fileLines.findIndex((l) => l.trim().length > 0);
  const firstNonEmptyLine = firstNonEmptyIndex === -1 ? '' : fileLines[firstNonEmptyIndex].trim();
  const alreadyStrict = strictLineRegex.test(firstNonEmptyLine);

  if (!alreadyStrict) {
    // Remove any stray strict directives near the top to avoid duplicates.
    const cleanedLines = fileLines.filter((l, idx) => {
      if (idx > 10) return true; // only cleanse the very beginning of the file
      return !strictLineRegex.test(l.trim());
    });

    const prefix = hasBom ? '\uFEFF' : '';
    const updated = `${prefix}"use strict";\n\n${cleanedLines.join('\n')}`;
    fs.writeFileSync(absPath, updated, 'utf8');
    results.push({ path: relPath, status: 'INSERTED' });
  } else {
    results.push({ path: relPath, status: 'OK' });
  }
}


console.log('use-strict audit results:');
let anyMissing = false;
for (const r of results) {
  const mark = r.status === 'OK' ? '✅' : r.status === 'INSERTED' ? '➕' : '⚠️';
  console.log(`${mark} ${r.path} - ${r.status}`);
  if (r.status === 'MISSING') anyMissing = true;
}

if (anyMissing) {
  console.error('\nSome files listed in use-strict-tracking.md were missing from disk.');
  process.exit(1);
}
