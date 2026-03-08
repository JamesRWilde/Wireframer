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
// 2026-03-21: test commit on develop branch - verifying push workflow
const express = require('express');

// node:path - built-in Node.js module for cross-platform path handling
// Using node: prefix to explicitly indicate built-in module (Node 16+)
const path = require('node:path');

// gzip compression for responses (OBJ files compress very well)
const compression = require('compression');

// Create the Express application instance
const app = express();

// Server port - hardcoded to 3000 for development consistency
const port = 3000;

// Enable gzip compression for all responses
app.use(compression());

// Middleware to parse JSON bodies for POST requests
app.use(express.json());

// Configure static file serving from the project root directory
// __dirname is the directory containing this file (project root)
// This serves all files: index.html, JS modules, CSS, mesh OBJ files, etc.
// Express automatically sets correct Content-Type headers based on file extensions
app.use(express.static(path.join(__dirname)));

// No API endpoints - static files only

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

// Server is now static-only, no API endpoints