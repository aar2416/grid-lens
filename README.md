# GridLens

A viewer for grid interconnection study results. Pick a proposed project and a scenario, and see which transmission lines are overloaded on a map, in charts and in tables, along with the recommended upgrades and their cost.

**Stack:** Svelte 5 · TypeScript · Vite 6 · Mapbox GL · D3 · GraphQL (graphql-yoga, with a subscription over SSE)

> All data is made up (central Texas) and the "Run study" job is simulated.

## Getting started

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
# edit .env and set VITE_MAPBOX_TOKEN to your public Mapbox token (pk.…)
npm run dev
```

Open http://localhost:5173. `npm run dev` starts the API (port 4000) and the web app together.

| Script | What it does |
|---|---|
| `npm run dev` | API + web app together |
| `npm run server` | GraphQL API only (`http://localhost:4000/graphql`) |
| `npm run web` | Vite dev server only |
| `npm run check` | Type-check (svelte-check) |
| `npm test` | Run the tests (Vitest) |
| `npm run codegen` | Regenerate GraphQL types after changing the schema or `src/graphql/*.graphql` |
| `npm run build` | Production build into `dist/` |

## Pages

Dashboard (`#/`) · Study (`#/study`) · Projects (`#/projects`) · Lines (`#/lines`). Each has the map alongside the content.

## Docs

- [PROJECT_GUIDE.md](PROJECT_GUIDE.md) – architecture, data flows, limitations
