/**
 * attachSliderListeners.js - UI Slider Event Binding
 * 
 * PURPOSE:
 *   Attaches input event listeners to all UI sliders (opacity, density, velocity, etc.)
 *   and the LOD (Level of Detail) slider. When sliders change, this module triggers
 *   the appropriate state updates and rendering parameter synchronization.
 * 
 * ARCHITECTURE ROLE:
 *   Called during app initialization (startApp) after DOM elements are available.
 *   Centralizes slider event binding logic to keep startApp focused on orchestration.
 * 
 * WHY SEPARATE:
 *   The LOD slider requires special handling (triggers model decimation), while other
 *   sliders only need to sync render toggles. Separating this logic keeps the code
 *   maintainable and makes it easy to add new sliders in the future.
 */

"use strict";

// Import the function that reads slider values and updates global render parameters
// This syncs FILL_OPACITY, WIRE_OPACITY, BG_DENSITY, etc. from DOM to globals
import { syncRenderToggles }from '@ui/set/syncRenderToggles.js';
import { mark, trace } from '@engine/state/render/forensicLog.js';

/**
 * attachSliderListeners - Binds input event handlers to all UI sliders
 * 
 * @param {Array<{name: string, el: HTMLInputElement}>} sliders - Array of slider descriptors
 *   Each entry has a name (for logging) and el (the DOM input element)
 * @param {HTMLInputElement} lodSlider - The LOD level slider element (may be null)
 * @param {Function} detailLevel - Callback to trigger model decimation (0-1 range)
 *   Called with the normalized LOD value when the LOD slider changes
 * 
 * The function wraps all event handlers in try/catch to prevent a single slider
 * error from breaking the entire UI. Errors are logged but don't crash the app.
 */
export function sliderListeners(sliders, lodSlider, detailLevel) {
  try {
    // Iterate over all standard sliders (fill opacity, wire opacity, bg density, etc.)
    // Each slider gets an 'input' event listener that fires on every value change
    sliders.forEach(({ name, el }) => {
      if (el) {
        // Attach input event listener - fires continuously while dragging
        // We use 'input' rather than 'change' because we want live updates
        el.addEventListener('input', () => {
          try {
            // Sync all slider values to global render parameters
            // This reads FILL_OPACITY, WIRE_OPACITY, BG_DENSITY, etc. from DOM
            mark('slider', 'ui', { name, value: el.value });
            syncRenderToggles();
          } catch (e) {
            // Log but don't throw - allows other sliders to continue working
            console.warn('[startApp] slider syncRenderToggles error', e);
          }
        });
      } else {
        // Warn if a slider element is missing - helps diagnose HTML/DOM issues
        console.warn('[startApp] slider missing', name);
      }
    });

    // LOD slider requires special handling because it triggers model decimation
    // When the LOD value changes, we need to rebuild the mesh at the new detail level
    if (lodSlider) {
      lodSlider.addEventListener('input', () => {
        try {
          const lodPct = Number(lodSlider.value) / 100;
          mark('lod-slider', 'ui', { value: lodSlider.value, pct: lodPct });
          // First, sync the LOD value to global state (like other sliders)
          syncRenderToggles();

          // Then trigger model decimation if the callback is available
          // We divide by 100 because the slider range is 0-100 but the engine expects 0-1
          if (typeof detailLevel === 'function') {
            const decEnd = trace('decimate', 'ui', { pct: lodPct });
            detailLevel(lodPct);
            decEnd({});
          }
        } catch (e) {
          // Log but don't throw - the app can continue at the current LOD
          console.warn('[startApp] lodSlider syncRenderToggles error', e);
        }
      });
    }

    // Debug log showing which sliders were successfully bound
    // Useful for diagnosing initialization order issues
  } catch (e) {
    // Catch-all: if the entire slider setup fails, log but keep the app running
    // Users can still interact via mouse/touch even without slider controls
    console.warn('[startApp] failed to attach slider listeners', e);
  }
}
