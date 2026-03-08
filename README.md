# Wireframer

Wireframer is an interactive 3D playground for exploring how mesh geometry, shading, and wireframe rendering can coexist in a clean, hackable browser app.

The goal is not just to display shapes. It is to make transformation visible: how a mesh is built, how depth affects line readability, how color themes propagate across UI and scene, and how one topology morphs into another without hiding the math.

If you like graphics code that feels alive but is still easy to reason about, this is that project.

## Why It Is Interesting

- It is intentionally bundle-free runtime JavaScript, while still split into focused modules.
- It renders the same model in two complementary styles at once: solid shading and depth-aware wireframe.
- It uses function-level seams that are easy to modify in isolation.
- It treats object definitions as canonical mesh assets (`indexed-polygons-v1` JSON), so adding new geometry is import-friendly.
- It ships an explicit embedded mesh fallback map for `file://` runs, while still preferring manifest-based JSON fetch over HTTP.
- It makes visual decisions explainable, not magic: shading terms, edge buckets, contrast enforcement, and morph sampling are explicit in code.

## What The App Does

- Displays multiple parametric and polyhedral 3D objects on canvas.
- Includes fractal-inspired objects such as Menger sponge, Sierpinski variants, Jerusalem cube, and Hilbert pipe.
- Lets users rotate and zoom in real time.
- Morphs between objects using sampled point correspondences and easing.
- Supports live detail scaling with model regeneration and caching.
- Supports fill and wireframe opacity controls independently.
- Supports background particle density, velocity, and opacity controls.
- Supports custom RGB theming with persistence and preset/random swatches.
- Auto-selects GPU foreground rendering when available, with CPU fallback.
- Exposes live performance stats (FPS, frame/physics/background/foreground timings).

## Quick Start

Preferred: use a local web server so mesh assets load from `mesh-manifest.json` via `fetch`.

```powershell
python -m http.server 5500
```

Open `http://localhost:5500`.

Alternative:

```powershell
npx serve . -l 5500
```

Direct file-open also works now:

- Open `index.html` directly and loader will use the embedded mesh fallback map (`js/object-system/mesh-fallback-data.js`).
- HTTP mode remains the primary path during development (manifest + individual mesh JSON fetches).

## Controls

- Drag mouse or touch to rotate.
- Scroll wheel to zoom.
- Choose a shape from the selector.
- Change `Detail` to rebuild model density.
- Adjust `Fill` and `Wireframe` opacity.
- Adjust `Background` density, velocity, and opacity.
- Pick a preset or fine-tune RGB sliders.

## Runtime Flow In 30 Seconds

1. `index.html` loads `js/math3d.js`, then `js/object-system/loader.js`, then `js/app/bootstrap.js`.
2. `loader.js` builds `window.WireframeObjectsReady` by loading registry and then either mesh JSON assets (HTTP) or embedded mesh fallback data (`file://`).
3. `bootstrap.js` loads app modules in strict order so globals are available when needed.
4. `render/loop.js` waits for `WireframeObjectsReady`, then calls `startApp()`.
5. `startApp()` wires controls and starts `requestAnimationFrame(frame)`.
6. Each frame updates rotation physics, then draws background plus foreground through GPU or CPU paths.
7. Telemetry HUD values are updated with smoothed timings on a throttled cadence.

## How The Architecture Fits Together

The key idea is contract boundaries, not folder names.

### Mesh Contract

Runtime objects are loaded from `js/mesh-data/*.mesh.json` and normalized to:

- `format`: `indexed-polygons-v1`
- `positions`: vertex list (`[x, y, z]`)
- `faces`: polygon index list (`[i, j, k, ...]`)
- `edges`: optional edge list (`[i, j]`) auto-derived if omitted
- optional shading metadata: `shadingMode`, `creaseAngleDeg`

This keeps shape definition import-friendly and renderer-agnostic.

### Loader and Discovery

`js/object-system/loader.js` controls mesh discovery and registration.

- `readMeshManifest()` reads `js/object-system/mesh-manifest.json`.
- Mesh assets are loaded from `js/mesh-data/*.mesh.json` and registered as object builders.
- `loadEmbeddedMeshFallback()` loads `js/object-system/mesh-fallback-data.js` for explicit offline/file-protocol fallback.
- `loadScript(src)` loads core registry module with cache busting.
- `window.WireframeObjectsReady` resolves when all mesh assets are loaded.
- Script URLs are cache-busted per session (`?v=<token>`) so module edits are reflected reliably during development.

