// App state as Svelte stores (the Redux-equivalent here).
// Persistence: preferences -> localStorage, transient selection -> sessionStorage.
import { derived, writable, type Writable } from "svelte/store";
import { lines, projects, scenarios } from "./study";

function persisted<T>(key: string, initial: T, storage: Storage = localStorage): Writable<T> {
  let start = initial;
  try {
    const raw = storage.getItem(key);
    if (raw !== null) start = JSON.parse(raw) as T;
  } catch { /* storage unavailable or corrupt: fall back to initial */ }
  const store = writable<T>(start);
  store.subscribe((v) => {
    try { storage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
  });
  return store;
}

export const scenarioIdx = persisted<number>("gl.scenario", 0);
/** "" means "not chosen yet": `project` then falls back to the first project. */
export const projectId = persisted<string>("gl.project", "");
/** upgrade id -> included in the total? Missing = use the upgrade's default. */
export const upgradeOverrides = persisted<Record<string, boolean>>("gl.upgrades", {});
export const selectedLineId = persisted<string | null>("gl.selectedLine", null, sessionStorage);

export const scenario = derived([scenarioIdx, scenarios], ([$i, $s]) => $s[$i] ?? $s[0]);
export const project = derived([projectId, projects], ([$id, $p]) => $p.find((p) => p.id === $id) ?? $p[0]);

export const loadings = derived([scenarioIdx, lines], ([$i, $lines]) =>
  $lines.map((l) => ({ ...l, value: l.loading[$i] ?? 0 })),
);
export const topLines = derived(loadings, ($l) => [...$l].sort((a, b) => b.value - a.value).slice(0, 10));

export const upgrades = derived([project, upgradeOverrides], ([$p, $o]) =>
  ($p?.upgrades ?? []).map((u) => ({ ...u, on: $o[u.id] ?? u.defaultOn })),
);
export const totalCostM = derived(upgrades, ($u) => $u.filter((u) => u.on).reduce((s, u) => s + u.costM, 0));

export function toggleLine(id: string) {
  selectedLineId.update((cur) => (cur === id ? null : id));
}
export function setUpgrade(id: string, on: boolean) {
  upgradeOverrides.update((o) => ({ ...o, [id]: on }));
}

// --- Dashboard numbers --------------------------------------------------------

/** A line is overloaded when it carries more than 100% of its rating. */
export const isOverloaded = (value: number) => value > 100;

/** Headline numbers for the selected scenario. */
export const kpis = derived(loadings, ($l) => {
  const worst = $l.reduce((a, b) => (b.value > a.value ? b : a), $l[0]);
  return {
    overloaded: $l.filter((l) => isOverloaded(l.value)).length,
    worst,
    average: $l.length ? $l.reduce((s, l) => s + l.value, 0) / $l.length : 0,
  };
});

/** Overloaded-line count for every scenario (does not depend on the selected scenario). */
export const overloadsByScenario = derived([scenarios, lines], ([$s, $lines]) =>
  $s.map((scenario, index) => ({
    scenario,
    index,
    count: $lines.filter((l) => isOverloaded(l.loading[index])).length,
  })),
);
