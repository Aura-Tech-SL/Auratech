import { test, expect } from "@playwright/test";

/**
 * Smoke tests — the bare minimum that has to keep working. If these fail,
 * the deploy is broken. Keep this file fast and resilient: assert structure,
 * not copy. Copy lives in the CMS and changes weekly.
 */

test("home renders in CA and contains brand mark", async ({ page }) => {
  await page.goto("/ca");
  await expect(page).toHaveTitle(/Auratech/i);
  await expect(page.locator("header")).toBeVisible();
});

test("home renders in EN", async ({ page }) => {
  const res = await page.goto("/en");
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("header")).toBeVisible();
});

test("home renders in ES", async ({ page }) => {
  const res = await page.goto("/es");
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("header")).toBeVisible();
});

test("/serveis loads", async ({ page }) => {
  const res = await page.goto("/ca/serveis");
  expect(res?.ok()).toBeTruthy();
});

test("/contacte renders form", async ({ page }) => {
  await page.goto("/ca/contacte");
  await expect(page.locator("form").first()).toBeVisible();
});

test("/login renders", async ({ page }) => {
  const res = await page.goto("/login");
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("input[type=email], input[name=email]").first()).toBeVisible();
});

test("admin without session redirects (no leak)", async ({ page }) => {
  const res = await page.goto("/admin");
  // Either a 401/403 page or a redirect to /login is acceptable.
  // What's NOT acceptable: 200 with admin UI rendered.
  const url = page.url();
  expect(url).not.toMatch(/\/admin\/?$/);
});

test("404 returns 404", async ({ page }) => {
  const res = await page.goto("/ca/this-page-does-not-exist-zzz");
  expect(res?.status()).toBe(404);
});
