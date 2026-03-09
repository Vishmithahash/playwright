const { test, expect } = require('@playwright/test');

test('Check Google Title', async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Google/);
});

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const notInterested = page.locator('button:has-text("Not interested")');
  if (await notInterested.isVisible())
    await notInterested.click();
});

test('Search box is visible', async ({ page }) => {
  const searchBox = page.locator('[name="q"]');
  await expect(searchBox).toBeVisible({ timeout: 10000 });
});