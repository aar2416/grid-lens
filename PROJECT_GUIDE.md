# GridLens – Project Guide

## What it is

A viewer for **interconnection study results**. A developer proposes a power project (e.g. a solar farm). A study simulates the grid under different conditions to see which transmission lines would be overloaded, and recommends upgrades and their cost. GridLens shows that result on a map, in charts and in tables. The data is made up (central Texas).

## Run it

```
npm install
copy .env.example .env     # set VITE_MAPBOX_TOKEN=pk.xxxx
npm run dev                # API on :4000 + web on http://localhost:5173
```

Separately: `npm run server` (API) and `npm run web` (frontend). `npm run check` type-checks; `npm run build` makes a production build.

## Architecture

```
Browser (Svelte + TS)  ──/graphql──►  Vite proxy  ──►  GraphQL server (graphql-yoga, :4000)
  stores, pages, Mapbox, D3                              server/data.ts (hard-coded data)
```

### Backend (`server/`)
- `data.ts` – buses, lines, scenarios, projects (made-up data).
- `schema.graphql` – the GraphQL schema. `schema.ts` – resolvers (`makeSchema()`, used by the server and the tests). `index.ts` – starts the HTTP server.
- Behaviour:
  - **Queries** return the data.
  - **Mutation** `runStudy(projectId)` returns a run id (no real job runs).
  - **Subscription** `studyProgress(runId)` streams progress over Server-Sent Events, using an async generator.

### Frontend (`src/`)
| File | Role |
|---|---|
| `main.ts` | Mounts the app and starts loading the data |
| `lib/gql.ts` | Tiny GraphQL client: `fetch` for query/mutation, `EventSource` for subscription |
| `lib/study.ts` | The data in a store with a `loading` / `error` / `ready` status, plus derived slices (`lines`, `projects`, `lineById`, …) |
| `graphql/*.graphql` | The queries, mutation and subscription as real `.graphql` files |
| `lib/generated/graphql.ts` | Types generated from the schema and the `.graphql` files (`npm run codegen`) |
| `lib/stores.ts` | App state as Svelte stores (the Redux equivalent) |
| `lib/router.ts` | ~25-line hash router (`#/study`, `#/lines`, …) |
| `lib/color.ts` | D3 colour scale: green → amber → red by loading % |
| `pages/` | Dashboard, Study, Projects, Lines |
| `components/GridMap` | Mapbox map |
| `components/BarChart`, `Heatmap` | D3 scales, Svelte-rendered SVG |
| `components/Header`, `Upgrades` | Navigation/controls/Run study; upgrade list and total |

### State (`stores.ts`)
- Writable: `scenarioIdx`, `projectId`, `selectedLineId`, `upgradeOverrides`.
- Derived: `loadings`, `topLines`, `upgrades`, `totalCostM`, `kpis`.
- Persistence: preferences → `localStorage`; selected line → `sessionStorage`. All reads/writes are wrapped in try/catch.

**Core idea:** every view reads and writes the same stores. Clicking a bar, a map line, a table row or an upgrade all set `selectedLineId`, and everything else reacts.

## Pages

| Page | Left | Map |
|---|---|---|
| Dashboard `#/` | KPIs, overloads per scenario, 5 most loaded lines | Highlights the line clicked in the table |
| Study `#/study` | Top-10 bar chart, heatmap, upgrades + running total | Large map on the left |
| Projects `#/projects` | Project cards with upgrade cost | Flies to the project's connection point |
| Lines `#/lines` | All lines × scenarios, sortable | Highlights the selected line |

## Key data flows

**Startup:** `main.ts` mounts the app → `loadStudy()` sends one GraphQL query → `study` store goes `loading` → `ready` (or `error`, with a Retry button). `App.svelte` shows the matching screen, so nothing depends on import order.

**Click a line:** bar / map / heatmap cell / table row / upgrade row → `toggleLine(id)` → `selectedLineId` changes → map halo + zoom, bar and cell outlines, upgrade row highlight. No server call.

**Switch scenario:** `scenarioIdx` → `loadings` / `topLines` recompute → `GridMap` calls `setData(...)` (recolours lines) → charts re-render.

**Run study:** mutation `runStudy` → run id → subscription `studyProgress` over SSE → the async generator yields a progress event every 120 ms → progress bar updates; the stream closing re-enables the button.

## What is fake / limitations
- Data is hard-coded on the server.
- `runStudy` runs no real job; the server just counts to 100.
- Tests cover the stores, colour scale and API only: no component or end-to-end tests. No authentication.
- The map reloads on each page switch (it is created per page).
- Accessibility is partial (a11y warning on clickable `<li>` rows).
- No error state if the Mapbox style fails to load.
