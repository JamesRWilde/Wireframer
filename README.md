# Wireframer

Wireframer is an interactive 3D wireframe viewer that renders solid-shaded and depth-aware wireframe models simultaneously in the browser. Built with vanilla JavaScript and a modular engine-first architecture, it provides real-time rotation, morphing between objects, and extensive visual customization.

## Features

- **Dual Rendering**: Solid shading and wireframe overlays rendered together with depth-aware line bucketing
- **20 Parametric Objects**: Including fractal-inspired shapes (Menger sponge, Sierpinski pyramid, Jerusalem cube)
- **Real-time Morphing**: Smooth transitions between objects using sampled point correspondences
- **GPU/CPU Fallback**: Automatic selection of WebGL GPU path with graceful CPU fallback
- **LOD Control**: Live detail scaling with model regeneration and caching
- **Custom Theming**: RGB color controls with preset swatches, persistence, and contrast enforcement
- **Background Particles**: Animated ambient particles with density, velocity, and opacity controls
- **Performance Telemetry**: Live FPS, frame time, physics, and rendering stats

## Quick Start

### Prerequisites

- Node.js (for the development server)
- Modern browser with WebGL support

### Running the App

```powershell
# Install dependencies
npm install

# Start the development server
npm start
```

Open `http://localhost:3000` in your browser.

### Alternative: Static File Server

```powershell
python -m http.server 5500
# or
npx serve . -l 5500
```

## Controls

| Input | Action |
|-------|--------|
| Mouse drag / Touch | Rotate model |
| Scroll wheel | Zoom in/out |
| Shape selector | Choose 3D object |
| LOD slider | Adjust model detail level |
| Fill opacity | Control solid shading visibility |
| Wire opacity | Control wireframe visibility |
| Background controls | Particle density, velocity, opacity |
| RGB sliders | Custom color theming |
| Theme mode | Dark / Light |

## Architecture

Wireframer uses an **engine-first architecture** where the engine is the sole authority for mesh structure and processing. All mesh, face, and edge generation is performed internally by the engine.

### Directory Structure

```
Wireframer/
├── index.html              # Entry point, loads scripts in order
├── server.js               # Express development server
├── registry.js             # Object registry (engine-defined schema only)
├── loader.js               # OBJ mesh loader and object list
├── style.css               # Application styles
├── engine/                 # Core rendering engine
│   ├── core/               # Model state, canvas init, main loop
│   │   ├── loop/           # Frame loop, rendering paths, physics
│   │   ├── modelState.js   # Active model management
│   │   └── initCanvas.js   # Canvas setup
│   ├── fill/               # CPU solid-fill rendering
│   │   ├── triangulation.js
│   │   ├── getModelTriangles.js
│   │   └── pointInTriangle.js
│   ├── math/               # 3D math utilities
│   │   └── math3d/         # Rotation matrices, projections
│   ├── mesh/               # Mesh processing
│   │   ├── loader/         # Mesh loading utilities
│   │   ├── parsing/        # OBJ parsing
│   │   ├── lod/            # Level-of-detail
│   │   └── utils/          # Mesh utilities
│   ├── morph/              # Object morphing system
│   │   ├── morphing/       # Morph algorithms
│   │   ├── morphState.js   # Morph state management
│   │   └── utils/          # Morph utilities
│   ├── physics/            # Input and rotation physics
│   │   ├── input/          # Mouse/touch input handling
│   │   └── physicsState.js # Rotation velocity state
│   ├── render/             # Rendering subsystems
│   │   ├── background/     # Particle background
│   │   ├── camera/         # Camera/projection
│   │   ├── fill/           # Fill rendering
│   │   ├── gpu/            # WebGL GPU path
│   │   └── wireframe/      # Wireframe rendering
│   └── utils/              # Shared utilities
├── meshes/                 # OBJ mesh files (*.obj)
├── loader/                 # Mesh loading helpers
│   ├── loadObjMesh.js      # OBJ file loader
│   └── objectList.js       # Available objects list
└── ui/                     # User interface
    ├── controls/           # UI controls (sliders, selectors)
    ├── theme/              # Color theming system
    ├── color-utils/        # Color math utilities
    ├── stat-setters/       # Performance stat display
    ├── dom-state.js        # DOM element references
    └── statsState.js       # Stats state management
```

### Key Architectural Principles

1. **Engine-First Processing**: All mesh operations (polygonization, LOD, normals) are owned by the engine
2. **Point Cloud Input**: Shapes are defined as point clouds; the engine generates all mesh structure
3. **Module Isolation**: Each file contains a single function or focused responsibility
4. **No Build Step**: Runtime JavaScript with ES modules, no bundler required
5. **Contract Boundaries**: Clear interfaces between subsystems (mesh contract, render contract)

### Runtime Flow

1. `index.html` loads scripts in order: `registry.js` → `loader.js` → engine modules
2. `registry.js` initializes the object registry with engine-defined schema
3. `loader.js` loads OBJ meshes and registers them with the engine
4. `engine/core/loop/startApp.js` initializes controls and starts the animation loop
5. Each frame: update physics → render background particles → render foreground (GPU or CPU) → update telemetry

### Rendering Pipeline

**GPU Path** (WebGL):
- Compiled shader programs for fill and wire rendering
- Dynamic buffer updates for morphing
- Automatic fallback on context/program failure

**CPU Path** (Canvas 2D):
- Back-to-front triangle sorting
- Blinn-Phong lighting (ambient + diffuse + specular)
- Depth-bucketed wireframe with color interpolation
- Offscreen fill layer compositing to reduce artifacts

### Mesh Contract

All meshes conform to the engine's internal format:
- `V`: Vertex positions array `[[x, y, z], ...]`
- `F`: Face index arrays `[[i, j, k, ...], ...]`
- `E`: Edge index pairs `[[i, j], ...]`

### Adding New Objects

1. Create an OBJ file in `meshes/`
2. Add the filename to `loader/objectList.js`
3. The object automatically appears in the shape selector

## Development

### Code Conventions

- One function per file
- ES modules with explicit imports
- No global state except for engine-managed globals (`MODEL`, `PHYSICS_STATE`, etc.)
- Descriptive function names over comments

### Key Globals

| Global | Purpose |
|--------|---------|
| `MODEL` | Currently active mesh object |
| `PHYSICS_STATE` | Rotation velocities and auto-rotation settings |
| `ZOOM` | Current zoom level |
| `R` | Rotation matrix |
| `OBJECTS` | Registered mesh objects array |

## License

This project is provided as-is for educational and personal use.

