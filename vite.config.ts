import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  // The browser talks to /graphql on the Vite port; Vite forwards it to the API server (no CORS needed).
  server: { proxy: { "/graphql": "http://localhost:4000" } },
});
