// Minimal hash router: the URL "http://localhost:5173/#/lines" means path "/lines".
// Hash routing needs no server config, and the back/forward buttons just work.
import { readable } from "svelte/store";

export const PAGES = [
  { path: "/", label: "Dashboard" },
  { path: "/study", label: "Study" },
  { path: "/projects", label: "Projects" },
  { path: "/lines", label: "Lines" },
] as const;

const currentPath = () => location.hash.replace(/^#/, "") || "/";

/** The current path, updated whenever the URL hash changes. */
export const route = readable(currentPath(), (set) => {
  const onChange = () => set(currentPath());
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
});

export function navigate(path: string) {
  location.hash = path;
}