### Core Scene State

`js/app/core.js` is the runtime state hub.

- `initBackgroundParticles()` seeds animated ambient particles.
- `resize()` syncs canvas sizes and reinitializes background particles.
- `project(p)` performs perspective projection using current zoom and model vertical center.
- `computeFrameParams(vertices)` derives `MODEL_CY` and `Z_HALF` from current geometry.
- `setActiveModel(model, name, vCount, eCount)` updates active mesh and HUD values.
- `getDetailModel(obj)` builds or returns a cached shape for the current LOD bucket.
- `startMorphToObject(obj)` prepares morph endpoints and sampled point sets.
- `getMorphNowVertices(nowMs)` interpolates active morph positions at current time.
- `getModelFrameData(model)` caches transformed/projected vertices per render frame for hot-path reuse.

### Input and Motion

`js/app/input.js` translates pointer input into angular velocities.

- `onDown()`, `onMove()`, `onUp()` manage drag state.
- Wheel handler updates `ZOOM` with clamping.
- Rotation matrix `R` and angular velocities (`wx`, `wy`, `wz`) are consumed by the frame loop.

### UI, Colors, and Theme Propagation

`js/app/ui/controls.js` wires shape, LOD, opacity, and RGB controls.

- `syncRenderToggles()` updates `DETAIL_LEVEL`, `FILL_OPACITY`, and `WIRE_OPACITY`.
- `initObjectSelector()` populates shapes and binds events.

`js/app/ui/theme.js` turns one RGB selection into a complete visual theme.

- `buildCustomTheme(rgbInput)` derives particle, wire, fill-shade, and CSS variable colors.
- `enforceContrast(fg, bg, minRatio)` nudges colors to keep UI contrast readable.
- `initPresetSwatches()` creates clickable swatch buttons.
- `setCustomRgb(rgb, options)` updates state, storage, and active theme.
- `applyPalette()` writes CSS variables on `document.documentElement`.

`js/app/ui/color-utils.js` provides shared math helpers.

- Conversion and formatting: `toRgbCss`, `toRgbaCss`, `toHex`, `hsvToRgb`.
- Color operations: `mixRgb`, `lerpColor`, `rgbA`.
- Perceptual metrics: `relativeLuminance`, `contrastRatio`.

## Rendering Pipeline Deep Dive

### Frame Orchestration

`js/app/render/loop.js` owns the order of operations.

- `frame(nowMs)` updates rotation physics and draws all layers.
- `startApp()` initializes controls and kicks off the animation loop.
- Foreground mode is selected at runtime (`GPU` preferred, `CPU` fallback).
- By default the loop is uncapped (`MAX_FPS = 0`) and FPS is measured from presented frame intervals.

Draw order matters:

1. Background particles.
2. Foreground model rendering (GPU combined pass or CPU fill + wireframe passes).
3. Telemetry HUD updates (`FPS`, `Frame ms`, `Phys ms`, `Bg ms`, `Fg ms`) at a throttled interval.

### GPU Foreground Path

`js/app/render/scene-gpu.js` provides the WebGL foreground renderer.

- Uses compiled shader programs for fill and wire rendering.
- Reuses typed arrays and dynamic buffers for low allocation overhead.
- Supports dynamic geometry updates for morphing (`dynamic: true`).
- Falls back gracefully when context/program setup fails.

### Wireframe Pass

When CPU foreground is active, `js/app/render/wireframe.js` uses three visual sub-passes in `drawWireframeModel(model, alphaScale)`:

- Broad glow lines for soft bloom feel.
- Mid-width glow lines.
- Crisp depth-bucketed lines with color interpolation from near to far.

Depth bucketing is controlled by `DEPTH_BUCKETS` and `Z_HALF`, so edge readability scales with model depth.

### Fill Pass

When CPU foreground is active, `js/app/render/fill.js` does more than just paint triangles.

- `getModelTriangles(model)` normalizes mixed face sizes into triangles.
- `getModelVertexNormals(model, triFaces)` computes and caches outward vertex normals.
- `drawSolidFillModel(model, alphaScale)` does the heavy lifting:
- transforms vertices with the current rotation matrix,
- sorts triangles back-to-front,
- uses smooth shading for dense meshes,
- applies ambient + diffuse + specular (Blinn-Phong style) lighting,
- draws to an offscreen fill layer and composites once to reduce seam artifacts.

