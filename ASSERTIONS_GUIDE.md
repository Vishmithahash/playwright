# Playwright Assertions — Complete Guide

## Quick Answers

### 1. Is there an Assertions part in this demo?
**YES** — Assertions are already present in **both** test files:

| File | Assertions Used |
|---|---|
| `tests/example.spec.js` | `toHaveTitle()`, `toBeVisible()` |
| `tests/api.spec.js` | `toBe()`, `toBeTruthy()`, `toBeGreaterThan()` |

Every `expect(...)` line IS an assertion. Your project is full of them.

### 2. Do I need a frontend to test with Playwright?
**No — it depends on what you are testing:**

| Test Type | Do you need a frontend? | Example in this project |
|---|---|---|
| **API / Backend tests** | NO — only need server running | `tests/api.spec.js` |
| **UI / Browser tests** | YES — need a webpage to visit | `tests/example.spec.js` (uses Google) |

- For `api.spec.js` → just run `npm start` (starts the Express server).
- For `example.spec.js` → it tests `https://www.google.com`, so NO custom frontend is needed.
- If you want to test your **own** frontend UI, you would build a frontend and point Playwright at it.

---

## What is an Assertion?

An **assertion** is a check that verifies your application behaves as expected.
In Playwright, assertions are written using the `expect()` function.

```js
expect(value).matcherMethod();
```

- If the assertion **passes** → test continues.
- If the assertion **fails** → test stops and reports an error.

---

## Types of Assertions in Playwright

### Type 1 — Web-First Assertions (Recommended for UI)
These wait automatically for the condition to become true (up to a timeout).
They are used on **page elements**.

```js
await expect(page).toHaveTitle(/Google/);
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Hello');
await expect(locator).toBeEnabled();
```

> **Key point:** `await` is required. Playwright keeps retrying until pass or timeout.

---

### Type 2 — Generic / Value Assertions
These check plain values (numbers, strings, booleans, arrays) immediately — no waiting.

```js
expect(response.status()).toBe(200);
expect(user.name).toBe('Alice');
expect(Array.isArray(list)).toBeTruthy();
expect(list.length).toBeGreaterThan(0);
```

> **Key point:** NO `await` needed for these.

---

### Type 3 — Soft Assertions
Soft assertions do NOT stop the test when they fail — they collect all failures and report at the end.

```js
await expect.soft(page).toHaveTitle(/Google/);
await expect.soft(locator).toBeVisible();
// test continues even if the above fail
```

---

## Assertions Already in YOUR Project

### From `tests/example.spec.js`

```js
// Assertion 1: Page title matches "Google"
await expect(page).toHaveTitle(/Google/);

// Assertion 2: Search box element is visible on the page
await expect(searchBox).toBeVisible({ timeout: 10000 });
```

### From `tests/api.spec.js`

```js
// Assertion 3: HTTP status is 201 Created
expect(createRes.status()).toBe(201);

// Assertion 4: User ID exists (is not null/undefined/empty)
expect(id).toBeTruthy();

// Assertion 5: Name field equals 'Alice'
expect(user.name).toBe('Alice');

// Assertion 6: Response was successful (2xx status)
expect(getRes.ok()).toBeTruthy();

// Assertion 7: Email field equals 'alice@example.com'
expect(got.email).toBe('alice@example.com');

// Assertion 8: Update response is ok
expect(updateRes.ok()).toBeTruthy();

// Assertion 9: Updated name is correct
expect(updated.name).toBe('Alice Updated');

// Assertion 10: List response is ok
expect(listRes.ok()).toBeTruthy();

// Assertion 11: Response body is an array
expect(Array.isArray(list)).toBeTruthy();

// Assertion 12: List has at least 1 item
expect(list.length).toBeGreaterThan(0);

// Assertion 13: Delete returns 204 No Content
expect(delRes.status()).toBe(204);

// Assertion 14: Record returns 404 after deletion
expect(notFound.status()).toBe(404);
```

---

## Full List of Common Assertion Methods

### Page-Level Assertions

| Assertion | What it checks |
|---|---|
| `toHaveTitle(text or regex)` | Page title matches |
| `toHaveURL(url)` | Current URL matches |

### Element-Level Assertions

| Assertion | What it checks |
|---|---|
| `toBeVisible()` | Element is visible |
| `toBeHidden()` | Element is hidden |
| `toBeEnabled()` | Element is enabled (not disabled) |
| `toBeDisabled()` | Element is disabled |
| `toBeChecked()` | Checkbox is checked |
| `toHaveText(text)` | Element text matches |
| `toHaveValue(value)` | Input field value matches |
| `toHaveAttribute(name, value)` | HTML attribute matches |
| `toHaveClass(className)` | Element has the CSS class |
| `toHaveCount(n)` | Locator finds exactly n elements |

