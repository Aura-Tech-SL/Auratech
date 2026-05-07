import { test, expect } from "@playwright/test";

/**
 * Security-header regression tests. These caught real bugs in the past
 * (CSP accidentally widened, X-Frame-Options dropped during a refactor).
 * Run via `request` so they're fast — no browser needed.
 */

test("security headers are present on the home page", async ({ request }) => {
  const res = await request.get("/ca");
  expect(res.ok()).toBeTruthy();

  const headers = res.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["permissions-policy"]).toContain("geolocation=()");
});

test("sitemap.xml is served", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["content-type"]).toMatch(/xml/);
});

test("robots.txt is served", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBeTruthy();
});
