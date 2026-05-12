export function estimateTokenCount(obj: unknown): number {
  return Math.ceil(JSON.stringify(obj).length / 4);
}
