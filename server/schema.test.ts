// @vitest-environment node
// Tests the GraphQL API by running real queries against the schema (no HTTP server needed).
// (Node environment, not jsdom: the server needs Node's real URL and fs.)
import { createYoga } from "graphql-yoga";
import { describe, expect, it } from "vitest";
import { LINES, PROJECTS } from "./data";
import { makeSchema } from "./schema";

const yoga = createYoga({ schema: makeSchema({ stepMs: 0 }), logging: false });

async function request(query: string, variables: Record<string, unknown> = {}) {
  const res = await yoga.fetch("http://localhost/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

describe("queries", () => {
  it("returns every line with one loading value per scenario", async () => {
    const { data } = await request("{ scenarios { id } lines { id loading } }");
    expect(data.lines).toHaveLength(LINES.length);
    for (const line of data.lines) expect(line.loading).toHaveLength(data.scenarios.length);
  });

  it("returns projects with their upgrades", async () => {
    const { data } = await request("{ projects { id upgrades { id costM } } }");
    expect(data.projects).toHaveLength(PROJECTS.length);
    expect(data.projects[0].upgrades.length).toBeGreaterThan(0);
  });

  it("rejects a query for a field that does not exist", async () => {
    const body = await request("{ nope }");
    expect(body.errors?.[0].message).toMatch(/nope/);
  });
});

describe("runStudy mutation", () => {
  it("returns a new run id each time", async () => {
    const a = await request("mutation($p: ID!) { runStudy(projectId: $p) { id } }", { p: "p1" });
    const b = await request("mutation($p: ID!) { runStudy(projectId: $p) { id } }", { p: "p1" });
    expect(a.data.runStudy.id).not.toBe(b.data.runStudy.id);
  });
});

describe("studyProgress subscription", () => {
  it("streams 0..100 in order and marks only the last event done", async () => {
    const res = await yoga.fetch("http://localhost/graphql", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream" },
      body: JSON.stringify({ query: "subscription { studyProgress(runId: \"1\") { percent done } }" }),
    });
    const text = await res.text();
    const events = [...text.matchAll(/^data: (.+)$/gm)].map((m) => JSON.parse(m[1]).data.studyProgress);

    const percents = events.map((e) => e.percent);
    expect(percents[0]).toBe(0);
    expect(percents.at(-1)).toBe(100);
    expect(percents).toEqual([...percents].sort((a, b) => a - b));
    expect(events.filter((e) => e.done)).toHaveLength(1);
    expect(events.at(-1).done).toBe(true);
  });
});
