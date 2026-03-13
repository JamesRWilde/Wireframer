export function onMove(cx, cy) {
  if (!globalThis.PHYSICS_STATE?.dragging) return;
  const prevX = typeof globalThis.PHYSICS_STATE.lastPointerX === 'number' ? globalThis.PHYSICS_STATE.lastPointerX : cx;
  const prevY = typeof globalThis.PHYSICS_STATE.lastPointerY === 'number' ? globalThis.PHYSICS_STATE.lastPointerY : cy;
  const dx = cx - prevX, dy = cy - prevY;
  globalThis.PHYSICS_STATE.wy = dx * 0.007;
  globalThis.PHYSICS_STATE.wx = dy * 0.007;
  globalThis.PHYSICS_STATE.lastPointerX = cx;
  globalThis.PHYSICS_STATE.lastPointerY = cy;
}
