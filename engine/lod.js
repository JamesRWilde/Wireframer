// engine/lod.js
// Pure utility for mesh decimation and LOD operations
'use strict';

class LODManager {
  static MIN_VERTS = 3;

  static deepCopyMesh(model) {
    return {
      V: model.V.map(v => v.slice()),
      F: model.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
      E: model.E ? model.E.map(e => e.slice()) : [],
      _meshFormat: model._meshFormat,
      _shadingMode: model._shadingMode,
      _creaseAngleDeg: model._creaseAngleDeg,
      groups: model.groups ? model.groups.slice() : undefined,
      objects: model.objects ? model.objects.slice() : undefined,
      smoothingGroups: model.smoothingGroups ? model.smoothingGroups.slice() : undefined,
      triangleNormals: model.triangleNormals ? model.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
      triangleUVs: model.triangleUVs ? model.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
    };
  }

  static decimateMeshByPercent(model, percent) {
    if (!model || !Array.isArray(model.V) || model.V.length < LODManager.MIN_VERTS) return LODManager.deepCopyMesh(model);
    const faceCount = model.F.length;
    const minFaces = Math.max(LODManager.MIN_VERTS, 4);
    const targetFaces = Math.max(minFaces, Math.round(percent * faceCount));
    if (targetFaces >= faceCount) {
      return LODManager.deepCopyMesh(model);
    }

    return LODManager.greedyClusterDecimator(model, targetFaces);
  }

  static greedyClusterDecimator(model, targetFaces) {
    const cacheKey = `${model.V.length}:${targetFaces}`;
    if (!model._lodCache) model._lodCache = new Map();
    if (model._lodCache.has(cacheKey)) {
      return LODManager.deepCopyMesh(model._lodCache.get(cacheKey));
    }
    const V = model.V;
    // Support both array-of-arrays and array-of-objects with .indices
    const F = Array.isArray(model.F) && typeof model.F[0] === 'object' && model.F[0].indices ? model.F.map(f => f.indices) : model.F;
    // Bounding box
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const [x, y, z] of V) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
    // Choose cluster resolution proportional to target faces
    const clusterCount = Math.max(2, Math.cbrt(targetFaces * 2));
    const cellSize = extent / clusterCount;
    const cellMap = new Map();

    function cellKey(x, y, z) {
      const gx = Math.floor((x - minX) / cellSize);
      const gy = Math.floor((y - minY) / cellSize);
      const gz = Math.floor((z - minZ) / cellSize);
      return `${gx},${gy},${gz}`;
    }

    // Assign vertices to cells
    for (let i = 0; i < V.length; i++) {
      const key = cellKey(V[i][0], V[i][1], V[i][2]);
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key).push(i);
    }

    const oldToNew = new Map();
    const newVerts = [];
    for (const [key, indices] of cellMap.entries()) {
      if (!indices.length) continue;
      let sx = 0, sy = 0, sz = 0;
      for (const idx of indices) {
        sx += V[idx][0]; sy += V[idx][1]; sz += V[idx][2];
      }
      const newIdx = newVerts.length;
      newVerts.push([sx / indices.length, sy / indices.length, sz / indices.length]);
      for (const idx of indices) oldToNew.set(idx, newIdx);
    }

    // Rebuild faces and drop degenerate triangles
    const newFaces = [];
    for (const face of F) {
      const tri = face.map(idx => oldToNew.get(idx));
      if (tri.includes(undefined)) continue;
      if ((new Set(tri)).size === 3) newFaces.push(tri);
    }

    const newEdges = window.buildEdgesFromFacesRuntime ? window.buildEdgesFromFacesRuntime(newFaces) : [];
    const decimated = {
      V: newVerts,
      F: newFaces,
      E: newEdges,
      _meshFormat: model._meshFormat,
      _shadingMode: model._shadingMode,
      _creaseAngleDeg: model._creaseAngleDeg,
    };
    model._lodCache.set(cacheKey, decimated);
    if (model._lodCache.size > 12) {
      const firstKey = model._lodCache.keys().next().value;
      model._lodCache.delete(firstKey);
    }
    return LODManager.deepCopyMesh(decimated);
  }

  // Helper utilities for quadrics, adjacency, edge costs
  static zeroQuadric() {
    return [0,0,0,0,0,0,0,0,0,0];
  }

  static faceQuadric(a, b, c) {
    const normal = LODManager.normalize(LODManager.cross(
      [b[0]-a[0], b[1]-a[1], b[2]-a[2]],
      [c[0]-a[0], c[1]-a[1], c[2]-a[2]]
    ));
    const d = -LODManager.dot(normal, a);
    const [nx, ny, nz] = normal;
    // Return A,B,C,D terms for Kp matrix simplified
    return [nx*nx, nx*ny, nx*nz, nx*d, ny*ny, ny*nz, ny*d, nz*nz, nz*d, d*d];
  }

  static addQuadrics(q1, q2) {
    return q1.map((value, idx) => value + q2[idx]);
  }

  static edgeCost(v1, v2) {
    const pos = LODManager.optimalPosition(v1, v2);
    return LODManager.evaluateQuadric(v1.quadric, pos) + LODManager.evaluateQuadric(v2.quadric, pos);
  }

  static optimalPosition(v1, v2) {
    // Simple midpoint; full QEM solver would invert matrix, but midpoint keeps stability
    return [
      (v1.position[0] + v2.position[0]) / 2,
      (v1.position[1] + v2.position[1]) / 2,
      (v1.position[2] + v2.position[2]) / 2,
    ];
  }

  static evaluateQuadric(q, p) {
    const [x, y, z] = p;
    const [a, b, c, d, e, f, g, h, i, j] = q;
    return a*x*x + 2*b*x*y + 2*c*x*z + 2*d*x + e*y*y + 2*f*y*z + 2*g*y + h*z*z + 2*i*z + j;
  }

  static buildAdjacency(faces, vertCount) {
    const adj = new Array(vertCount).fill(0).map(() => new Set());
    for (const [a, b, c] of faces) {
      adj[a].add(b); adj[a].add(c);
      adj[b].add(a); adj[b].add(c);
      adj[c].add(a); adj[c].add(b);
    }
    return adj;
  }

  static collectEdges(adjacency) {
    const edges = [];
    adjacency.forEach((neighbors, idx) => {
      neighbors.forEach((neighbor) => {
        if (idx < neighbor) edges.push([idx, neighbor]);
      });
    });
    return edges;
  }

  static updateAdjacency(adjacency, u, v) {
    adjacency[v].forEach((neighbor) => {
      if (neighbor !== u) {
        adjacency[neighbor].delete(v);
        adjacency[neighbor].add(u);
        adjacency[u].add(neighbor);
      }
    });
    adjacency[v].clear();
  }

  static dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  static cross(a, b) {
    return [
      a[1]*b[2] - a[2]*b[1],
      a[2]*b[0] - a[0]*b[2],
      a[0]*b[1] - a[1]*b[0],
    ];
  }

  static normalize(v) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]) || 1;
    return [v[0]/len, v[1]/len, v[2]/len];
  }
}

window.LODManager = LODManager;
