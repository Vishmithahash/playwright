# Playwright `beforeEach` — Complete Guide

---

## 1. What Is `beforeEach`?

`test.beforeEach` is a **hook** — a special function that Playwright runs **automatically before every single test** inside a `describe` block (or the whole file if no `describe` is used).

Think of it as:
> "Do this setup work before every test, so I don't have to repeat it."

### Real-life analogy
Imagine you are a waiter. Before every customer sits down you:
- Wipe the table
- Put down napkins
- Fill the water glass

You do this **before every customer**, every time. That's `beforeEach`.

---

## 2. Basic Syntax

```js
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // This runs before EVERY test in this file
  await page.goto('https://example.com');
});

test('Test 1', async ({ page }) => {
  // page is already at example.com
  await expect(page).toHaveTitle(/Example/);
});

test('Test 2', async ({ page }) => {
  // page is already at example.com — beforeEach ran again
  await expect(page.locator('h1')).toBeVisible();
});
```

---

## 3. How It Works (Execution Flow)

```
npm test
│
├── beforeEach ──► runs
│     └── Test 1 ──► runs
│
├── beforeEach ──► runs again
│     └── Test 2 ──► runs
│
└── Done
```

`beforeEach` runs **once per test**, not once for all tests.

---

## 4. Where It Already Exists in This Project

Open `tests/example.spec.js`:

```js
const { test, expect } = require('@playwright/test');

// Test 1 — does NOT use beforeEach (has its own goto)
test('Check Google Title', async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Google/);
});

// beforeEach — runs automatically before "Search box is visible"
test.beforeEach(async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const notInterested = page.locator('button:has-text("Not interested")');
  if (await notInterested.isVisible())
    await notInterested.click();
});

// Test 2 — beforeEach already navigated & dismissed any consent dialog
test('Search box is visible', async ({ page }) => {
  const searchBox = page.locator('[name="q"]');
  await expect(searchBox).toBeVisible({ timeout: 10000 });
});
```

### What this `beforeEach` does — line by line

| Line | What it does |
|---|---|
| `page.goto(...)` | Opens Google in the browser before every test |
| `timeout: 60000` | Waits up to 60 seconds for the page to load |
| `waitUntil: 'domcontentloaded'` | Considers page "ready" after DOM loads (faster than full load) |
| `locator('button:has-text("Not interested")')` | Finds the cookie/consent button if it appears |
| `if (await notInterested.isVisible())` | Only clicks it if it actually exists (conditional) |
| `await notInterested.click()` | Closes the dialog so it doesn't block the test |

---

## 5. `beforeEach` vs. Repeating Code — Side-by-Side

### WITHOUT `beforeEach` (bad — repetitive):

```js
test('Test A', async ({ page }) => {
  await page.goto('https://www.google.com');   // repeated!
  await expect(page).toHaveTitle(/Google/);
});

test('Test B', async ({ page }) => {
  await page.goto('https://www.google.com');   // repeated!
  const box = page.locator('[name="q"]');
  await expect(box).toBeVisible();
});

test('Test C', async ({ page }) => {
  await page.goto('https://www.google.com');   // repeated!
  await page.click('[name="q"]');
});
```

### WITH `beforeEach` (correct — DRY):

```js
test.beforeEach(async ({ page }) => {
  await page.goto('https://www.google.com');   // setup in ONE place
});

test('Test A', async ({ page }) => {
  await expect(page).toHaveTitle(/Google/);    // no duplicate goto
});

test('Test B', async ({ page }) => {
  const box = page.locator('[name="q"]');
  await expect(box).toBeVisible();
});

test('Test C', async ({ page }) => {
  await page.click('[name="q"]');
});
```

DRY = **D**on't **R**epeat **Y**ourself.

---

## 6. Using `beforeEach` Inside `test.describe`

`test.describe` groups related tests. `beforeEach` inside a `describe` only runs for tests in that group:

```js
const { test, expect } = require('@playwright/test');

test.describe('Google Search', () => {

  test.beforeEach(async ({ page }) => {
    // Runs before every test INSIDE this describe block only
    await page.goto('https://www.google.com');
  });

  test('page has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Google/);
  });

  test('search box is visible', async ({ page }) => {
    await expect(page.locator('[name="q"]')).toBeVisible();
  });

});

test.describe('Google Images', () => {

  test.beforeEach(async ({ page }) => {
    // Completely separate setup for this group
    await page.goto('https://www.google.com/imghp');
  });

  test('image page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/Google Images/i);
  });

});
```

---

## 7. `beforeEach` with API Testing (your `api.spec.js`)

`beforeEach` works for API tests too. Example: create a user before every test and clean up with `afterEach`:

