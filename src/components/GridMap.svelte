<!--
  Mapbox map. Three line layers share one GeoJSON source:
    "selected"  - white halo under the selected line
    "overload"  - pulsing red glow under lines loaded above 100%
    "lines"     - the coloured lines themselves
  Whenever the scenario changes we rebuild the GeoJSON, which recolours everything.
-->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import { buses, lineById } from "../lib/study";
  import { loadColor } from "../lib/color";
  import { loadings, project, selectedLineId, toggleLine } from "../lib/stores";

  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  let container: HTMLDivElement;
  let map: mapboxgl.Map | undefined;
  let marker: mapboxgl.Marker | undefined;
  let ready = false; // true once the map style and layers exist
  let animationFrame = 0;

  /** Turn the current scenario's loadings into GeoJSON the map can draw. */
  function buildGeoJson(rows: typeof $loadings): GeoJSON.FeatureCollection {
    return {
      type: "FeatureCollection",
      features: rows.map((l) => ({
        type: "Feature",
        properties: { id: l.id, color: loadColor(l.value), overloaded: l.value > 100 ? 1 : 0 },
        geometry: { type: "LineString", coordinates: l.coords },
      })),
    };
  }

  onMount(() => {
    if (!token) return; // the template shows a setup message instead
    mapboxgl.accessToken = token;
    map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-97.4, 30.5],
      zoom: 7.1,
    });
    map.on("load", () => {
      addLayers();
      ready = true; // triggers the reactive blocks below
      pulseOverloadedLines();
    });
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
    map?.remove();
  });

  function addLayers() {
    const m = map!;
    m.addSource("lines", { type: "geojson", data: buildGeoJson($loadings) });

    m.addLayer({ id: "selected", type: "line", source: "lines", filter: ["==", ["get", "id"], ""],
      paint: { "line-color": "#ffffff", "line-width": 11, "line-opacity": 0.5 } });

    m.addLayer({ id: "overload", type: "line", source: "lines", filter: ["==", ["get", "overloaded"], 1],
      paint: { "line-color": "#f85149", "line-width": 10, "line-opacity": 0.3, "line-blur": 4 } });

    m.addLayer({ id: "lines", type: "line", source: "lines", layout: { "line-cap": "round" },
      paint: {
        "line-color": ["get", "color"],
        "line-width": ["case", ["==", ["get", "overloaded"], 1], 5, 3], // overloaded lines are thicker
      } });

    // Clicking a line selects it (same store the charts use)
    m.on("click", "lines", (e) => toggleLine(e.features![0].properties!.id));
    m.on("mouseenter", "lines", () => (m.getCanvas().style.cursor = "pointer"));
    m.on("mouseleave", "lines", () => (m.getCanvas().style.cursor = ""));
  }

  /** Make the red glow breathe by changing its width every frame. */
  function pulseOverloadedLines(time = 0) {
    map?.setPaintProperty("overload", "line-width", 8 + 6 * Math.sin(time / 350));
    animationFrame = requestAnimationFrame(pulseOverloadedLines);
  }

  // --- Reactive blocks: re-run when the store values they mention change ---

  // scenario changed -> recolour the lines
  $: if (ready) (map!.getSource("lines") as mapboxgl.GeoJSONSource).setData(buildGeoJson($loadings));

  // selection changed -> highlight (and zoom to) the line
  $: if (ready) {
    map!.setFilter("selected", ["==", ["get", "id"], $selectedLineId ?? ""]);
    if ($selectedLineId) {
      // coords come from GraphQL as number[][]; each point is [lng, lat]
      const [a, b] = $lineById[$selectedLineId].coords as [number, number][];
      map!.fitBounds([a, b], { padding: 160, maxZoom: 9, duration: 600 });
    }
  }

  // project changed -> move the marker to its point of interconnection
  $: if (ready) placeProjectMarker($project);

  function placeProjectMarker(p: typeof $project) {
    const bus = $buses[p.busId];
    marker?.remove();
    marker = new mapboxgl.Marker({ color: "#58a6ff" })
      .setLngLat([bus.lng, bus.lat])
      .setPopup(new mapboxgl.Popup({ offset: 24 }).setHTML(`<b>${p.name}</b><br>Connects at ${bus.name}`))
      .addTo(map!);
    // Fly to the new project unless the user is looking at a specific line.
    if (!$selectedLineId) map!.flyTo({ center: [bus.lng, bus.lat], zoom: 8, duration: 800 });
  }
</script>

<section class="wrap">
  {#if token}
    <div class="map" bind:this={container}></div>
    <div class="legend"><span>0%</span><i></i><span>120%+</span></div>
  {:else}
    <p class="notice">
      Add a Mapbox token: copy <code>.env.example</code> to <code>.env</code> and set <code>VITE_MAPBOX_TOKEN</code>,
      then restart <code>npm run dev</code>.
    </p>
  {/if}
</section>

<style>
  .wrap { position: absolute; inset: 0; } /* fills its .map-slot parent */
  .map { position: absolute; inset: 0; }
  .legend { position: absolute; left: 12px; bottom: 28px; z-index: 1; background: #0f1419cc; padding: 6px 10px; border-radius: 6px; display: flex; gap: 8px; align-items: center; font-size: 12px; color: var(--mut); }
  .legend i { width: 120px; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #2ea043, #d4a72c, #f85149); }
  .notice { margin: 40px; color: var(--mut); }
</style>
