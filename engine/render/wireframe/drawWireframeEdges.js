export function drawWireframeEdges({ model, P2, ctx, wireAlpha, edgeColor, shouldDrawEdge }) {
  ctx.lineWidth = 0.1;

  for (const edge of model.E) {
    if (!shouldDrawEdge(edge)) continue;
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = edgeColor;
    ctx.beginPath();
    ctx.moveTo(P2[edge[0]][0], P2[edge[0]][1]);
    ctx.lineTo(P2[edge[1]][0], P2[edge[1]][1]);
    ctx.stroke();
  }
}
