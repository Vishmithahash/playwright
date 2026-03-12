# Playwright HTML Reporting & beforeEach — Complete Guide

---

## Part 1: HTML Reporting

### What Is the HTML Reporter?

Playwright's HTML reporter is a **built-in, interactive test reporting system**. After your tests run, it produces a self-contained web application saved in `playwright-report/`.

| Feature | Description |
|---|---|
| Test summary | Pass / fail / skip counts at a glance |
| Per-test details | Request, response, timings, errors |
| Step-by-step trace | Every action and assertion with timing |
| Failure evidence | Stack traces, diffs, and error messages |
| Filter & search | Filter by status, browser, file, test name |
| Retry info | Shows each retry attempt separately |

The report is a standalone folder — no internet needed, no external service. You can zip it and share it.

---

### The Code — `playwright.config.js`

All reporters are declared in the `reporter` array:

```js
reporter: [
  ['html',   { open: 'on-failure', outputFolder: 'playwright-report' }],
  ['list'],
  ['line'],
  ['dot'],
  ['junit',  { outputFile: 'test-results/junit.xml' }],
  ['json',   { outputFile: 'test-results/results.json' }],
  ['github'],
],
```

| Reporter | What it does |
|---|---|
| `html` | Interactive web report in `playwright-report/` — best for demos |
| `list` | Readable per-test list printed to terminal during the run |
| `line` | One-line summary per test (compact) |
| `dot` | Compact dots in terminal (good for many tests) |
| `junit` | JUnit XML file at `test-results/junit.xml` — used by CI tools |
| `json` | Machine-readable JSON at `test-results/results.json` |
| `github` | Formats output for GitHub Actions logs and annotations |

The `open: 'on-failure'` option means the HTML report opens automatically only when a test fails. If all tests pass, open it manually with `npx playwright show-report`.

---

### The Code — `tests/api.spec.js`

```js
const { test, expect } = require('@playwright/test');

test.describe('User API', () => {
  test('CRUD operations for users', async ({ request }) => {
    // ── CREATE ──────────────────────────────────────────────
    const createRes = await request.post('http://localhost:3000/users', {
      data: { name: 'Alice', email: 'alice@example.com' }
    });
    expect(createRes.status()).toBe(201);          // 201 Created
    const user = await createRes.json();
    const id = user.id || user._id;
    expect(id).toBeTruthy();
    expect(user.name).toBe('Alice');

    // ── READ ─────────────────────────────────────────────────
    const getRes = await request.get(`http://localhost:3000/users/${id}`);
    expect(getRes.ok()).toBeTruthy();              // 200 OK
    const got = await getRes.json();
    expect(got.email).toBe('alice@example.com');

    // ── UPDATE ───────────────────────────────────────────────
    const updateRes = await request.put(`http://localhost:3000/users/${id}`, {
      data: { name: 'Alice Updated', email: 'alice2@example.com' }
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.name).toBe('Alice Updated');

    // ── LIST ─────────────────────────────────────────────────
    const listRes = await request.get('http://localhost:3000/users');
    expect(listRes.ok()).toBeTruthy();
    const list = await listRes.json();
    expect(Array.isArray(list)).toBeTruthy();
    expect(list.length).toBeGreaterThan(0);

    // ── DELETE ───────────────────────────────────────────────
    const delRes = await request.delete(`http://localhost:3000/users/${id}`);
    expect(delRes.status()).toBe(204);             // 204 No Content

    // ── VERIFY 404 ───────────────────────────────────────────
    const notFound = await request.get(`http://localhost:3000/users/${id}`);
    expect(notFound.status()).toBe(404);           // 404 Not Found
  });
});
```

Each CRUD step appears as a collapsible item in the HTML report.

---

### The Code — `tests/example.spec.js`

```js
const { test, expect } = require('@playwright/test');

// Test 1 — navigates independently (does NOT use beforeEach)
test('Check Google Title', async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Google/);
});

// beforeEach — runs before every test that follows it
test.beforeEach(async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const notInterested = page.locator('button:has-text("Not interested")');
  if (await notInterested.isVisible())
    await notInterested.click();
});

