// Dynamically generate OBJECTS from meshes/*.obj files
window.OBJECTS = [
  'capsule.obj',
  'cinquefoil-knot.obj',
  'cone.obj',
  'cube.obj',
  'cylinder.obj',
  'diamond.obj',
  'icosahedron.obj',
  'jerusalem-cube.obj',
  'menger-sponge.obj',
  'mobius-strip.obj',
  'octahedron.obj',
  'prism.obj',
  'pyramid.obj',
  'sierpinski-pyramid.obj',
  'sphere.obj',
  'spring.obj',
  'star-prism.obj',
  'torus-knot.obj',
  'torus.obj',
  'wine-glass.obj'
].map(filename => {
  const key = filename.replace(/\.obj$/i, '');
  // Convert to Title Case for display
  const name = key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { key, name, obj: `meshes/${filename}` };
});

// Utility to load OBJ file and parse
window.loadObjMesh = async function(objPath, name) {
  const resp = await fetch(objPath);
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  const objText = await resp.text();
  return toRuntimeMesh(objText, { meshFileName: objPath, meshType: 'OBJ' });
};














