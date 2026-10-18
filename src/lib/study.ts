// The study data (scenarios, buses, lines, projects), loaded once from the GraphQL API.
//
// It lives in a store with an explicit status, so nothing depends on import order:
// components render a loading or error screen until `status` is "ready".
import { derived, writable } from "svelte/store";
import studyQuery from "../graphql/Study.graphql?raw";
import type { StudyQuery } from "./generated/graphql";
import { gql } from "./gql";
import type { Bus, Line } from "./types";

export type StudyState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: StudyQuery };

export const study = writable<StudyState>({ status: "loading" });

export async function loadStudy(): Promise<void> {
  study.set({ status: "loading" });
  try {
    study.set({ status: "ready", data: await gql<StudyQuery>(studyQuery) });
  } catch (err) {
    study.set({ status: "error", message: (err as Error).message });
  }
}

// Convenient slices of the data. They are empty until the study has loaded.
export const scenarios = derived(study, ($s) => ($s.status === "ready" ? $s.data.scenarios : []));
export const lines = derived(study, ($s) => ($s.status === "ready" ? $s.data.lines : []));
export const projects = derived(study, ($s) => ($s.status === "ready" ? $s.data.projects : []));

/** Lookup tables, so finding a line or bus by id is O(1) instead of searching a list. */
export const buses = derived(study, ($s) =>
  Object.fromEntries(($s.status === "ready" ? $s.data.buses : []).map((b) => [b.id, b])) as Record<string, Bus>,
);
export const lineById = derived(lines, ($l) => Object.fromEntries($l.map((l) => [l.id, l])) as Record<string, Line>);