// Test 2 — beforeEach already loaded the page, so this just checks the search box
test('Search box is visible', async ({ page }) => {
  const searchBox = page.locator('[name="q"]');
  await expect(searchBox).toBeVisible({ timeout: 10000 });
});
```

---

### Step-by-Step: Run Tests and Show the HTML Report

#### Step 1 — Start the backend server (Terminal 1)

```bash
npm start
```

Expected output:
```
Connected to MongoDB
Server listening on http://localhost:3000
```

Keep this terminal open throughout the demo.

#### Step 2 — Run all Playwright tests (Terminal 2)

```bash
npm test
```

Expected output:
```
Running 9 tests using 9 workers

  ✓  [chromium] › api.spec.js     › User API › CRUD operations for users
  ✓  [firefox]  › api.spec.js     › User API › CRUD operations for users
  ✓  [webkit]   › api.spec.js     › User API › CRUD operations for users
  ✓  [chromium] › example.spec.js › Check Google Title
  ✓  [chromium] › example.spec.js › Search box is visible
  ...

  9 passed
```

All 7 reporters run at the same time during this single command.

#### Step 3 — Open the HTML report

```bash
npm run show-report
```

Your browser opens automatically with the interactive report.

#### Step 4 — Explore the report (what to show)

1. **Summary bar** — shows total pass / fail / skip counts.
2. **Click any test** — expands step-by-step details.
3. **API test steps** — each POST / GET / PUT / DELETE appears as a collapsible row.
4. **Status badges** — green = pass, red = fail, grey = skip.
5. **Filters** — top bar lets you filter by browser, status, or file name.

#### Step 5 — Check the other report outputs

```bash
# JUnit XML (for CI systems)
cat test-results/junit.xml

