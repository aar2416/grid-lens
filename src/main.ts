import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { loadStudy } from "./lib/study";

mount(App, { target: document.getElementById("app")! });
loadStudy(); // App shows a loading screen until this finishes
