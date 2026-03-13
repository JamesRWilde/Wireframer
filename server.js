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

// Start listening for incoming HTTP requests
// The callback logs the URL so developers know where to open the app
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});