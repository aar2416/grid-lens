// Shaped like the GraphQL types we'll expose later.
export interface Scenario { id: string; label: string; short: string }

export interface Bus { id: string; name: string; lng: number; lat: number }

export interface Line {
  id: string;
  name: string;
  from: string;
  to: string;
  coords: [number, number][];
  /** loading % of rating, indexed like SCENARIOS */
  loading: number[];
}

export interface Upgrade { id: string; lineId: string; description: string; costM: number; defaultOn: boolean }

export interface Project { id: string; name: string; busId: string; upgrades: Upgrade[] }
