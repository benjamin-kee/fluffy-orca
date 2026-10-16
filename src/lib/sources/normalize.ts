// Shared normalization helpers. Source-specific decisions stay in the adapters.

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
};

// Plain-text headline: strips tags, decodes entities, collapses whitespace.
export function cleanTitle(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === "#") {
        const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : match;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

// Removes utm_* tracking parameters and any #fragment. Returns undefined for invalid URLs.
export function cleanArticleUrl(value: string): string | undefined {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return undefined;
  }
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
  }
  url.hash = "";
  return url.toString();
}

// Parses a date to ISO 8601 (UTC). A date without a time zone is read as Malaysia time (UTC+08:00).
export function parsePublishedAt(value: string): string | undefined {
  const trimmed = value.trim();
  if (!/\b\d{4}\b/.test(trimmed)) return undefined;
  const hasZone = /(z|[+-]\d{2}:?\d{2}|\b(gmt|ut|utc|[a-z]{3}))$/i.test(trimmed);
  const isIso = /^\d{4}-\d{2}-\d{2}/.test(trimmed);
  const withZone = hasZone ? trimmed : `${trimmed}${isIso ? "+08:00" : " +0800"}`;
  const time = Date.parse(withZone);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}
