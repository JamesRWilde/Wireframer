export function assignVerticesToCells(V, minX, minY, minZ, cellSize) {
  const cellMap = new Map();

  const cellKey = (x, y, z) => {
    const gx = Math.floor((x - minX) / cellSize);
    const gy = Math.floor((y - minY) / cellSize);
    const gz = Math.floor((z - minZ) / cellSize);
    return `${gx},${gy},${gz}`;
  };

  for (let i = 0; i < V.length; i++) {
    const [x, y, z] = V[i];
    const key = cellKey(x, y, z);
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key).push(i);
  }

  return cellMap;
}
