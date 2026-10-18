import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // gives the stores a localStorage / sessionStorage
    include: ["src/**/*.test.ts", "server/**/*.test.ts"],
  },
});
