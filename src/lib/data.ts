// Study data, fetched once from the GraphQL API at startup (see main.ts).
// These are ES-module "live bindings": they start empty and are filled by loadData(),
// so nothing may read them until loadData() has resolved.
import { gql } from "./gql";
import type { Bus, Line, Project, Scenario } from "./types";

export let SCENARIOS: Scenario[] = [];
export let BUSES: Record<string, Bus> = {};
export let LINES: Line[] = [];
export let LINE_BY_ID: Record<string, Line> = {};
export let PROJECTS: Project[] = [];

const STUDY_QUERY = /* GraphQL */ `
  query Study {
    scenarios { id label short }
    buses { id name lng lat }
    lines { id name from to coords loading }
    projects { id name busId upgrades { id lineId description costM defaultOn } }
  }
`;

export async function loadData(): Promise<void> {
  const d = await gql<{ scenarios: Scenario[]; buses: Bus[]; lines: Line[]; projects: Project[] }>(STUDY_QUERY);
  SCENARIOS = d.scenarios;
  BUSES = Object.fromEntries(d.buses.map((b) => [b.id, b]));
  LINES = d.lines;
  LINE_BY_ID = Object.fromEntries(d.lines.map((l) => [l.id, l]));
  PROJECTS = d.projects;
}
