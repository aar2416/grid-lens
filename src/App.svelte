<!--
  App shell: the header (navigation + global controls) stays put, and the page below it
  is chosen by the URL hash (see src/lib/router.ts).
  Nothing is shown until the study data has loaded (see src/lib/study.ts).
-->
<script lang="ts">
  import Header from "./components/Header.svelte";
  import Dashboard from "./pages/Dashboard.svelte";
  import Study from "./pages/Study.svelte";
  import Projects from "./pages/Projects.svelte";
  import Lines from "./pages/Lines.svelte";
  import { route } from "./lib/router";
  import { loadStudy, study } from "./lib/study";
</script>

{#if $study.status === "loading"}
  <p class="status">Loading study data…</p>
{:else if $study.status === "error"}
  <p class="status error">
    Could not load study data: {$study.message}. Is the API running (<code>npm run dev</code>)?
    <button on:click={loadStudy}>Retry</button>
  </p>
{:else}
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
{/if}

<style>
  .status { margin: 40px; color: var(--mut); }
  .error { color: #f85149; }
</style>
