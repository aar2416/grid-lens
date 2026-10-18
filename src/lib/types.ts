// Domain types, taken from the generated GraphQL types so they always match the schema.
// (Run `npm run codegen` after changing server/schema.graphql or src/graphql/*.graphql.)
import type { StudyQuery } from "./generated/graphql";

export type Study = StudyQuery;
export type Scenario = StudyQuery["scenarios"][number];
export type Bus = StudyQuery["buses"][number];
export type Line = StudyQuery["lines"][number];
export type Project = StudyQuery["projects"][number];
export type Upgrade = Project["upgrades"][number];
