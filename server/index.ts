// GraphQL API on http://localhost:4000/graphql
//   Query         -> the study results (scenarios, buses, lines, projects)
//   Mutation      -> runStudy(projectId) starts a fake long job and returns a run id
//   Subscription  -> studyProgress(runId) streams progress until 100%
import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import { BUSES, LINES, PROJECTS, SCENARIOS } from "./data";

const typeDefs = /* GraphQL */ `
  type Scenario { id: ID!, label: String!, short: String! }
  type Bus { id: ID!, name: String!, lng: Float!, lat: Float! }
  type Line {
    id: ID!
    name: String!
    from: ID!
    to: ID!
    coords: [[Float!]!]!
    "Loading % of rating, one value per scenario (same order as 'scenarios')"
    loading: [Float!]!
  }
  type Upgrade { id: ID!, lineId: ID!, description: String!, costM: Float!, defaultOn: Boolean! }
  type Project { id: ID!, name: String!, busId: ID!, upgrades: [Upgrade!]! }

  type StudyRun { id: ID!, projectId: ID! }
  type StudyProgress { runId: ID!, percent: Int!, stage: String!, done: Boolean! }

  type Query {
    scenarios: [Scenario!]!
    buses: [Bus!]!
    lines: [Line!]!
    projects: [Project!]!
  }
  type Mutation { runStudy(projectId: ID!): StudyRun! }
  type Subscription { studyProgress(runId: ID!): StudyProgress! }
`;

const STAGES = ["Building cases…", "Solving power flow…", "Running contingencies…", "Sizing upgrades…"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let nextRunId = 1;

const resolvers = {
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
          yield { studyProgress: { runId, percent, stage: STAGES[Math.min(3, Math.floor(percent / 25))], done: percent === 100 } };
          await sleep(120);
        }
      },
    },
  },
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) });
createServer(yoga).listen(4000, () => console.log("GraphQL ready at http://localhost:4000/graphql"));
