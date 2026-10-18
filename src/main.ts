import "./app.css";
import { loadData } from "./lib/data";

async function start() {
  const target = document.getElementById("app")!;
  try {
    // 1. Fetch the study data first...
    await loadData();
    // 2. ...then import the app. It is imported dynamically because stores.ts reads the data
    //    as soon as it is evaluated, so it must not load before the data does.
    const { default: App } = await import("./App.svelte");
    new App({ target });
  } catch (err) {
    target.innerHTML = `<p style="margin:40px;color:#f85149">Could not load study data: ${(err as Error).message}.
      Is the API running? Try <code>npm run dev</code>.</p>`;
  }
}

start();