# JSON results (machine-readable)
cat test-results/results.json
```

---

### NPM Scripts

```json
"scripts": {
  "start":       "node server.js",
  "test":        "npx playwright test",
  "show-report": "npx playwright show-report"
}
```

---

### Where Report Files Are Saved

```
playwright/
├── playwright-report/        ← HTML report (regenerated each run)
│   └── index.html
├── test-results/             ← raw artifacts + other report formats
│   ├── junit.xml
│   └── results.json
├── tests/
│   ├── api.spec.js
│   └── example.spec.js
├── playwright.config.js
└── package.json
```

The `playwright-report/` folder is **deleted and recreated** every time you run `npm test`.

---

## Part 2: beforeEach Hook

### What Is `beforeEach`?

`test.beforeEach` is a **setup hook** that Playwright runs automatically before every test in the same file (or describe block). It is used to avoid repeating the same setup code in every test.

| Hook | When it runs |
|---|---|
| `test.beforeAll` | Once before all tests in the file/describe block |
| `test.beforeEach` | Before **each** individual test |
| `test.afterEach` | After **each** individual test |
| `test.afterAll` | Once after all tests in the file/describe block |

---

### The Code — `tests/example.spec.js` (line-by-line)

```js
const { test, expect } = require('@playwright/test');
```
Imports the Playwright test runner and the `expect` assertion library.

```js
test('Check Google Title', async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Google/);
});
```
**Test 1** — navigates to Google itself and checks the page title. This test does **not** benefit from `beforeEach` because it navigates on its own.

```js
test.beforeEach(async ({ page }) => {
  await page.goto('https://www.google.com', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const notInterested = page.locator('button:has-text("Not interested")');
  if (await notInterested.isVisible())
    await notInterested.click();
});
```
**beforeEach hook** — navigates to Google and dismisses any "Not interested" dialog. Runs automatically before **every** test that comes after it in the file.

```js
test('Search box is visible', async ({ page }) => {
  const searchBox = page.locator('[name="q"]');
  await expect(searchBox).toBeVisible({ timeout: 10000 });
});
```
**Test 2** — the page is already at Google (loaded by `beforeEach`), so this test only asserts the search box is visible. No navigation code needed here.

---

### Execution Flow

```
npx playwright test tests/example.spec.js
│
├── Test 1: "Check Google Title"
│   └── (no beforeEach runs — it is declared AFTER this test)
│
├── beforeEach declared ──────────────────────────────────────┐
│                                                              │
├── Test 2: "Search box is visible"                           │
│   ├── beforeEach runs first ←─────────────────────────────-─┘
│   │     open Google, dismiss dialog
│   └── test body runs
│         check search box is visible
│
└── Done
```

> **Note:** `beforeEach` only applies to tests declared **after** it in the file. `Test 1` comes before the hook, so it navigates independently.

---

### Without `beforeEach` vs. With `beforeEach`

| Without `beforeEach` | With `beforeEach` |
|---|---|
| Every test must call `page.goto(...)` | Setup runs once per test automatically |
| Repeated boilerplate in every test | Tests are shorter and focused |
| Easy to forget setup steps | Setup is guaranteed to run |
| Harder to maintain — change in 10 places | Change setup code in one place |

---

### Step-by-Step: Run and Show `beforeEach` to the Lecturer

#### Step 1 — Run only the UI tests (headless)

```bash
npx playwright test tests/example.spec.js --project=chromium
```

Expected output:
```
Running 2 tests using 1 worker

  ✓  [chromium] › example.spec.js › Check Google Title   (2.1s)
  ✓  [chromium] › example.spec.js › Search box is visible (1.8s)

  2 passed (4.1s)
```

#### Step 2 — Open the HTML report

```bash
npx playwright show-report
```

#### Step 3 — Show the Before Hooks section in the report

1. Click **"Search box is visible"** to expand it.
2. Look for the **"Before Hooks"** section at the top of the steps.
3. Expand it — it shows `beforeEach` running `page.goto(...)`.
4. This is the visual proof that `beforeEach` ran before the test body.

#### Step 4 — Contrast with Test 1

1. Click **"Check Google Title"** in the report.
2. Notice there is **no "Before Hooks" section** — because `beforeEach` was declared after this test.
3. This illustrates that hook placement in the file matters.

#### Step 5 — Run with headed browser (live demo)

```bash
npx playwright test tests/example.spec.js --project=chromium --headed
```

You will see a real browser window open, navigate to Google, and run each test visually.

#### Step 6 — Run with Playwright Inspector (step-by-step debugger)

```bash
npx playwright test tests/example.spec.js --project=chromium --debug
```

The Playwright Inspector opens. Use the **Step Over** button to watch `beforeEach` and the test body execute one line at a time.

---

### Lecturer Demo Checklist

| # | Action | Command | What to point out |
|---|---|---|---|
| 1 | Run UI tests | `npx playwright test tests/example.spec.js --project=chromium` | 2 tests pass |
| 2 | Open report | `npx playwright show-report` | Interactive HTML report |
| 3 | Show Before Hooks | Click "Search box is visible" | beforeEach steps visible |
| 4 | Contrast Test 1 | Click "Check Google Title" | No Before Hooks section |
| 5 | Headed run | `--headed` flag | Live browser |
| 6 | Debug run | `--debug` flag | Inspector, step-by-step |

---

### Key Points to Explain

| Point | Explanation |
|---|---|
| `test.beforeEach` | Runs before every test — guaranteed setup |
| Hook placement | Only applies to tests declared **after** the hook |
| `page` fixture | Shared between `beforeEach` and the test — same browser context |
| Visible in report | HTML report shows "Before Hooks" separately from the test body |
| Reduces repetition | One navigation call instead of one per test |

Playwright's HTML reporter is a **built-in, interactive test reporting system**. After your tests finish, it produces a self-contained web application that shows:

| Feature | Description |
|---|---|
| Test summary | Pass / fail / skip counts at a glance |
| Per-test details | Request, response, timings, errors |
| Step-by-step trace | Every action and assertion with timing |
| Failure evidence | Stack traces, diffs, and error messages |
| Filter & search | Filter by status, browser, file, test name |
| Retry information | Shows each retry attempt separately |

The report is a standalone folder (`playwright-report/`) — no internet needed, no external service. You can zip it and share it.

---

## How HTML Reporting Works (Step-by-Step)

### Step 1 — Configuration
The reporter is declared in `playwright.config.js`:

```js
// playwright.config.js
export default defineConfig({
  reporter: 'html',          // ← this activates the HTML reporter
  ...
});
```

You can also pass options:

```js
reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }]],
```

| Option | Values | Meaning |
|---|---|---|
| `open` | `'always'` / `'never'` / `'on-failure'` | When to auto-open the report |
| `outputFolder` | any path string | Where to save the report files |

**Default behaviour:** Playwright opens the report automatically when a test **fails**. If all tests pass, you open it manually with `npx playwright show-report`.

---

### Step 2 — Run the Tests

```bash
npm test
# or
npx playwright test
```

What happens:
1. Playwright starts and runs all `.spec.js` files in the `tests/` folder.
2. Results (pass/fail, timings, steps) are collected in memory.
3. At the end, the HTML reporter writes the interactive report to `playwright-report/`.

---

### Step 3 — Open the Report

```bash
npm run show-report
# or
npx playwright show-report
```

This command starts a local HTTP server pointing at `playwright-report/` and opens your default browser. The interactive report looks like this:

```
┌─────────────────────────────────────────────────────┐
│  Playwright Test Report                             │
│  1 passed  ·  0 failed  ·  0 skipped               │
├─────────────────────────────────────────────────────┤
│  ✅  User API › CRUD operations for users  1.234s  │
│      ▶ POST /users → 201 Created                   │
│      ▶ GET  /users/:id → 200 OK                    │
│      ▶ PUT  /users/:id → 200 OK                    │
│      ▶ GET  /users     → 200 OK                    │
│      ▶ DELETE /users/:id → 204 No Content          │
│      ▶ GET  /users/:id → 404 Not Found             │
└─────────────────────────────────────────────────────┘
```

---

## Project-Specific Setup

### This project's config (`playwright.config.js`)

```js
export default defineConfig({
  testDir: './tests',          // tests are in /tests folder
  fullyParallel: true,         // run all tests in parallel
  reporter: 'html',            // ← HTML report is ON
  use: {
    trace: 'on-first-retry',   // record trace on first retry
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

> **Note for API tests:** The `projects` section defines browsers, but because your test only uses the `request` fixture (no `page`), the browser is not actually launched. Playwright still runs the test in each project configuration, so you may see the same API test appear 3 times in the report (once per browser config). This is normal.

### This project's test (`tests/api.spec.js`)

The test performs a full CRUD lifecycle:

```
Create User  →  Read User  →  Update User  →  List Users  →  Delete User  →  Verify 404
```

Each step appears as a collapsible item in the HTML report.

### NPM scripts (`package.json`)

```json
"scripts": {
  "start":       "node server.js",
  "test":        "npx playwright test",
  "show-report": "npx playwright show-report"
}
```

---

## Step-by-Step: Running and Showing the Report

### Prerequisites

Make sure Node.js packages and Playwright browsers are installed:

```bash
npm install
npx playwright install
```

### Step 1 — Start the backend server

Open a terminal and run:

```bash
npm start
```

You should see:
```
Connected to MongoDB
Server listening on http://localhost:3000
```

Keep this terminal open.

### Step 2 — Run Playwright tests

Open a **second terminal** and run:

```bash
npm test
```

You will see output like:
```
Running 3 tests using 3 workers

  ✓  [chromium] › api.spec.js:3:3 › User API › CRUD operations for users (1.2s)
  ✓  [firefox]  › api.spec.js:3:3 › User API › CRUD operations for users (1.4s)
  ✓  [webkit]   › api.spec.js:3:3 › User API › CRUD operations for users (1.5s)

  3 passed (3.2s)
```

### Step 3 — Open the HTML report

```bash
npm run show-report
```

Your browser will open automatically with the interactive report.

### Step 4 — Explore the report

- Click on a test name to expand it.
- You will see each API request (POST, GET, PUT, DELETE) listed as a step.
- Click on a step to see request/response details.
- If a test failed, you will see the exact assertion that failed and the diff.

---

## Multiple Reporter Configuration (Advanced)

You can run multiple reporters simultaneously. For example, show HTML AND print to terminal:

```js
// playwright.config.js
reporter: [
  ['html', { open: 'on-failure' }],
  ['list'],
],
```

Other built-in reporters:

| Reporter | Description |
|---|---|
| `html` | Interactive web report (your current setup) |
| `list` | Line-by-line output in terminal |
| `dot` | Compact dots in terminal |
| `json` | Machine-readable JSON output |
| `junit` | XML format for CI tools (Jenkins, GitHub Actions) |
| `line` | One line per test |

---

Updated reporter set (project):

```js
// playwright.config.js
reporter: [
  ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
  ['list'],
  ['line'],
  ['dot'],
  ['junit', { outputFile: 'test-results/junit.xml' }],
  ['json', { outputFile: 'test-results/results.json' }],
  ['github'],
]
```

What each of these does (short):

- `html`: Generates the interactive HTML report in `playwright-report/`. Best for manual review and demos.
- `list`: Prints a readable, per-test list to the terminal while running.
- `line`: Prints a single-line summary per test (compact, one-liners).
- `dot`: Prints compact dots to the terminal (good for many tiny tests).
- `junit`: Writes a JUnit-style XML file (`test-results/junit.xml`) used by CI systems.
- `json`: Writes machine-readable JSON results (`test-results/results.json`) for processing.
- `github`: Formats output for GitHub Actions logs (used when running tests on GitHub CI).

How to test and verify each reporter — step-by-step

1. Install dependencies and browsers (once):

```bash
npm install
npx playwright install
```

2. Start the backend (keep this terminal open):

```bash
npm start
```

3. Run the test suite (this produces ALL configured reporters):

```bash
npx playwright test
```

What to look for after the run:

- Terminal output: `list`, `line`, and `dot` produce console output during the run — you will see the human-friendly list plus compact line/dot summaries.
- HTML: open the interactive report with:

```bash
npx playwright show-report
# or
npm run show-report
```

- JUnit XML: open or inspect `test-results/junit.xml` in a text editor or upload to CI.
- JSON: open or inspect `test-results/results.json` in a text editor or parse it programmatically.
- GitHub reporter: when running in GitHub Actions the `github` reporter formats logs and annotations. Locally it may produce similar log entries to console.

Per-run override (quick checks)

- Run only the `list` reporter:

```bash
npx playwright test --reporter=list
```

- Run `list` and `json` only:

```bash
npx playwright test --reporter=list --reporter=json
```

Tips
- Keep `junit`/`json` outputs in `test-results/` so CI and automation can pick them up.
- Use `html` for teacher/demo presentation and `junit`/`json` for CI and artifact collection.


## Where the Report Files Live

```
playwright/
├── playwright-report/       ← the HTML report folder
│   └── index.html           ← open this in a browser
├── test-results/            ← raw test artifacts (traces, screenshots)
├── tests/
│   └── api.spec.js
├── playwright.config.js
└── package.json
```

The `playwright-report/` folder is **regenerated fresh** every time you run `npm test`. The old report is deleted and replaced.

---

## Showing the Report to Your Lecturer — Checklist

| Task | Command | Status |
|---|---|---|
| 1. Start the backend | `npm start` | Run in terminal 1 |
| 2. Run the tests | `npm test` | Run in terminal 2 |
| 3. Open the report | `npm run show-report` | Opens in browser |
| 4. Explore in browser | Click test names, expand steps | Live demo |

**Key things to point out to your lecturer:**

1. The **reporter: 'html'** line in `playwright.config.js` — this is where reporting is configured.
2. The **`playwright-report/` folder** — generated automatically after each run.
3. The **interactive report in the browser** — pass/fail summary, step-by-step details.
4. The **`npm run show-report` command** — serves the report on a local port.
5. That **no frontend is needed** — you are doing API testing directly.

---

## Summary

| Question | Answer |
|---|---|
| Is HTML reporting set up? | ✅ Yes — `reporter: 'html'` is already in `playwright.config.js` |
| Do I need a frontend? | ❌ No — your tests are API tests using the `request` fixture |
| Where is the report? | `playwright-report/index.html` |
| How to open it? | `npm run show-report` or `npx playwright show-report` |
| When is it generated? | Automatically every time you run `npm test` |
