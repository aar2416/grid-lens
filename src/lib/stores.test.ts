import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";
import type { Study } from "./types";
import { study } from "./study";
import {
  kpis, overloadsByScenario, project, projectId, scenarioIdx, selectedLineId,
  setUpgrade, toggleLine, topLines, totalCostM, upgradeOverrides, upgrades,
} from "./stores";

// A tiny made-up study: 3 lines x 2 scenarios, 2 projects.
const fixture: Study = {
  scenarios: [
    { id: "a", label: "Scenario A", short: "A" },
    { id: "b", label: "Scenario B", short: "B" },
  ],
  buses: [{ id: "X", name: "Xville", lng: 0, lat: 0 }],
  lines: [
    { id: "L1", name: "one", from: "X", to: "X", coords: [[0, 0], [1, 1]], loading: [50, 120] },
    { id: "L2", name: "two", from: "X", to: "X", coords: [[0, 0], [1, 1]], loading: [110, 80] },
    { id: "L3", name: "three", from: "X", to: "X", coords: [[0, 0], [1, 1]], loading: [90, 101] },
  ],
  projects: [
    { id: "p1", name: "P1", busId: "X", upgrades: [
      { id: "u1", lineId: "L1", description: "d1", costM: 10, defaultOn: true },
      { id: "u2", lineId: "L2", description: "d2", costM: 5, defaultOn: false },
    ] },
    { id: "p2", name: "P2", busId: "X", upgrades: [] },
  ],
};

beforeEach(() => {
  study.set({ status: "ready", data: fixture });
  scenarioIdx.set(0);
  projectId.set("");
  upgradeOverrides.set({});
  selectedLineId.set(null);
});

describe("topLines", () => {
  it("sorts by loading, highest first, for the selected scenario", () => {
    expect(get(topLines).map((l) => l.id)).toEqual(["L2", "L3", "L1"]);
    scenarioIdx.set(1);
    expect(get(topLines).map((l) => l.id)).toEqual(["L1", "L3", "L2"]);
  });

  it("returns at most 10 lines", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ ...fixture.lines[0], id: `M${i}`, loading: [i, i] }));
    study.set({ status: "ready", data: { ...fixture, lines: many } });
    expect(get(topLines)).toHaveLength(10);
    expect(get(topLines)[0].id).toBe("M14");
  });
});

describe("project", () => {
  it("falls back to the first project when none is chosen", () => {
    expect(get(project).id).toBe("p1");
  });
  it("uses the chosen project", () => {
    projectId.set("p2");
    expect(get(project).id).toBe("p2");
  });
});

describe("upgrades and total cost", () => {
  it("uses each upgrade's default when there is no override", () => {
    expect(get(upgrades).map((u) => u.on)).toEqual([true, false]);
    expect(get(totalCostM)).toBe(10);
  });
  it("updates the total when an upgrade is toggled", () => {
    setUpgrade("u2", true);
    expect(get(totalCostM)).toBe(15);
    setUpgrade("u1", false);
    expect(get(totalCostM)).toBe(5);
  });
});

describe("selection", () => {
  it("toggleLine selects, then deselects on a second click", () => {
    toggleLine("L2");
    expect(get(selectedLineId)).toBe("L2");
    toggleLine("L2");
    expect(get(selectedLineId)).toBeNull();
  });
  it("selecting another line replaces the selection", () => {
    toggleLine("L1");
    toggleLine("L3");
    expect(get(selectedLineId)).toBe("L3");
  });
});

describe("dashboard numbers", () => {
  it("counts overloaded lines (> 100%) and finds the worst line", () => {
    expect(get(kpis).overloaded).toBe(1);
    expect(get(kpis).worst.id).toBe("L2");
    scenarioIdx.set(1);
    expect(get(kpis).overloaded).toBe(2);
    expect(get(kpis).worst.id).toBe("L1");
  });
  it("computes the average loading", () => {
    expect(get(kpis).average).toBeCloseTo((50 + 110 + 90) / 3);
  });
  it("counts overloads per scenario", () => {
    expect(get(overloadsByScenario).map((o) => o.count)).toEqual([1, 2]);
  });
  it("does not crash before the data has loaded", () => {
    study.set({ status: "loading" });
    expect(get(kpis).overloaded).toBe(0);
    expect(get(topLines)).toEqual([]);
  });
});

describe("persistence", () => {
  it("saves the scenario to localStorage", () => {
    scenarioIdx.set(1);
    expect(localStorage.getItem("gl.scenario")).toBe("1");
  });
  it("saves the selected line to sessionStorage, not localStorage", () => {
    toggleLine("L1");
    expect(sessionStorage.getItem("gl.selectedLine")).toBe('"L1"');
    expect(localStorage.getItem("gl.selectedLine")).toBeNull();
  });
});
