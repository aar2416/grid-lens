<!--
  Dashboard: headline numbers on the left, map on the right.
  Clicking a line in the table highlights it on the map (shared selectedLineId store).
-->
<script lang="ts">
  import GridMap from "../components/GridMap.svelte";
  import { loadColor } from "../lib/color";
  import { BUSES } from "../lib/data";
  import { navigate } from "../lib/router";
  import {
    isOverloaded, kpis, overloadsByScenario, project, scenario, scenarioIdx,
    selectedLineId, toggleLine, topLines, totalCostM,
  } from "../lib/stores";

  $: worstFive = $topLines.slice(0, 5);
  $: maxOverloads = Math.max(...overloadsByScenario.map((o) => o.count), 1);
</script>

<div class="page">
  <div class="content">
    <h1>{$project.name} <small>connects at {BUSES[$project.busId].name} · {$scenario.label}</small></h1>

    <!-- 1. Headline numbers -->
    <div class="kpis">
      <div class="card kpi">
        <span>Overloaded lines</span>
        <b style="color:{$kpis.overloaded ? '#f85149' : '#2ea043'}">{$kpis.overloaded}</b>
      </div>
      <div class="card kpi">
        <span>Worst line</span>
        <b>{$kpis.worst.value}%</b><em>{$kpis.worst.id} · {$kpis.worst.name}</em>
      </div>
      <div class="card kpi">
        <span>Average loading</span>
        <b>{$kpis.average.toFixed(0)}%</b>
      </div>
      <div class="card kpi">
        <span>Upgrade cost</span>
        <b>${$totalCostM.toFixed(1)}M</b>
      </div>
    </div>

    <!-- 2. Overloads per scenario: click a bar to switch scenario -->
    <section class="card">
      <h2>Overloaded lines by scenario</h2>
      {#each overloadsByScenario as o}
        <button class="scen" class:on={o.index === $scenarioIdx} on:click={() => ($scenarioIdx = o.index)}>
          <span class="name">{o.scenario.label}</span>
          <span class="track"><span class="fill" style="width:{(o.count / maxOverloads) * 100}%"></span></span>
          <span class="n">{o.count}</span>
        </button>
      {/each}
    </section>

    <!-- 3. Most loaded lines: click a row to highlight it on the map -->
    <section class="card">
      <h2>Most loaded lines</h2>
      <table>
        <thead><tr><th>Line</th><th>Route</th><th>Loading</th></tr></thead>
        <tbody>
          {#each worstFive as l (l.id)}
            <tr class="clickable" class:selected={l.id === $selectedLineId}
                on:click={() => toggleLine(l.id)} on:keydown={(e) => e.key === "Enter" && toggleLine(l.id)} tabindex="0">
              <td>{l.id}</td><td>{l.name}</td>
              <td><span class="pill" style="background:{loadColor(l.value)}">{l.value}%</span></td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="more"><a href="#/lines">All lines →</a> <a href="#/study" on:click|preventDefault={() => navigate("/study")}>Full study view →</a></p>
    </section>

    <p class="hint">Overloaded: {$topLines.filter((l) => isOverloaded(l.value)).length} of the top 10 exceed 100% of rating.</p>
  </div>

  <div class="map-slot"><GridMap /></div>
</div>

<style>
  h1 { margin: 0; font-size: 20px; }
  h1 small { display: block; font-size: 13px; font-weight: 400; color: var(--mut); margin-top: 2px; }
  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .kpi { display: flex; flex-direction: column; gap: 2px; }
  .kpi span { color: var(--mut); font-size: 12px; }
  .kpi b { font-size: 26px; }
  .kpi em { font-style: normal; color: var(--mut); font-size: 12px; }
  .scen { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: none; padding: 5px 4px; border-radius: 4px; text-align: left; }
  .scen.on { background: #4da3ff22; }
  .scen .name { width: 130px; }
  .scen .track { flex: 1; height: 8px; background: var(--line); border-radius: 4px; overflow: hidden; }
  .scen .fill { display: block; height: 100%; background: #f85149; }
  .scen .n { width: 20px; text-align: right; }
  .more { margin: 10px 0 0; display: flex; gap: 16px; }
  a { color: var(--acc); text-decoration: none; }
  .hint { color: var(--mut); font-size: 12px; margin: 0; }
</style>
