import { expect, test } from "@playwright/test";

test("home renders masthead and article links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /velvet collapse/i }).first()).toBeVisible();
  await expect(page.locator('a[href^="/article/"]').first()).toBeVisible();
});

test("clicking an article opens the article page", async ({ page }) => {
  await page.goto("/");
  await page.locator('a[href^="/article/"]').first().click();
  await expect(page).toHaveURL(/\/article\//);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("search overlay returns results and navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).first().click();
  const input = page.getByPlaceholder(/search articles/i);
  await expect(input).toBeVisible();
  await input.fill("track");
  const firstResult = page.locator("ul li button").first();
  await expect(firstResult).toBeVisible();
  await firstResult.click();
  await expect(page).toHaveURL(/\/article\//);
});

test("adding a product to the cart shows it on the cart page", async ({ page }) => {
  await page.goto("/shop/edisi-001");
  await page.getByRole("button", { name: /add to cart/i }).first().click();
  await page.goto("/cart");
  await expect(page.getByText(/edisi 001/i).first()).toBeVisible();
  await expect(page.getByText(/85[.,]?000/).first()).toBeVisible();
});

test("shop lists products", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.locator('a[href^="/shop/"]').first()).toBeVisible();
});
