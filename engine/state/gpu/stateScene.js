/**
 * sceneGpuState.js - GPU Scene Renderer State
 * 
 * PURPOSE:
 *   Shared state for the GPU scene renderer. This file holds the singleton
 *   renderer instance and failure flag that are shared between sceneRenderer,
 *   disposeSceneRenderer, and drawGpuSceneModel.
 * 
 * ARCHITECTURE ROLE:
 *   Extracted to a separate file to avoid circular dependencies between
 *   sceneRenderer.js and disableSceneRenderer.js.
 *
 * WHY THIS EXISTS:
 *   Centralizes GPU scene renderer lifecycle flags in a shared mutable state
 *   container, enabling failover and cleanup logic to read/update status.
 *
 * Uses a mutable object so all modules share the same reference.
 */

/**
 * gpuState - Shared mutable state for GPU scene renderer
 * 
 * This object is imported and mutated directly by GPU modules.
 */
export const gpuState = {
  /** @type {Object|null} The GPU renderer instance (singleton) */
  renderer: null,
  
  /** @type {boolean} Whether GPU renderer initialization failed */
  failed: false,
};
