<!--
  Recommended upgrades for the chosen project, with a running total.
  Tick/untick to include or exclude an upgrade; click a row to highlight its line.
-->
<script lang="ts">
  import { lineById } from "../lib/study";
  import { selectedLineId, setUpgrade, toggleLine, totalCostM, upgrades } from "../lib/stores";
</script>

<ul>
  {#each $upgrades as u (u.id)}
    <li class:selected={u.lineId === $selectedLineId} on:click={() => toggleLine(u.lineId)} on:keydown={() => {}}>
      <!-- stopPropagation: ticking the box shouldn't also select the line -->
      <input
        type="checkbox" checked={u.on}
        on:click|stopPropagation
        on:change={(e) => setUpgrade(u.id, e.currentTarget.checked)}
      />
      <div class="desc">
        {u.description}
        <small>{u.lineId} · {$lineById[u.lineId].name}</small>
      </div>
      <div class="cost">${u.costM.toFixed(1)}M</div>
    </li>
  {/each}
</ul>
<div class="total">Total <b>${$totalCostM.toFixed(1)}M</b></div>

<style>
  ul { list-style: none; margin: 0; padding: 0; }
  li { display: flex; gap: 8px; align-items: flex-start; padding: 8px 6px; border-bottom: 1px solid var(--line); cursor: pointer; border-radius: 4px; }
  li:hover, li.selected { background: #ffffff0d; }
  .desc { flex: 1; }
  .desc small { display: block; color: var(--mut); }
  .cost { font-variant-numeric: tabular-nums; }
  .total { display: flex; justify-content: space-between; padding: 10px 6px 0; font-size: 15px; }
</style>
