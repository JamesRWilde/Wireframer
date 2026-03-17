// Mutable state object for all worker-related properties
// This uses a mutable object to allow property assignment from importing modules
export const workerState = {
  worker: null,
  workerReady: false,
  workerInitialized: false,
  pendingWorkerParticles: null,
  workerAvailable: false,
};