```js
const { test, expect } = require('@playwright/test');

let userId;

test.describe('User API with beforeEach', () => {

  test.beforeEach(async ({ request }) => {
    // Create a fresh user before every test
    const res = await request.post('http://localhost:3000/users', {
      data: { name: 'Test User', email: 'test@example.com' }
    });
    const user = await res.json();
    userId = user.id || user._id;
  });

  test.afterEach(async ({ request }) => {
    // Clean up: delete the user after every test
    await request.delete(`http://localhost:3000/users/${userId}`);
  });

  test('can read created user', async ({ request }) => {
    const res = await request.get(`http://localhost:3000/users/${userId}`);
    expect(res.ok()).toBeTruthy();
  });

  test('can update created user', async ({ request }) => {
    const res = await request.put(`http://localhost:3000/users/${userId}`, {
      data: { name: 'Updated Name', email: 'updated@example.com' }
    });
    expect(res.ok()).toBeTruthy();
    const user = await res.json();
    expect(user.name).toBe('Updated Name');
  });

});
```

---

## 8. All Playwright Hooks (for reference)

| Hook | When it runs | Use for |
|---|---|---|
| `test.beforeAll` | Once before ALL tests in the file/describe | Expensive setup (DB connect, login) |
| `test.beforeEach` | Before EVERY test | Navigate to page, reset state |
| `test.afterEach` | After EVERY test | Cleanup after each test |
| `test.afterAll` | Once after ALL tests in the file/describe | Close connections, tear down server |

### Combined example:

```js
test.beforeAll(async () => {
  console.log('Setup: runs once at the start');
});

test.beforeEach(async ({ page }) => {
  console.log('Setup: runs before each test');
  await page.goto('https://www.google.com');
});

test.afterEach(async ({ page }) => {
  console.log('Cleanup: runs after each test');
});

test.afterAll(async () => {
  console.log('Teardown: runs once at the end');
});
```

---

## 9. Step-by-Step: Run and Show `beforeEach` to Your Lecturer

### Step 1 — Run all tests (generates HTML report)

```bash
npx playwright test
```

You will see in the terminal:
```
Running 9 tests using 8 workers

  ✓  [chromium] › tests/example.spec.js:3:1 › Check Google Title
  ✓  [chromium] › tests/example.spec.js:15:1 › Search box is visible
  ...
```

### Step 2 — Open the HTML report

```bash
npx playwright show-report
```

In the report:
- Click on **"Search box is visible"** test
- You will see `beforeEach` listed as a step that ran before the test body
- You can see it navigated to Google and dismissed any dialogs

### Step 3 — Show the `beforeEach` code to your lecturer

Point to `tests/example.spec.js` and explain:

1. **Line 8–13** — this is the `beforeEach` hook
2. It runs automatically **before "Search box is visible"**
3. It opens Google **and handles the cookie popup** so the test does not fail
4. Without it, "Search box is visible" might fail if a cookie dialog covers the search box

### Step 4 — Run only the example spec (cleaner demo)

```bash
npx playwright test tests/example.spec.js
```

### Step 5 — Watch it run in a visible browser (headed mode)

```bash
npx playwright test tests/example.spec.js --headed --project=chromium
```

This opens a **real Chrome window** so the lecturer can watch:
- The browser opens Google
- The `beforeEach` dismisses any cookie popup
- The test checks the search box is visible
- The browser closes

### Step 6 — Use Playwright Inspector (step debugger)

```bash
npx playwright test tests/example.spec.js --project=chromium --debug
```

This opens the Playwright Inspector where you can:
- See each step highlighted
- Step through the `beforeEach` line by line
- Great for showing lecturers exactly how hooks work

---

## 10. Key Points to Tell Your Lecturer

| Point | Explanation |
|---|---|
| `beforeEach` is a hook | Runs before every test automatically |
| Purpose | Avoids repeating setup code in each test |
| Already implemented | In `tests/example.spec.js` it navigates to Google and handles consent popup |
| Works with both `page` and `request` | Can set up UI state or API test data |
| Shown in HTML report | Each step including `beforeEach` is visible in `playwright-report/` |
| Paired with `afterEach` | Use `afterEach` to clean up state after each test |

---

## 11. Summary Table

| Concept | Code | Result |
|---|---|---|
| Navigate before each test | `test.beforeEach(async ({ page }) => { await page.goto('/') })` | Page opens before every test |
| Handle UI popups before test | `if (await dialog.isVisible()) await dialog.click()` | No popups blocking tests |
| API data setup | `test.beforeEach(async ({ request }) => { ... create user ... })` | Fresh data for every test |
| Cleanup after each | `test.afterEach(async ({ request }) => { ... delete user ... })` | No leftover data |
| View in report | `npx playwright show-report` | See `beforeEach` steps per test |
| Run headed (visible) | `npx playwright test --headed --project=chromium` | Watch browser live |
| Debug step by step | `npx playwright test --debug` | Playwright Inspector opens |
