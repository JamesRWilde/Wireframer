import { syncRenderToggles } from '../../../ui/controls/syncRenderToggles.js';

export function attachSliderListeners(sliders, lodSlider, setDetailLevel) {
  try {
    sliders.forEach(({ name, el }) => {
      if (el) {
        el.addEventListener('input', () => {
          try {
            syncRenderToggles();
          } catch (e) {
            console.warn('[startApp] slider syncRenderToggles error', e);
          }
        });
      } else {
        console.warn('[startApp] slider missing', name);
      }
    });

    // LOD slider needs special handling to trigger decimation
    if (lodSlider) {
      lodSlider.addEventListener('input', () => {
        try {
          syncRenderToggles();
          if (typeof setDetailLevel === 'function') {
            setDetailLevel(Number(lodSlider.value) / 100);
          }
        } catch (e) {
          console.warn('[startApp] lodSlider syncRenderToggles error', e);
        }
      });
    }

    console.debug('[startApp] attached slider listeners', sliders.map((s) => s.name));
  } catch (e) {
    console.warn('[startApp] failed to attach slider listeners', e);
  }
}
