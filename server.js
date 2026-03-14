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
// Could be made configurable via environment variable for production use
const port = 3000;

// Configure static file serving from the project root directory
// __dirname is the directory containing this file (project root)
// This serves all files: index.html, JS modules, CSS, mesh OBJ files, etc.
// Express automatically sets correct Content-Type headers based on file extensions
app.use(express.static(path.join(__dirname)));

// Dynamic mesh listing endpoint - scans meshes/ directory for .obj files
// Returns JSON array of { key, name, obj } objects for the shape selector
app.get('/api/meshes', (req, res) => {
  const fs = require('node:fs');
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

// Start listening for incoming HTTP requests
// The callback logs the URL so developers know where to open the app
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});