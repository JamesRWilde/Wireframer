import { OBJECTS } from '../../loader/objectList.js';

export function initObjectSelector() {
  console.debug('[initObjectSelector] called, OBJECTS length', OBJECTS.length);
  const select = document.getElementById('obj-select');
  if (!select) {
    console.debug('[initObjectSelector] select element not found');
    return;
  }
  select.innerHTML = '';
  // OBJ-only: populate selector and wire up events
  OBJECTS.forEach((obj, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = obj.name;
    select.appendChild(opt);
  });

  // Auto-load the first object on init
  if (OBJECTS.length > 0 && typeof globalThis.loadObjMesh === 'function') {
    select.selectedIndex = 0;
    console.debug('[initObjectSelector] auto-loading first object', OBJECTS[0].name);
    globalThis.loadObjMesh(OBJECTS[0].obj, OBJECTS[0].name);
  }

  select.addEventListener('change', () => {
    const idx = Number(select.value);
    console.debug('[initObjectSelector] selection changed', idx);
    if (Number.isInteger(idx) && idx >= 0 && idx < OBJECTS.length) {
      globalThis.loadObjMesh(OBJECTS[idx].obj, OBJECTS[idx].name);
    }
  });
}
