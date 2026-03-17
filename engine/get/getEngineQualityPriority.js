export function getEngineQualityPriority(quality) {
  switch (quality) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}
