import { expect, test, type Page } from "@playwright/test";

// Feature tests for the live feed (MVP0 and MVP1). The headlines change every few hours,
// so each test reads what is on the page and checks the rules, not fixed titles or counts.

const items = (page: Page) => page.locator("ol.feed > li.article");
const countLine = (page: Page) => page.locator("p.result-count");

async function times(page: Page): Promise<number[]> {
  const values = await page.locator("ol.feed time").evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
  return values.map((v) => Date.parse(v));
}

// The day a time falls on in Malaysia, as YYYY-MM-DD (the tests run in that time zone).
const malaysiaDay = (ms: number) => new Date(ms + 8 * 3_600_000).toISOString().slice(0, 10);

test.describe("feed", () => {
  test("loads 50 headlines, newest first, with source, time and a count line", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Watchtower" })).toBeVisible();
    await expect(items(page)).toHaveCount(50);
    await expect(countLine(page)).toHaveText(/^Showing 1–50 of [\d,]+ headlines$/);
    const t = await times(page);
    for (let i = 1; i < t.length; i++) expect(t[i]).toBeLessThanOrEqual(t[i - 1]);
    const first = items(page).first();
    await expect(first.locator(".meta")).toContainText("·");
    await expect(first.locator("time")).not.toBeEmpty();
  });

  test("headlines open the publisher's page in a new tab", async ({ page }) => {
    await page.goto("/");
    const link = items(page).first().locator("a");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("href", /^https?:\/\//);
  });

  test("page size 100 and pagination keep working", async ({ page }) => {
    await page.goto("/");
    await page.locator("label.page-size select").selectOption("100");
    await expect(page).toHaveURL(/size=100/);
    await expect(items(page)).toHaveCount(100);
    await page.getByRole("navigation", { name: "Pages" }).getByRole("link", { name: "2", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(countLine(page)).toHaveText(/^Showing 101–200 of /);
  });

  test("oldest first lists the earliest headline first", async ({ page }) => {
    await page.goto("/");
    await page.locator("label.sort select").selectOption("oldest");
    await expect(page).toHaveURL(/sort=oldest/);
    const t = await times(page);
    expect(t.length).toBeGreaterThan(1);
    for (let i = 1; i < t.length; i++) expect(t[i]).toBeGreaterThanOrEqual(t[i - 1]);
  });
});

test.describe("dates", () => {
  test("picking From and To shows only that day's headlines", async ({ page }) => {
    await page.goto("/");
    // A day that has headlines: the day of the 10th newest one.
    const day = malaysiaDay((await times(page))[9]);
    const [from, to] = [page.locator(".date-filter input").nth(0), page.locator(".date-filter input").nth(1)];
    await from.fill(day);
    await from.blur();
    await expect(page).toHaveURL(new RegExp(`from=${day}`));
    await to.fill(day);
    await to.blur();
    await expect(page).toHaveURL(new RegExp(`to=${day}`));
    const t = await times(page);
    expect(t.length).toBeGreaterThan(0);
    for (const ms of t) expect(malaysiaDay(ms)).toBe(day);
  });

  test("From after To shows the wrong-order message and no list", async ({ page }) => {
    await page.goto("/?from=2026-11-10&to=2026-11-09&tz=Asia%2FKuala_Lumpur");
    await expect(page.locator("p[role=alert]")).toHaveText("From date must be on or before To date.");
    await expect(page.locator("ol.feed")).toHaveCount(0);
  });

  test("dates with no headlines show the keyboard-warriors message", async ({ page }) => {
    await page.goto("/?from=2026-03-15&to=2026-03-15&tz=Asia%2FKuala_Lumpur");
    await expect(page.getByText("Our keyboard warriors are working hard to add more news for you.")).toBeVisible();
    await expect(page.locator("ol.feed")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Pages" })).toHaveCount(0);
  });
});

test.describe("search", () => {
  test("a word from the newest headline finds it", async ({ page }) => {
    await page.goto("/");
    const title = (await items(page).first().locator("a").textContent()) ?? "";
    const word = title
      .split(/[^A-Za-z]+/)
      .filter((w) => w.length >= 5)
      .sort((a, b) => b.length - a.length)[0];
    test.skip(!word, `No word of 5+ letters in "${title}"`);
    await page.getByRole("searchbox").fill(word);
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(new RegExp(`q=${word}`));
    await expect(items(page).first().locator("a")).toHaveText(title);
  });

  test("no match shows the magnifying-glass message, and Clear search works", async ({ page }) => {
    await page.goto("/?q=zzqxwvnomatch");
    await expect(page.getByText("No headlines match “zzqxwvnomatch”.")).toBeVisible();
    await page.getByRole("link", { name: "Clear search" }).click();
    await expect(page).not.toHaveURL(/q=/);
    await expect(items(page)).toHaveCount(50);
  });

  test("a search over 200 characters is refused", async ({ page }) => {
    await page.goto(`/?q=${"a".repeat(201)}`);
    await expect(page.locator("p[role=alert]")).toHaveText("Search is limited to 200 characters.");
  });
});

test.describe("sources", () => {
  test("ticking a publisher lists only its headlines, with a matching count", async ({ page }) => {
    await page.goto("/");
    const dropdown = page.locator("details.source-filter");
    await expect(dropdown.locator("summary")).toHaveText("Sources: All");
    await dropdown.locator("summary").click();
    const first = dropdown.locator(".source-list label").first();
    const [, name, count] = ((await first.textContent()) ?? "").trim().match(/^(.*) \((\d+)\)$/) ?? [];
    expect(name, "publisher label reads 'Name (count)'").toBeTruthy();
    await first.locator("input").check();
    await expect(page).toHaveURL(/source=/);
    await expect(dropdown.locator("summary")).toHaveText(`Sources: ${name}`);
    const total = Number(count);
    await expect(countLine(page)).toHaveText(new RegExp(`of ${total.toLocaleString("en-US")} headlines?$`));
    for (const meta of await items(page).locator(".meta").allTextContents()) expect(meta.startsWith(`${name} ·`)).toBe(true);
  });

  test("Escape closes the Sources dropdown", async ({ page }) => {
    await page.goto("/");
    const dropdown = page.locator("details.source-filter");
    await dropdown.locator("summary").click();
    await expect(dropdown).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(dropdown).not.toHaveAttribute("open", "");
  });
});

test("Clear all returns to page 1 of the full feed, keeping the page size", async ({ page }) => {
  await page.goto("/?sort=oldest&q=malaysia&size=100&page=2");
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page).toHaveURL(/\/\?page=1&size=100$/);
  await expect(page.getByRole("button", { name: "Clear all" })).toHaveCount(0);
  await expect(countLine(page)).toHaveText(/^Showing 1–100 of /);
});

test("works on a phone: no sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(items(page).first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page is wider than the phone screen").toBeLessThanOrEqual(0);
});
