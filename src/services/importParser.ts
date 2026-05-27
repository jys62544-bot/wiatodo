export function parseImportText(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\s*(?:(?:\d+\u3001|\d+[.)]\s+)|[-*•]\s*)/, "").trim())
    .filter(Boolean);
}
