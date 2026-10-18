<!--
  App shell: the header (navigation + global controls) stays put, and the page below it
  is chosen by the URL hash (see src/lib/router.ts).
-->
<script lang="ts">
  import Header from "./components/Header.svelte";
  import Dashboard from "./pages/Dashboard.svelte";
  import Study from "./pages/Study.svelte";
  import Projects from "./pages/Projects.svelte";
  import Lines from "./pages/Lines.svelte";
  import { route } from "./lib/router";
</script>

<Header />

{#if $route === "/study"}
  <Study />
{:else if $route === "/projects"}
  <Projects />
{:else if $route === "/lines"}
  <Lines />
{:else}
  <Dashboard />
{/if}
