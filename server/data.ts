// Static, made-up study data (central Texas). Swap for GraphQL queries later.
import type { Bus, Line, Project, Scenario } from "../src/lib/types";

export const SCENARIOS: Scenario[] = [
  { id: "summer", label: "Summer peak", short: "Summer" },
  { id: "winter", label: "Winter peak", short: "Winter" },
  { id: "light", label: "Light load", short: "Light" },
  { id: "outage", label: "L5 out of service", short: "L5 out" },
];

const busList: [string, string, number, number][] = [
  ["WAC", "Waco", -97.15, 31.55], ["TPL", "Temple", -97.34, 31.1], ["KIL", "Killeen", -97.73, 31.12],
  ["GEO", "Georgetown", -97.68, 30.63], ["RRK", "Round Rock", -97.62, 30.51], ["AUS", "Austin", -97.74, 30.27],
  ["SMR", "San Marcos", -97.94, 29.88], ["NBF", "New Braunfels", -98.12, 29.7], ["SAT", "San Antonio", -98.49, 29.42],
  ["BAS", "Bastrop", -97.31, 30.11], ["GID", "Giddings", -96.94, 30.18], ["BRN", "Brenham", -96.4, 30.17],
  ["LCK", "Lockhart", -97.67, 29.88], ["HRN", "Hearne", -96.6, 30.88], ["CST", "College Station", -96.33, 30.63],
  ["JCT", "Johnson City", -98.41, 30.28],
];
export const BUSES: Record<string, Bus> = Object.fromEntries(
  busList.map(([id, name, lng, lat]) => [id, { id, name, lng, lat }]),
);

const lineList: [string, string, string, number[]][] = [
  ["L1", "WAC", "TPL", [72, 65, 38, 74]],
  ["L2", "TPL", "KIL", [88, 70, 41, 90]],
  ["L3", "TPL", "GEO", [97, 81, 52, 128]],
  ["L4", "KIL", "GEO", [64, 58, 33, 69]],
  ["L5", "RRK", "AUS", [108, 84, 47, 0]],
  ["L6", "AUS", "SMR", [93, 77, 44, 119]],
  ["L7", "SMR", "NBF", [85, 72, 39, 91]],
  ["L8", "NBF", "SAT", [101, 88, 49, 104]],
  ["L9", "AUS", "BAS", [82, 69, 36, 98]],
  ["L10", "BAS", "GID", [61, 55, 29, 73]],
  ["L11", "GID", "BRN", [49, 52, 25, 55]],
  ["L12", "BAS", "LCK", [74, 63, 35, 86]],
  ["L13", "LCK", "SMR", [58, 50, 27, 66]],
  ["L14", "HRN", "CST", [67, 71, 30, 68]],
  ["L15", "HRN", "TPL", [76, 73, 42, 79]],
  ["L16", "JCT", "AUS", [69, 58, 34, 82]],
  ["L17", "GEO", "RRK", [79, 66, 40, 112]],
];
export const LINES: Line[] = lineList.map(([id, from, to, loading]) => ({
  id, from, to, loading,
  name: `${BUSES[from].name} – ${BUSES[to].name}`,
  coords: [[BUSES[from].lng, BUSES[from].lat], [BUSES[to].lng, BUSES[to].lat]],
}));
export const LINE_BY_ID: Record<string, Line> = Object.fromEntries(LINES.map((l) => [l.id, l]));

export const PROJECTS: Project[] = [
  { id: "p1", name: "Bastrop Solar + Storage (250 MW)", busId: "BAS", upgrades: [
    { id: "u1", lineId: "L9", description: "Reconductor Austin – Bastrop 138 kV", costM: 18.4, defaultOn: true },
    { id: "u2", lineId: "L5", description: "Rebuild Round Rock – Austin 345 kV", costM: 42.0, defaultOn: true },
    { id: "u3", lineId: "L6", description: "Add 2nd circuit Austin – San Marcos", costM: 27.5, defaultOn: true },
    { id: "u4", lineId: "L8", description: "Terminal equipment upgrade, New Braunfels", costM: 6.2, defaultOn: false },
  ] },
  { id: "p2", name: "Giddings Wind (400 MW)", busId: "GID", upgrades: [
    { id: "u5", lineId: "L10", description: "Reconductor Bastrop – Giddings 138 kV", costM: 21.0, defaultOn: true },
    { id: "u6", lineId: "L9", description: "Reconductor Austin – Bastrop 138 kV", costM: 18.4, defaultOn: true },
    { id: "u7", lineId: "L3", description: "Series compensation, Temple – Georgetown", costM: 33.8, defaultOn: false },
  ] },
  { id: "p3", name: "Hearne Gas Peaker (300 MW)", busId: "HRN", upgrades: [
    { id: "u8", lineId: "L15", description: "Rebuild Hearne – Temple 345 kV", costM: 39.5, defaultOn: true },
    { id: "u9", lineId: "L3", description: "Series compensation, Temple – Georgetown", costM: 33.8, defaultOn: true },
    { id: "u10", lineId: "L2", description: "Relay upgrades, Temple – Killeen", costM: 4.1, defaultOn: true },
  ] },
];
