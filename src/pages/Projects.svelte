<!--
  Projects page: one card per proposed project. Click a card to make it the current project
  (the map flies to its connection point); "Open study" jumps to the Study page.
-->
<script lang="ts">
  import GridMap from "../components/GridMap.svelte";
  import { buses, projects } from "../lib/study";
  import { navigate } from "../lib/router";
  import type { Project } from "../lib/types";
  import { project, projectId, selectedLineId, upgradeOverrides } from "../lib/stores";

  /** Cost of a project's ticked upgrades (respects the user's checkbox choices). */
  const cost = (p: Project, overrides: Record<string, boolean>) =>
    p.upgrades.filter((u) => overrides[u.id] ?? u.defaultOn).reduce((s, u) => s + u.costM, 0);

  function choose(id: string) {
    $projectId = id;
    $selectedLineId = null;
  }
</script>

<div class="page">
  <div class="content">
    <h1>Proposed projects</h1>
    {#each $projects as p (p.id)}
      <div class="card project" class:current={p.id === $project.id}
           on:click={() => choose(p.id)} on:keydown={(e) => e.key === "Enter" && choose(p.id)} role="button" tabindex="0">
        <div>
          <h3>{p.name}</h3>
          <p>Connects at {$buses[p.busId].name} · {p.upgrades.length} upgrades · ${cost(p, $upgradeOverrides).toFixed(1)}M</p>
        </div>
        <button on:click|stopPropagation={() => { choose(p.id); navigate("/study"); }}>Open study</button>
      </div>
    {/each}
  </div>
  <div class="map-slot"><GridMap /></div>
</div>

<style>
  h1 { margin: 0; font-size: 20px; }
  .project { display: flex; justify-content: space-between; align-items: center; gap: 12px; cursor: pointer; }
  .project.current { border-color: var(--acc); }
  .project h3 { margin: 0 0 4px; font-size: 15px; }
  .project p { margin: 0; color: var(--mut); font-size: 13px; }
</style>
