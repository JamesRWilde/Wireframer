;

export function fillCachedFrame() {
  return state.cachedImageBitmap ? { imageBitmap: state.cachedImageBitmap, frameId: state.cachedFrameId } : null;
}
