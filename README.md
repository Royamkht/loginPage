# playwright-api-ui-e2e-suite

## Why this project?
Built to demonstrate QA automation skills: 
Playwright API + UI testing, schema validation, 
and CI/CD integration with GitHub Actions.

A simple login web application built with Node.js and Express. It includes sign-up, login, forgot-password, and reset-password flows, plus automated API and UI tests run in GitHub Actions on every push and pull request.

## Features

- Login, sign-up, forgot password, and reset password (web UI + REST API)
- Password policy validation (length, uppercase, digit)
- JSON response schemas validated in API tests
- Playwright API and UI test suites
- GitHub Actions CI (separate jobs for API and UI tests)

## Tech stack

- **Runtime:** Node.js 20+
- **Server:** Express
- **Tests:** Playwright, Vitest, Supertest, Ajv (schema validation)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- npm

### Install

```bash
git clone <your-repo-url>
cd loginPage
npm ci
```

### Run the app

```bash
npm start
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

For development with auto-restart:

```bash
npm run dev
```

The server listens on **port 3000** by default (`src/server.js`). You only need `PORT=3001 npm start` when something else is already using 3000.

### Port 3000 already in use?

If `npm start` fails with `EADDRINUSE`, another process (often a previous `npm start` or a Playwright test run that started the app) is still bound to port 3000:

```bash
lsof -i :3001
kill <PID>    # use the PID from the lsof output
npm start
```

Playwright’s `webServer` also starts the app on 3000 during tests (`reuseExistingServer` is enabled locally). Stop that server or kill the process above before starting the app manually on 3000.

### Demo account

| Field    | Value       |
| -------- | ----------- |
| Username | `demo`      |
| Password | `Demo12345` |

## API

Base URL: `http://localhost:3001`

| Method | Path                    | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | `/api/health`           | Health check       |
| POST   | `/api/login`            | Log in             |
| POST   | `/api/sign-up`          | Register           |
| POST   | `/api/forget-password`  | Request reset link |
| POST   | `/api/reset-password`   | Set new password   |

Example login:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"Demo12345"}'
```

## Tests

Playwright starts the server automatically via `playwright.config.ts` (`webServer`). On CI, the app runs on `http://127.0.0.1:3001`.

Install browser binaries once:

```bash
npm run playwright:install
```

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run test:e2e`   | All Playwright tests                 |
| `npm test`           | Vitest unit tests                    |
| `npx playwright test tests/api.spec.ts` | API tests only          |
| `npm run test:ui`    | UI tests (Chromium)                  |

View the HTML report after a run:

```bash
npx playwright show-report
```

Test configuration for API credentials lives in `api-test.config.ts`.

## GitHub Actions

Workflow file: [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)

Triggers on **push** and **pull_request** to `main` or `master`.

| Job id     | GitHub check name (for branch protection)              | What it runs        |
| ---------- | ------------------------------------------------------ | ------------------- |
| `api-test` | `Playwright Tests / Playwright (API)`                  | `tests/api.spec.ts` |
| `ui-test`  | `Playwright Tests / Playwright (UI)`                   | `tests/UI.spec.ts`  |

On failure, Playwright HTML reports are uploaded as artifacts (14-day retention).

### Branch protection (optional)

You have **two** workflow jobs, so only **two** Action checks should run. If you see a third check named `api-test` stuck on *Waiting for status to be reported*, branch protection is requiring the wrong name (the job id, not the check name GitHub publishes).

To require checks before merge:

1. Repo **Settings** → **Branches** → edit the rule for `main` / `master`
2. Enable **Require status checks to pass**
3. Remove **`api-test`** from required checks if it appears
4. Require these two checks (exact labels from a green PR):
   - **Playwright Tests / Playwright (API)**
   - **Playwright Tests / Playwright (UI)**

## Project structure

```
├── src/
│   ├── server.js          # Entry point
│   ├── app.js             # Express routes & middleware
│   ├── auth_policy.js     # Username/password rules
│   ├── user_store.js      # In-memory users
│   └── public/            # Static HTML, CSS, JS
├── tests/
│   ├── api.spec.ts        # API tests
│   └── UI.spec.ts         # Browser UI tests
├── response-schemas/      # JSON schemas for API responses
├── utils/                 # Test helpers (fixtures, validation)
├── .github/workflows/     # CI
├── playwright.config.ts
└── api-test.config.ts
```

## License

ISC
