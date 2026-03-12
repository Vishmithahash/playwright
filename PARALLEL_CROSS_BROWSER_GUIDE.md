# Playwright — Parallel & Cross-Browser Testing Guide

## Quick Answers

### 1. Is Parallel & Cross-Browser Testing already in this demo?
**YES — both are fully configured in `playwright.config.js` right now.**

| Feature | Where in the project | Status |
|---|---|---|
| **Parallel Testing** | `fullyParallel: true` + `workers` in `playwright.config.js` | ACTIVE |
| **Cross-Browser Testing** | `projects` array with `chromium`, `firefox`, `webkit` | ACTIVE |

Every time you run `npx playwright test`, tests already run **in parallel across 3 browsers simultaneously**.

---

## Part A — Parallel Testing

### What is Parallel Testing?

Parallel testing means running **multiple tests at the same time** instead of one after another.

```
Sequential (slow):         Parallel (fast):
Test 1 → Test 2 → Test 3  Test 1 ┐
                           Test 2 ├─ all at same time
                           Test 3 ┘
```

Without parallelism, if each test takes 5 seconds and you have 10 tests, the total time is **50 seconds**.
With parallelism (say 5 workers), the total time drops to roughly **10 seconds**.

---

### How Parallel Testing Works in Playwright

Playwright uses **workers** — each worker is a separate process that runs tests independently.

```
Worker 1 ──► Test A (Chromium)
Worker 2 ──► Test B (Firefox)
Worker 3 ──► Test C (Webkit)
Worker 4 ──► Test D (Chromium)
```

Workers do NOT share memory, browser sessions, or state. Each worker is fully isolated.

---

### Parallel Testing in YOUR Project

Open `playwright.config.js` — these two settings control parallelism:

```js
// Line 16 — Runs ALL tests in ALL files in parallel
fullyParallel: true,

// Line 23 — Number of parallel workers
// undefined = Playwright decides based on your CPU (usually half the CPU cores)
// process.env.CI ? 1 = only 1 worker on CI (to avoid resource issues)
workers: process.env.CI ? 1 : undefined,
```

**`fullyParallel: true`** means:
- Tests inside the same file run in parallel
- Tests across different files run in parallel
- All browsers run in parallel

**`workers`** controls how many tests run at the same time.

---

### Parallel Testing Levels

Playwright supports 3 levels of parallelism:

| Level | Setting | Meaning |
|---|---|---|
| File-level | Default | Tests in different files run in parallel |
| Full | `fullyParallel: true` | Tests inside a file also run in parallel |
| Serial | `test.describe.serial()` | Tests in a group run one after another |

**Your project uses Full parallelism** (the most aggressive and fastest).

---

### Controlling Workers Manually

You can override the number of workers from the command line:

```bash
# Use 4 parallel workers
npx playwright test --workers=4

# Run sequentially (1 worker = no parallelism)
npx playwright test --workers=1

# Let Playwright decide (default)
npx playwright test
```

---

### When NOT to Use Parallelism

Some tests must run in order (e.g., create user → update user → delete user).
Your `api.spec.js` is a good example — the CRUD steps depend on each other.

For these, use serial mode:

```js
test.describe.serial('CRUD must run in order', () => {
  test('Create user', async () => { ... });
  test('Update user', async () => { ... });  // runs after Create
  test('Delete user', async () => { ... });  // runs after Update
});
```

---

## Part B — Cross-Browser Testing

### What is Cross-Browser Testing?

Cross-browser testing means running the **same tests on multiple browsers** to make sure
your application works correctly everywhere — not just in Chrome.

Different browsers use different rendering engines:

| Browser | Engine | Playwright Project Name |
|---|---|---|
| Google Chrome / Edge | Blink (Chromium) | `chromium` |
| Firefox | Gecko | `firefox` |
| Safari | WebKit | `webkit` |

A page that works in Chrome may have layout or JavaScript issues in Firefox or Safari.
Cross-browser testing catches these differences automatically.

---

### Cross-Browser Testing in YOUR Project

Open `playwright.config.js` — the `projects` array defines which browsers to run:

```js
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },   // Desktop Chrome browser
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },  // Desktop Firefox browser
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },   // Desktop Safari (WebKit) browser
  },
],
```

When you run `npx playwright test`, Playwright runs **every test 3 times** — once per browser.

So if you have 2 tests × 3 browsers = **6 test runs total**.

---

### What `devices` Provides

`devices['Desktop Chrome']` is a preset that sets:
- Browser type (chromium / firefox / webkit)
- Screen resolution (1280×720 by default)
- User-Agent string
- Default viewport

This ensures tests run in a realistic, consistent browser environment.

---

### Mobile & Branded Browser Support (Already in Config — Commented Out)

Your config also has mobile and branded browser options commented out.
These can be enabled anytime:

```js
// Mobile Chrome (Android)
{ name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },

// Mobile Safari (iPhone)
{ name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },

// Microsoft Edge
{ name: 'Microsoft Edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },

// Google Chrome (real Chrome, not Chromium)
{ name: 'Google Chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
```

---

## How Parallel + Cross-Browser Work Together

This is the most powerful part. Both features work **at the same time**:

```
npx playwright test
         │
         ├── Worker 1 ──► example.spec.js on Chromium
         ├── Worker 2 ──► example.spec.js on Firefox
         ├── Worker 3 ──► example.spec.js on WebKit
         ├── Worker 4 ──► api.spec.js on Chromium
         ├── Worker 5 ──► api.spec.js on Firefox
         └── Worker 6 ──► api.spec.js on WebKit
                    All running at the same time!
```

