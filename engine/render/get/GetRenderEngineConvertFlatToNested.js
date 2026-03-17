export function GetRenderEngineConvertFlatToNested(flatT, flatP2, vertexCount) {
  const T = new Array(vertexCount);
  const P2 = new Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) {
    const ti = i * 3;
    const pi = i * 2;
    T[i] = [flatT[ti], flatT[ti + 1], flatT[ti + 2]];
    P2[i] = [flatP2[pi], flatP2[pi + 1]];
  }
  return { T, P2 };
}
