import { XMLParser } from "fast-xml-parser";

// Shared RSS 2.0 helpers. Publisher-specific decisions stay in the adapters.

const FETCH_TIMEOUT_MS = 10_000;

export type RssItem = {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
};

export async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "PhoenixNewsBot/0.1 (+RSS reader)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Feed request failed: HTTP ${response.status}`);
  }
  return response.text();
}

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (name) => name === "item",
});

function text(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) {
    return text((value as { "#text": unknown })["#text"]);
  }
  return undefined;
}

export function parseRssItems(xml: string): RssItem[] {
  const doc = parser.parse(xml);
  const items: unknown[] = doc?.rss?.channel?.item ?? [];
  if (!doc?.rss?.channel) throw new Error("Not an RSS 2.0 feed");

  return items.map((raw) => {
    const item = raw as Record<string, unknown>;
    return {
      title: text(item.title),
      link: text(item.link),
      guid: text(item.guid),
      pubDate: text(item.pubDate),
    };
  });
}

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

// Parses an RSS date to ISO 8601 (UTC). A date without a time zone is read as Malaysia time (UTC+08:00).
export function parsePublishedAt(value: string): string | undefined {
  const trimmed = value.trim();
  if (!/\b\d{4}\b/.test(trimmed)) return undefined;
  const hasZone = /(z|[+-]\d{2}:?\d{2}|\b(gmt|ut|utc|[a-z]{3}))$/i.test(trimmed);
  const isIso = /^\d{4}-\d{2}-\d{2}/.test(trimmed);
  const withZone = hasZone ? trimmed : `${trimmed}${isIso ? "+08:00" : " +0800"}`;
  const time = Date.parse(withZone);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}
