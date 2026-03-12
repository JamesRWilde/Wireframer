const UI_STATE_KEY = 'wireframer.uiState';

export function readUiState() {
  try {
    let saved = localStorage.getItem(UI_STATE_KEY);
    if (!saved) {
      // legacy bug: we used to pass undefined as the key, so look there too
      saved = localStorage.getItem('undefined');
    }
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