### Morph Overlay

`js/app/render/morph.js` contains morph helpers and optional overlay rendering utilities.

- `drawMorphPoints(nowMs, tRaw, t)` draws source-to-target guide lines.
- It renders small streaked particles to communicate motion direction.
- It updates frame parameters from interpolated points so centering and depth stay stable during morph.
- It finalizes morph completion by handing control back to the target model.

Current default loop behavior focuses on direct mesh morph rendering in the main foreground path.

## Mesh Data and Detail Scaling

Current shape library is defined in `js/object-system/mesh-manifest.json` and stored as JSON meshes in `js/mesh-data/`.

LOD currently comes from pre-exported mesh snapshots (for example `low/mid/high`) selected by the detail slider. This keeps runtime cost predictable and avoids expensive procedural rebuilds in the browser.

### Object Catalog (Quick Reference)

| Shape Group | Examples | Detail Strategy | Cost Profile |
| --- | --- | --- | --- |
| Revolved surfaces | `sphere`, `cone`, `cylinder`, `wineGlass` | Explicit min/max stack/segment interpolation | Low -> medium; predictable |
| Tubular parametrics | `torus`, `torusKnot`, `spring`, `cinquefoilKnot`, `mobiusStrip` | Curve segment and tube-side scaling | Medium -> high with dense curve sampling |
| Subdivided polyhedra | `cube`, `tetrahedron`, `icosahedron`, `pyramid`, `octahedron` | Iteration thresholds mapped from slider | Stepwise growth; can jump per tier |
| Faceted solids | `diamond`, `prism`, `starPrism` | Discrete facet count / fixed topology variants | Low -> medium |
| Fractal solids | `mengerSponge`, `sierpinskiTetrahedron`, `sierpinskiPyramid`, `jerusalemCube` | Pre-exported LOD mesh snapshots | Stable runtime cost |
| Curve-as-solid | `hilbertCurve` | Pre-exported LOD mesh snapshots | Stable runtime cost |

Notes:
- For dense shapes, prefer authoring additional offline LOD meshes rather than procedural runtime generation.
- Keep silhouette identity stable across LODs; vary tessellation density rather than core proportions.

## Adding A New Shape

1. Create `js/mesh-data/my-shape.mesh.json` using `indexed-polygons-v1` format.
2. Add entry to `js/object-system/mesh-manifest.json`:

```json
{ "name": "My Shape", "file": "my-shape.mesh.json" }
```

3. Include `lods` entries in the mesh file (`low/mid/high`) to support detail slider selection.
4. Reload the app and confirm it appears in the shape selector.

## Performance Notes

- Model cache in `core.js` avoids rebuilding same shape/LOD repeatedly.
- Fill pass caches triangulation and vertex normals on model objects.
- Frame-level transform/projection cache (`getModelFrameData`) reduces repeated math in CPU passes.
- GPU path uses buffer updates and typed-array reuse for dynamic geometry.
- Rotation matrix is re-orthogonalized periodically in `frame()` to prevent drift.
- Offscreen fill compositing helps avoid visible alpha seam accumulation.
- Telemetry HUD uses EMA smoothing and throttled DOM updates to stay informative with low overhead.

## Major Upgrade Summary

- Rendering pipeline upgraded with robust n-gon triangulation (ear clipping), shading policy metadata, and crease-angle corner normal handling.
- CPU and GPU fill paths now share consistent normal/shading assumptions for better visual parity.
- Runtime moved to mesh-first object definitions (`js/mesh-data/*.mesh.json`) discovered through `js/object-system/mesh-manifest.json`.
- Legacy JS object-shape modules were removed in favor of canonical JSON mesh assets.
- Explicit embedded fallback map was reinstated so direct `index.html` (`file://`) runs still work.

## Troubleshooting

- `Shape list empty`:
- In HTTP mode, ensure `js/object-system/mesh-manifest.json` plus `js/mesh-data/*.mesh.json` are present and valid.
- In `file://` mode, ensure `js/object-system/mesh-fallback-data.js` exists and contains embedded entries.
- `App says failed to load`: Check the browser console and network tab for missing script paths.
- `LOD slider has no effect`: Ensure your mesh file includes multiple `lods` entries with distinct `detail` values.
