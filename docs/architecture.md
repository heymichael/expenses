# Expense Tracking — Architecture

## Overview

The expenses app provides a chat-driven interface for querying and analyzing expense data across vendors and departments. It follows the same SPA pattern as stocks and vendors — a lightweight React frontend backed by the shared agent service. All data flows through the agent service API (`/agent/api/`) — no direct database access from the frontend.

## Repo Layout

```text
expenses/
├── .cursor/
│   ├── rules/
│   │   ├── architecture-pointer.mdc
│   │   ├── branch-safety-reminder.mdc
│   │   ├── cross-repo-status.mdc
│   │   ├── local-dev-testing.mdc
│   │   ├── pr-conventions.mdc
│   │   ├── repo-hygiene.mdc
│   │   ├── service-oriented-data-access.mdc
│   │   └── todo-conventions.mdc
│   └── skills/
│       └── brand-guidelines/
│           └── SKILL.md
├── .github/
│   └── workflows/
│       ├── ci.yml                    # PR checks (lint + build)
│       └── publish-artifact.yml      # Build + publish to GCS on main push
├── docs/
│   └── architecture.md
├── scripts/
│   ├── generate-manifest.mjs        # Generates manifest.json for artifact publishing
│   └── package-artifacts.sh          # Packages dist/ for GCS upload
├── src/                              # React + Vite SPA (TypeScript)
│   ├── App.tsx                       # Root component (AppRail + PaneToolbar + ChatPanel)
│   ├── index.css                     # Theme tokens (sidebar palette)
│   └── main.tsx                      # Entry point (AuthGate wrapper)
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Data Flow

### Chat-driven queries

1. User types an expense question in the `ChatPanel`
2. `ChatPanel` sends the message to `/agent/api/chat` with `appContext="expenses"`
3. The agent service routes to expense-specific tools (spend queries, analytics)
4. Responses stream back to the chat panel

### Agent tool-calling

The agent answers expense questions using OpenAI tool-calling against Postgres. Key capabilities:

- **Spend queries** — "What's my AWS spend this month?" uses the `execute_python` tool to query billing APIs
- **Trend analysis** — period-over-period comparisons, department breakdowns
- **Data export** — CSV generation for expense reports

All requests include a Firebase ID token via `Authorization: Bearer <idToken>`.

## Chat UI

The expenses app uses the domain shell layout from `@haderach/shared-ui`:

- **AppRail** — collapsible left rail with domain navigation, feedback popover, and user avatar.
- **PaneToolbar** — horizontal toolbar showing the chat icon (chat-only layout).
- **ChatPanel** (from `@haderach/shared-ui`) — full-height chat panel (`mode="panel"`). Communicates with the agent service at `/agent/api/chat` with `appContext="expenses"`.

The app renders chat-only — no analytics or data panes. As the expense domain grows, additional panes can be added using the same `PaneLayout` pattern as vendors and stocks.

### Authentication

Authentication is centralized at the platform level. Auth primitives and RBAC helpers (`APP_CATALOG`, `APP_GRANTING_ROLES`, `hasAppAccess`, `getAccessibleApps`) are imported from `@haderach/shared-ui`. The `AuthGate` component handles sign-in flow and token management.

In production, unauthenticated users are redirected to `/?returnTo=/expenses/` for platform sign-in. In local dev (`import.meta.env.DEV`), the app shows a dev-only "Sign in with Google" button.

In local development, Vite proxies `/agent/api` to `localhost:8080` (the agent service).

## Database

Expense data is stored in Cloud SQL Postgres (`haderach-main` instance, `haderach` database), managed by the agent service. The frontend never accesses the database directly — all reads and writes go through the agent service API.

## Routing

| Path | Target |
|------|--------|
| `/expenses/*` | Firebase Hosting → SPA `index.html` |
| `/agent/api/**` | Firebase Hosting rewrite → Cloud Run `agent-api` |

## Local Development

1. Copy `.env.example` to `.env` and fill in Firebase credentials (copy from `stocks/.env.local` or `haderach-home/.env.local`)
2. Start the agent service: `cd ../agent && source .venv/bin/activate && uvicorn service.app:app --port 8080`
3. Start frontend: `npm run dev` (Vite proxies `/agent/api` to `localhost:8080`)

## Deployment

Same artifact-based pattern as stocks and vendors:
- SPA: `npm run build` → `dist/expenses/` → GCS artifact bucket → platform promotion
- No backend service in this repo — the shared agent service handles all API requests
