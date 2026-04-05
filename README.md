# Expense Tracking

Chat-driven expense analytics — query spend data, view trends, and get answers about expenses across vendors and departments.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and fill in Firebase credentials
cp .env.example .env

# Start the agent service (in a separate terminal)
cd ../agent
source .venv/bin/activate
uvicorn service.app:app --port 8080

# Start the frontend
npm run dev
```

## Repo layout

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
│       ├── ci.yml
│       └── publish-artifact.yml
├── docs/
│   └── architecture.md
├── scripts/
│   ├── generate-manifest.mjs
│   └── package-artifacts.sh
├── src/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
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

## Architecture

See [docs/architecture.md](docs/architecture.md) for full details.
