<!--
  Heatmap: rows = lines, columns = scenarios, cell colour = loading %.
  Shows where problems cluster. Click a cell to jump to that line + scenario.
-->
<script lang="ts">
  import { lines, scenarios } from "../lib/study";
  import { loadColor } from "../lib/color";
  import { scenarioIdx, selectedLineId, toggleLine } from "../lib/stores";

  const cellW = 80, cellH = 17, labelW = 40, headerH = 36;
  $: width = labelW + cellW * $scenarios.length;
  $: height = headerH + cellH * $lines.length + 4;

  function pickCell(lineId: string, scenarioIndex: number) {
    $scenarioIdx = scenarioIndex;
    $selectedLineId = lineId; // set (not toggle) so clicking never deselects
  }
</script>

<svg viewBox="0 0 {width} {height}" width="100%">
  <!-- column headers: click to switch scenario -->
  {#each $scenarios as s, col}
    <text
      x={labelW + col * cellW + cellW / 2} y={headerH - 6} text-anchor="middle"
      class="clickable" font-weight={col === $scenarioIdx ? 700 : 400}
      on:click={() => ($scenarioIdx = col)} on:keydown={() => {}} role="button" tabindex="0"
    >{s.short}</text>
  {/each}

  {#each $lines as line, row}
    {@const rowY = headerH + row * cellH}
    <!-- row label: click to select the line -->
    <text
      x={labelW - 6} y={rowY + 12} text-anchor="end" class="clickable"
      font-weight={line.id === $selectedLineId ? 700 : 400}
      on:click={() => toggleLine(line.id)} on:keydown={() => {}} role="button" tabindex="0"
    >{line.id}</text>

    {#each line.loading as value, col}
      <g class="clickable" on:click={() => pickCell(line.id, col)} on:keydown={() => {}} role="button" tabindex="0">
        <rect
          x={labelW + col * cellW + 1} y={rowY + 1} width={cellW - 2} height={cellH - 2} rx="2"
          fill={loadColor(value)} opacity={col === $scenarioIdx ? 1 : 0.6}
          stroke={line.id === $selectedLineId ? "#fff" : "none"} stroke-width="2"
        />
        <text x={labelW + col * cellW + cellW / 2} y={rowY + 12} text-anchor="middle" fill="#fff">{value}</text>
      </g>
    {/each}
  {/each}
</svg>

<style>
  .clickable { cursor: pointer; }
</style>
