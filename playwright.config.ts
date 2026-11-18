import { defineConfig, devices } from "@playwright/test";

// Feature tests (e2e/) click through a running Watchtower site like a visitor would.
// They only read: no test writes to the database. SITE_URL picks the site; the live site is the default.
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.SITE_URL ?? "https://watchtower01.vercel.app",
    // A fixed time zone, so the date tests know where each day starts (MVP1-S4).
    timezoneId: "Asia/Kuala_Lumpur",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } }],
});
