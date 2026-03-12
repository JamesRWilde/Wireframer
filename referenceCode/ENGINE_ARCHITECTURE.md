# Engine-First 3D Pipeline Architecture

## Overview
- The engine is the sole authority for mesh structure and processing.
- Only point clouds are accepted as input; all mesh, face, and edge generation is performed internally.
- No legacy mesh/face/vertex input or compatibility code remains.
- The pipeline is modular and explicit:
  1. Point cloud input
  2. Polygonization (engine-owned)
  3. Mesh/edge/face construction
  4. LOD/decimation (engine-owned)
  5. Shading, normals, and rendering (engine-owned)

## Module Responsibilities
- **core.js**: Entry point, mesh/LOD/polygonization logic, global model state
- **fill/**: Triangulation, normals, lighting, and solid fill rendering (engine-owned mesh only)
- **shading/**: GPU/CPU rendering, buffers, and draw logic (engine-owned mesh only)
- **morph.js**: Morphing between engine-owned mesh states only
- **wireframe.js**: Wireframe rendering (engine-owned mesh only)
- **ui/controls.js**: UI only interacts with engine entry point and mesh structure
- **loader.js**: Registers only point cloud shapes

## Enforcement
- All modules must operate on the engine-owned mesh structure (V, F, E arrays)
- No mesh/face/vertex input or manipulation outside the engine
- No schema negotiation, legacy, or compatibility code
- All UI, controls, and animation use only the new engine entry point

## Extending
- New shapes must be defined as point clouds and registered with the engine
- All mesh processing, LOD, and rendering logic must remain engine-internal

---
This document is enforced as the architectural contract for all future development.
