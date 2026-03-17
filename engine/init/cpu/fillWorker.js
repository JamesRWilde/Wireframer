;

export function fillWorker(width, height) {
  if (state.worker) return true;

  if (typeof OffscreenCanvas === 'undefined') {
    console.warn('[fillRenderBridge] OffscreenCanvas not supported');
    state.workerAvailable = false;
    return false;
  }

  try {
    state.offscreenCanvas = new OffscreenCanvas(width, height);

    state.worker = new Worker(
      new URL(''./fill-render-worker.js', import.meta.url).href,
      { type: 'module' }
    );
    state.workerAvailable = true;

    state.worker.onmessage = (event) => {
      const { type, imageBitmap, frameId, message } = event.data;
      if (type === 'ready') {
        state.workerReady = true;
      } else if (type === 'rendered') {
        if (state.cachedImageBitmap) state.cachedImageBitmap.close();
        state.cachedImageBitmap = imageBitmap;
        state.cachedFrameId = frameId;
      } else if (type === 'error') {
        if (state.errorCount < state.MAX_ERROR_LOGS) {
          console.warn('[fillRenderBridge] Worker error:', message);
          state.errorCount++;
        }
      }
    };

    state.worker.onerror = (error) => {
      if (state.errorCount < state.MAX_ERROR_LOGS) {
        console.warn('[fillRenderBridge] Worker error:', error.message);
        state.errorCount++;
      }
    };

    state.worker.postMessage(
      { type: 'init', canvas: state.offscreenCanvas, width, height },
      [state.offscreenCanvas]
    );

    return true;
  } catch (error) {
    console.warn('[fillRenderBridge] Initialization failed:', error.message);
    state.workerAvailable = false;
    return false;
  }
}