**This means** your 2 test files × 3 browsers = 6 test runs, all happening in parallel.
This would take ~6× longer without parallelism.

---

## Commands for Demo

### Run All Tests on All Browsers (Parallel + Cross-Browser)
```bash
npx playwright test
```

### Run Only on Chromium
```bash
npx playwright test --project=chromium
```

### Run Only on Firefox
```bash
npx playwright test --project=firefox
```

### Run Only on WebKit (Safari)
```bash
npx playwright test --project=webkit
```

### Run on Two Specific Browsers
```bash
npx playwright test --project=chromium --project=firefox
```

### Run with Visible Browser Windows (Best for Live Demo)
```bash
npx playwright test --headed
```

### Run on All Browsers with Visible Windows
```bash
npx playwright test --headed --project=chromium
# Open 3 terminals and run each project headed for dramatic effect
```

### Run with Specific Number of Workers
```bash
npx playwright test --workers=3
```

### Run Sequentially (No Parallelism — to show the difference)
```bash
npx playwright test --workers=1
```

### View HTML Report After Running
```bash
npx playwright show-report
```

---

## How to Present on a Lecture Board

### Step 1 — Show the Config
Open [playwright.config.js](playwright.config.js) and point to:
- Line 16: `fullyParallel: true` → "this enables parallel execution"
- Line 23: `workers: ...` → "this controls how many tests run simultaneously"
- Lines 46–60: `projects` array → "each entry is a browser, tests run on all of them"

### Step 2 — Show Single Browser vs All Browsers
Run these two commands and compare the output:

```bash
# Single browser — fewer test runs
npx playwright test --project=chromium

# All browsers — same tests run 3x
npx playwright test
```
Point out how the second run shows `chromium`, `firefox`, `webkit` labels on each test.

### Step 3 — Show Parallel vs Sequential
```bash
# Parallel (fast)
npx playwright test --workers=4

# Sequential (slow) — to show the contrast
npx playwright test --workers=1
```
The time difference demonstrates why parallelism matters.

### Step 4 — Show the HTML Report
```bash
npx playwright show-report
```
In the report:
- Expand any test to see which browser it ran on
- The browser name (`chromium` / `firefox` / `webkit`) is shown next to each test
- All 6 runs (2 tests × 3 browsers) are visible

### Step 5 — Optional: Show Headed Mode
```bash
npx playwright test --headed --project=chromium --workers=1
```
Opens a real Chrome browser window — very visual for a live demo.

---

## How Tests Get Split Across Workers

Playwright automatically assigns tests to workers — you don't need to do anything.

```
Your test files:
├── tests/example.spec.js  (2 tests)
└── tests/api.spec.js      (1 test)

With 3 browser projects → 9 total test runs

Worker assignment (automatic):
Worker 1: example.spec [chromium] test 1 + test 2
Worker 2: example.spec [firefox]  test 1 + test 2
Worker 3: example.spec [webkit]   test 1 + test 2
Worker 4: api.spec     [chromium] test 1
Worker 5: api.spec     [firefox]  test 1
Worker 6: api.spec     [webkit]   test 1
```

---

## Parallel Testing — Key Config Options Summary

| Config Option | Current Value | What It Does |
|---|---|---|
| `fullyParallel` | `true` | All tests in all files run in parallel |
| `workers` | `undefined` (auto) | Auto-detects CPU cores for worker count |
| `retries` | `0` (local), `2` (CI) | Retry failed tests (CI only) |

## Cross-Browser — Key Config Options Summary

| Project | Device Preset | Browser Engine |
|---|---|---|
| `chromium` | `Desktop Chrome` | Chromium (Blink) |
| `firefox` | `Desktop Firefox` | Firefox (Gecko) |
| `webkit` | `Desktop Safari` | Safari (WebKit) |

---

## Division of Work in Your Group Demo

| Part | Group Member | Key Config/File | What to Show |
|---|---|---|---|
| **Assertions** | You | `tests/api.spec.js`, `tests/example.spec.js` | All `expect()` lines |
| **HTML Reporting** | Friend 1 | `playwright.config.js` reporter section | `npx playwright show-report` |
| **Parallel & Cross-Browser** | Friend 2 | `playwright.config.js` projects + workers | `--project` flags, `--workers` flags |

All three parts use the **same config file and same test files** — they all work together.

---

## Summary

| Concept | Key Point |
|---|---|
| Parallel Testing | Multiple tests run simultaneously using workers |
| `fullyParallel: true` | Already enabled — tests inside files also run in parallel |
| `workers` | Controls how many tests run at once — defaults to CPU core count |
| Cross-Browser Testing | Same tests run on Chromium, Firefox, WebKit |
| `projects` array | Already has 3 browsers configured — all active |
| Combined effect | 2 files × 3 browsers = 6 runs, all in parallel |
| Best demo command | `npx playwright test` then `npx playwright show-report` |

---

## References

- [Playwright Parallelism Docs](https://playwright.dev/docs/test-parallel)
- [Cross-Browser Testing Docs](https://playwright.dev/docs/browsers)
- [Projects Configuration](https://playwright.dev/docs/test-projects)
- [Devices Registry](https://playwright.dev/docs/emulation#devices)
