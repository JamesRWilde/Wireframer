/**
 * server.js - Development HTTP Server
 * 
 * PURPOSE:
 *   Provides a simple Express.js static file server for local development.
 *   Serves all files from the project root directory, allowing the browser
 *   to load ES modules and fetch mesh files without CORS issues.
 * 
 * WHY EXPRESS:
 *   While the app can run from file:// protocol for basic viewing, a local
 *   server is needed for: fetch() calls to load OBJ files, ES module imports
 *   (some browsers restrict these on file://), and proper MIME type handling.
 * 
 * USAGE:
 *   npm start    - Runs this server
 *   npm run dev  - Runs with nodemon for auto-restart on file changes
 * 
 * ALTERNATIVES:
 *   python -m http.server 5500
 *   npx serve . -l 5500
 */

"use strict";

// Express.js - lightweight web framework for serving static files
const express = require('express');

// node:path - built-in Node.js module for cross-platform path handling
// Using node: prefix to explicitly indicate built-in module (Node 16+)
const path = require('node:path');

// Create the Express application instance
const app = express();

// Server port - hardcoded to 3000 for development consistency
const port = 3000;

// Middleware to parse JSON bodies for POST requests
app.use(express.json());

// Configure static file serving from the project root directory
// __dirname is the directory containing this file (project root)
// This serves all files: index.html, JS modules, CSS, mesh OBJ files, etc.
// Express automatically sets correct Content-Type headers based on file extensions
app.use(express.static(path.join(__dirname)));

// Reintroducing /api/meshes endpoint
const fs = require('node:fs');

app.get('/api/meshes', (req, res) => {
  const meshesDir = path.join(__dirname, 'meshes');

  try {
    const files = fs.readdirSync(meshesDir)
      .filter(f => f.toLowerCase().endsWith('.obj'))
      .sort()
      .map(filename => {
        const key = filename.replace(/\.obj$/i, '');
        const name = key.replaceAll('-', ' ').replaceAll(/\b\w/g, c => c.toUpperCase());
        return { key, name, obj: `meshes/${filename}` };
      });

    res.json(files);
  } catch (err) {
    console.error('[api/meshes] Failed to read meshes directory:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Forensic log endpoint - receives log entries from the client and writes to wireframer.log
app.post('/api/log', (req, res) => {
  try {
    const entries = req.body;
    const logFile = path.join(__dirname, 'wireframer.log');
    
    // Format each entry as a line in the log file
    const lines = entries.map(entry => {
      const { t, cat, fn, phase, data } = entry;
      const dataStr = data ? ` ${JSON.stringify(data)}` : '';
      return `[${new Date(t).toISOString()}] ${cat}/${fn} ${phase}${dataStr}`;
    });
    
    fs.appendFileSync(logFile, lines.join('\n') + '\n', 'utf8');
    res.json({ ok: true, written: entries.length });
  } catch (err) {
    console.error('[api/log] Failed to write log:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start listening for incoming HTTP requests
// The callback logs the URL so developers know where to open the app
// Wrap server startup in a try-catch block to capture runtime errors
try {
  app.listen(port, () => {
    console.log(`Simplified server running at http://localhost:${port}`);
  });
} catch (err) {
  console.error('[ERROR] Server failed to start:', err.message);
  process.exit(1);
}

// Check if meshes directory exists
if (!fs.existsSync(path.join(__dirname, 'meshes'))) {
  console.error('[ERROR] Meshes directory does not exist. Please ensure the "meshes" folder is present in the project root.');
  process.exit(1);
}

// Check if log file is writable
const logFile = path.join(__dirname, 'wireframer.log');
try {
  fs.appendFileSync(logFile, '[DEBUG] Log file is writable.\n');
} catch (err) {
  console.error('[ERROR] Unable to write to log file:', err.message);
  process.exit(1);
}