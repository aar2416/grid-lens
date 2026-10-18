// The GraphQL schema (server/schema.graphql) plus its resolvers.
// Kept separate from index.ts so tests can use the schema without starting a server.
import { readFileSync } from "node:fs";
import { createSchema } from "graphql-yoga";
import { BUSES, LINES, PROJECTS, SCENARIOS } from "./data";

const typeDefs = readFileSync(new URL("./schema.graphql", import.meta.url), "utf8");

const STAGES = ["Building cases…", "Solving power flow…", "Running contingencies…", "Sizing upgrades…"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** `stepMs` is the pause between progress events (tests pass 0 to run instantly). */
export function makeSchema({ stepMs = 120 }: { stepMs?: number } = {}) {
  let nextRunId = 1;

  return createSchema({
    typeDefs,
    resolvers: {
      Query: {
        scenarios: () => SCENARIOS,
        buses: () => Object.values(BUSES),
        lines: () => LINES,
        projects: () => PROJECTS,
      },
      Mutation: {
        // Nothing real runs here; we just hand back an id the client can subscribe to.
        runStudy: (_: unknown, { projectId }: { projectId: string }) => ({ id: String(nextRunId++), projectId }),
      },
      Subscription: {
        studyProgress: {
          // An async generator: every `yield` pushes one event to the client.
          async *subscribe(_: unknown, { runId }: { runId: string }) {
            for (let percent = 0; percent <= 100; percent += 4) {
              const stage = STAGES[Math.min(3, Math.floor(percent / 25))];
              yield { studyProgress: { runId, percent, stage, done: percent === 100 } };
              if (stepMs > 0) await sleep(stepMs);
            }
          },
        },
      },
    },
  });
}
