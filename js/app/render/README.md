# Render Modules

This folder contains the runtime rendering pipeline split by responsibility.

- `background.js`: Draws and animates the particle background layer.
- `wireframe.js`: Renders edge passes (bloom + depth-toned wireframe lines).
- `fill.js`: Builds triangle faces, computes normals, and draws shaded solid fill.
- `morph.js`: Draws morph transition guides/particles and resolves morph completion.
- `loop.js`: Runs physics + frame loop and starts the app once objects are loaded.

Load order matters and is controlled by `js/app/bootstrap.js`.
