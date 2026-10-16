import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeGNews } from "@/lib/sources/gnews";
import { cleanArticleUrl, cleanTitle, parsePublishedAt } from "@/lib/sources/normalize";

test("cleanTitle strips tags, decodes entities and collapses whitespace", () => {
  assert.equal(cleanTitle("  <b>Maybank</b> &amp; CIMB&#8217;s\n  profits &#x2013; Q3 "), "Maybank & CIMB’s profits – Q3");
});

test("cleanArticleUrl removes utm_* parameters and the fragment, keeping other parameters", () => {
  assert.equal(
    cleanArticleUrl("https://www.thestar.com.my/business/news?id=42&utm_source=gnews&UTM_Medium=x#comments"),
    "https://www.thestar.com.my/business/news?id=42",
  );
  assert.equal(cleanArticleUrl("not a url"), undefined);
});

test("parsePublishedAt keeps explicit time zones and reads zoneless dates as Malaysia time", () => {
  assert.equal(parsePublishedAt("2026-10-16T08:00:00Z"), "2026-10-16T08:00:00.000Z");
  assert.equal(parsePublishedAt("2026-10-16T08:00:00"), "2026-10-16T00:00:00.000Z");
  assert.equal(parsePublishedAt("Fri, 16 Oct 2026 08:00:00 GMT"), "2026-10-16T08:00:00.000Z");
  assert.equal(parsePublishedAt("Fri, 16 Oct 2026 08:00:00"), "2026-10-16T00:00:00.000Z");
  assert.equal(parsePublishedAt("yesterday"), undefined);
});

test("normalizeGNews maps an article to the common Article model", () => {
  const [article] = normalizeGNews({
    articles: [
      {
        title: "BNM maintains D-SIB status &amp; capital requirements",
        url: "https://www.thestar.com.my/business/2026/10/16/bnm?utm_source=gnews#top",
        publishedAt: "2026-10-16T08:00:00Z",
        source: { name: " The Star " },
        description: "ignored",
        image: "https://example.com/ignored.jpg",
      },
    ],
  });

  assert.deepEqual(article, {
    title: "BNM maintains D-SIB status & capital requirements",
    source: "The Star",
    source_url: "https://www.thestar.com.my/business/2026/10/16/bnm?utm_source=gnews#top",
    article_url: "https://www.thestar.com.my/business/2026/10/16/bnm",
    published_at: "2026-10-16T08:00:00.000Z",
    external_id: "https://www.thestar.com.my/business/2026/10/16/bnm",
  });
});

test("normalizeGNews skips articles missing a required field", () => {
  const valid = { title: "Headline", url: "https://example.com/a", publishedAt: "2026-10-16T08:00:00Z", source: { name: "FMT" } };
  const articles = normalizeGNews({
    articles: [
      valid,
      { ...valid, title: "  " },
      { ...valid, url: "not a url" },
      { ...valid, publishedAt: "unknown" },
      { ...valid, source: {} },
    ],
  });
  assert.equal(articles.length, 1);
});

test("normalizeGNews rejects a response without an articles array", () => {
  assert.throws(() => normalizeGNews({ errors: ["quota exceeded"] }), /no articles array/);
});
