import { transformState as state } from "@engine/state/render/vertexTransformBridge.js";

export function workerTransform() { 
  if (state.worker) return true;

  try { 
    state.worker = new Worker(
      new URL('../../state/gpu/vertexTransformWorker.js', import.meta.url).href,
      {  type: 'module'  }
    );
    state.workerAvailable = true;

    state.worker.onmessage = (event) => { 
      const {  type, T, P2, frameId, message  } = event.data;
      if (type === 'transformed') { 
        state.cachedResult = {  T, P2  };
        state.cachedFrameId = frameId;
       } else if (type === 'error') { 
        if (state.errorCount < state.MAX_ERROR_LOGS) { 
          console.warn('[vertexTransformBridge] Worker error:', message);
          state.errorCount++;
         }
       }
     };

    state.worker.onerror = (error) => { 
      if (state.errorCount < state.MAX_ERROR_LOGS) { 
        console.warn('[vertexTransformBridge] Worker error:', error.message);
        state.errorCount++;
       }
     };

    return true;
   } catch (error) { 
    console.warn('[vertexTransformBridge] Worker creation failed:', error.message);
    state.workerAvailable = false;
    return false;
   }
 }
