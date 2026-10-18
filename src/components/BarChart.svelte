<!--
  Top-10 most loaded lines as horizontal bars.
  Svelte renders the SVG; D3 is used only for the scales (value -> pixels).
-->
<script lang="ts">
  import { scaleBand, scaleLinear } from "d3";
  import { loadColor } from "../lib/color";
  import { selectedLineId, toggleLine, topLines } from "../lib/stores";

  const W = 380, H = 250;
  const margin = { left: 118, right: 36, top: 4, bottom: 18 };

  // x: loading % -> pixels.  y: one row per line.
  const x = scaleLinear().domain([0, 130]).range([margin.left, W - margin.right]);
  $: y = scaleBand<string>()
    .domain($topLines.map((l) => l.id))
    .range([margin.top, H - margin.bottom])
    .padding(0.2);
</script>

<svg viewBox="0 0 {W} {H}" width="100%">
  <!-- dashed line marking 100% of rating -->
  <line x1={x(100)} x2={x(100)} y1={margin.top} y2={H - margin.bottom} stroke="#f85149" stroke-dasharray="3 3" />
  <text x={x(100)} y={H - 4} text-anchor="middle">100%</text>

  {#each $topLines as line (line.id)}
    {@const top = y(line.id) ?? 0}
    {@const mid = top + y.bandwidth() / 2 + 4}
    <g class="row" on:click={() => toggleLine(line.id)} on:keydown={() => {}} role="button" tabindex="0">
      <rect
        x={margin.left} y={top} height={y.bandwidth()} width={x(line.value) - margin.left}
        rx="3" fill={loadColor(line.value)}
        stroke={line.id === $selectedLineId ? "#fff" : "none"} stroke-width="2"
      />
      <text x={margin.left - 6} y={mid} text-anchor="end">{line.id} {line.name}</text>
      <text x={x(line.value) + 4} y={mid}>{line.value}%</text>
    </g>
  {/each}
</svg>

<style>
  .row { cursor: pointer; }
  /* keep long labels from overflowing the left margin */
  text { font-size: 10px; }
</style>
