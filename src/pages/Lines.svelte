<!--
  Lines page: every line in a table (one column per scenario), map on the right.
  Click a column header to sort by that scenario; click a row to highlight the line on the map.
-->
<script lang="ts">
  import GridMap from "../components/GridMap.svelte";
  import { loadColor } from "../lib/color";
  import { lines, scenarios } from "../lib/study";
  import { scenarioIdx, selectedLineId, toggleLine } from "../lib/stores";

  let sortBy = -1; // -1 = by line id, otherwise a scenario index
  $: rows = sortBy < 0 ? $lines : [...$lines].sort((a, b) => b.loading[sortBy] - a.loading[sortBy]);
</script>

<div class="page">
  <div class="content">
    <h1>All lines</h1>
    <section class="card">
      <table>
        <thead>
          <tr>
            <th><button class="th" on:click={() => (sortBy = -1)}>Line</button></th>
            <th>Route</th>
            {#each $scenarios as s, i}
              <th><button class="th" class:active={sortBy === i} on:click={() => (sortBy = i)}>{s.short} {sortBy === i ? "↓" : ""}</button></th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as l (l.id)}
            <tr class="clickable" class:selected={l.id === $selectedLineId}
                on:click={() => toggleLine(l.id)} on:keydown={(e) => e.key === "Enter" && toggleLine(l.id)} tabindex="0">
              <td>{l.id}</td><td>{l.name}</td>
              {#each l.loading as v, i}
                <td><span class="pill" style="background:{loadColor(v)}; opacity:{i === $scenarioIdx ? 1 : 0.6}">{v}%</span></td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  </div>
  <div class="map-slot"><GridMap /></div>
</div>

<style>
  h1 { margin: 0; font-size: 20px; }
  .th { border: 0; background: none; padding: 0; color: var(--mut); font-size: 12px; }
  .th.active { color: var(--acc); }
</style>
