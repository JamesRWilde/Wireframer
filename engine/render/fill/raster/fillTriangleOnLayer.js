export function fillTriangleOnLayer(ctx2d, tri2d, shadeColor) {
  ctx2d.beginPath();
  ctx2d.moveTo(tri2d[0][0], tri2d[0][1]);
  ctx2d.lineTo(tri2d[1][0], tri2d[1][1]);
  ctx2d.lineTo(tri2d[2][0], tri2d[2][1]);
  ctx2d.closePath();
  ctx2d.fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
  ctx2d.fill();
}
