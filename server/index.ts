// GraphQL API on http://localhost:4000/graphql
//   Query         -> the study results (scenarios, buses, lines, projects)
//   Mutation      -> runStudy(projectId) starts a fake long job and returns a run id
//   Subscription  -> studyProgress(runId) streams progress until 100%
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { makeSchema } from "./schema";

const yoga = createYoga({ schema: makeSchema() });
createServer(yoga).listen(4000, () => console.log("GraphQL ready at http://localhost:4000/graphql"));
