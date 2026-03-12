export function readUiState() {
  try {
    const saved = localStorage.getItem(UI_STATE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
