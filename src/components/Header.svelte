<!--
  Top bar: page navigation, project picker, scenario switcher, and the "Run study" button.
  "Run study" = GraphQL mutation (start a run) + subscription (stream progress).
-->
<script lang="ts">
  import runStudyMutation from "../graphql/RunStudy.graphql?raw";
  import studyProgressSubscription from "../graphql/StudyProgress.graphql?raw";
  import type { RunStudyMutation, StudyProgressSubscription } from "../lib/generated/graphql";
  import { gql, subscribe } from "../lib/gql";
  import { PAGES, route } from "../lib/router";
  import { projects, scenarios } from "../lib/study";
  import { project, projectId, scenarioIdx, selectedLineId } from "../lib/stores";

  let running = false;
  let progress = 0; // 0..100
  let status = "";

  async function runStudy() {
    running = true;
    progress = 0;
    status = "Starting…";
    try {
      // 1. Mutation: ask the server to start a run; it returns a run id.
      const { runStudy } = await gql<RunStudyMutation>(runStudyMutation, { projectId: $project.id });
      // 2. Subscription: the server pushes progress events for that run until it is done.
      subscribe<StudyProgressSubscription>(
        studyProgressSubscription,
        { runId: runStudy.id },
        ({ studyProgress: p }) => {
          progress = p.percent;
          status = p.done ? "Study complete" : `${p.stage} ${p.percent}%`;
        },
        () => (running = false), // stream closed -> re-enable the button
      );
    } catch (err) {
      status = `Failed: ${(err as Error).message}`;
      running = false;
    }
  }

  function pickProject(e: Event) {
    $projectId = (e.target as HTMLSelectElement).value;
    $selectedLineId = null; // the old selection may not belong to this project
  }
</script>

<header>
  <div class="brand">GridLens <span>Interconnection Study Results</span></div>

  <nav>
    {#each PAGES as p}<a href="#{p.path}" class:active={$route === p.path}>{p.label}</a>{/each}
  </nav>

  <label>
    Project
    <select value={$project.id} on:change={pickProject}>
      {#each $projects as p}<option value={p.id}>{p.name}</option>{/each}
    </select>
  </label>

  <div class="seg">
    {#each $scenarios as s, i}
      <button class:on={$scenarioIdx === i} on:click={() => ($scenarioIdx = i)}>{s.label}</button>
    {/each}
  </div>

  <div class="run">
    {#if running}<div class="track"><div class="fill" style="width:{progress}%"></div></div>{/if}
    <span class="status">{status}</span>
    <button class="primary" disabled={running} on:click={runStudy}>Run study</button>
  </div>
</header>

<style>
  header { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--line); background: var(--panel); }
  .brand { font-weight: 700; font-size: 16px; }
  .brand span { color: var(--mut); font-weight: 400; margin-left: 8px; }
  nav { display: flex; gap: 4px; }
  nav a { color: var(--mut); text-decoration: none; padding: 6px 10px; border-radius: 6px; }
  nav a:hover { color: var(--fg); }
  nav a.active { color: var(--fg); background: #ffffff14; }
  label { color: var(--mut); display: flex; gap: 8px; align-items: center; }
  .seg { display: flex; }
  .seg button { border-radius: 0; margin-left: -1px; }
  .seg button:first-child { border-radius: 6px 0 0 6px; margin-left: 0; }
  .seg button:last-child { border-radius: 0 6px 6px 0; }
  .seg button.on { background: var(--acc); border-color: var(--acc); color: #04121f; font-weight: 600; }
  .run { margin-left: auto; display: flex; gap: 10px; align-items: center; }
  .primary { background: var(--acc); border-color: var(--acc); color: #04121f; font-weight: 600; }
  .primary:disabled { opacity: 0.5; cursor: default; }
  .track { width: 140px; height: 6px; background: var(--line); border-radius: 3px; overflow: hidden; }
  .fill { height: 100%; background: #3fb950; }
  .status { color: var(--mut); font-size: 12px; }
</style>
