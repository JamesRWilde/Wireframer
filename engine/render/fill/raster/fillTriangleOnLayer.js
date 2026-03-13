export function fillTriangleOnLayer(ctx2d, tri2d, shadeColor) {
  // Accepts optional alpha as 4th argument
  let alpha = 1;
  if (arguments.length > 3 && typeof arguments[3] === 'number') {
    alpha = arguments[3];
  }
  ctx2d.beginPath();
  ctx2d.moveTo(tri2d[0][0], tri2d[0][1]);
  ctx2d.lineTo(tri2d[1][0], tri2d[1][1]);
  ctx2d.lineTo(tri2d[2][0], tri2d[2][1]);
  ctx2d.closePath();
  ctx2d.fillStyle = `rgba(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]}, ${alpha})`;
  ctx2d.fill();
}