### Value Assertions (No await)

| Assertion | What it checks |
|---|---|
| `toBe(value)` | Strictly equals |
| `toEqual(value)` | Deep equals (for objects/arrays) |
| `toBeTruthy()` | Value is truthy (not null/undefined/false/0/"") |
| `toBeFalsy()` | Value is falsy |
| `toBeNull()` | Value is null |
| `toBeDefined()` | Value is not undefined |
| `toBeGreaterThan(n)` | Number > n |
| `toBeGreaterThanOrEqual(n)` | Number >= n |
| `toBeLessThan(n)` | Number < n |
| `toContain(item)` | Array/string contains item |
| `toHaveLength(n)` | Array/string has length n |
| `toMatch(regex)` | String matches regex |

---

## How to Run Tests and Show Assertions

### Step 1 — Start the Backend Server
Open a terminal and run:
```
npm start
```
This starts the Express server at `http://localhost:3000`.
Leave this terminal running.

### Step 2 — Run All Tests
Open a second terminal and run:
```
npx playwright test
```

### Step 3 — Run with Visible Browser (for lecture demo)
```
npx playwright test --headed
```
This opens a real browser window so the audience can see the UI tests running live.

### Step 4 — Run Only API Tests
```
npx playwright test tests/api.spec.js
```

### Step 5 — Run Only UI Tests
```
npx playwright test tests/example.spec.js
```

### Step 6 — View the HTML Report (Best for Lecture Board)
After running tests:
```
npx playwright show-report
```
This opens a browser with a full visual report showing:
- Which tests passed (green tick)
- Which tests failed (red cross)
- Each assertion result
- Screenshots and traces on failure

### Step 7 — Run on a Single Browser Only
```
npx playwright test --project=chromium
```

---

## How to Present Assertions on a Lecture Board

### Option A — Show the HTML Report
1. Run `npx playwright test`
2. Run `npx playwright show-report`
3. Expand any test to show each step with pass/fail status
4. Every `expect()` appears as a named step in the report

### Option B — Show Live Test Run
1. Run `npx playwright test --headed --project=chromium`
2. The browser opens and the audience watches the test execute
3. Point out `expect()` lines in the code alongside browser actions

### Option C — Show Code Side-by-Side
Open `tests/api.spec.js` and `tests/example.spec.js` in VS Code.
Highlight every `expect(...)` line and explain:
- What value is being checked
- What the expected result is
- What happens if it fails

---

## Assertion Anatomy — Line by Line Explanation

```
expect( createRes.status() ).toBe( 201 );
│       │                    │     │
│       │                    │     └─ Expected value
│       │                    └─ Matcher (assertion method)
│       └─ Actual value (what the app returned)
└─ Playwright expect function
```

```
await expect( page ).toHaveTitle( /Google/ );
│             │       │            │
│             │       │            └─ Expected pattern (regex)
│             │       └─ Web-first matcher (auto-waits)
│             └─ The page object
└─ Must use await for web-first assertions
```

---

## Adding More Assertions (Practice Examples)

You can add these to `tests/example.spec.js` to demonstrate more assertion types:

```js
test('URL contains google.com', async ({ page }) => {
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/google\.com/);
});

test('Search box has correct name attribute', async ({ page }) => {
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
  const searchBox = page.locator('[name="q"]');
  await expect(searchBox).toBeEnabled();
  await expect(searchBox).toHaveAttribute('name', 'q');
});
```

---

## Summary

| Concept | Key Point |
|---|---|
| What is an assertion | A check using `expect()` that verifies the app works correctly |
| Web-first assertions | Use `await`, auto-retry until true; used for page/element checks |
| Generic assertions | No `await`; instant check for values, numbers, strings |
| Soft assertions | Collect failures without stopping the test |
| Your project | 14+ assertions already exist across 2 test files |
| Need frontend? | NO for API tests; only for UI tests against your own UI |
| Best demo tool | `npx playwright show-report` — visual pass/fail per assertion |

---

## References

- [Playwright Assertions Docs](https://playwright.dev/docs/test-assertions)
- [expect() API Reference](https://playwright.dev/docs/api/class-genericassertions)
- [Web-First Assertions](https://playwright.dev/docs/best-practices#use-web-first-assertions)
