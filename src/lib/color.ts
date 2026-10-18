import { scaleLinear } from "d3";

/** green -> amber -> red by loading %. */
export const loadColor = scaleLinear<string>()
  .domain([0, 70, 100, 120])
  .range(["#2ea043", "#2ea043", "#d4a72c", "#f85149"])
  .clamp(true);
