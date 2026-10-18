<!-- Study page: big map on the left, charts and upgrades on the right. -->
<script lang="ts">
  import GridMap from "../components/GridMap.svelte";
  import BarChart from "../components/BarChart.svelte";
  import Heatmap from "../components/Heatmap.svelte";
  import Upgrades from "../components/Upgrades.svelte";
  import { scenario } from "../lib/stores";
</script>

<div class="page map-left">
  <div class="map-slot"><GridMap /></div>
  <div class="content side">
    <section class="card">
      <h2>Top 10 most loaded lines <small>{$scenario.label}</small></h2>
      <BarChart />
    </section>
    <section class="card">
      <h2>Line × scenario loading</h2>
      <Heatmap />
    </section>
    <section class="card">
      <h2>Recommended upgrades</h2>
      <Upgrades />
    </section>
  </div>
</div>

<style>
  .side { border-left: 1px solid var(--line); padding: 12px; }
  small { text-transform: none; letter-spacing: 0; color: var(--acc); margin-left: 6px; }
</style>
