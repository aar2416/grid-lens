import { describe, expect, it } from "vitest";
import { loadColor } from "./color";

describe("loadColor", () => {
  it("is green when lightly loaded", () => {
    expect(loadColor(0)).toBe(loadColor(70));
    expect(loadColor(30)).toBe("rgb(46, 160, 67)");
  });
  it("is red at 120% and stays red above it", () => {
    expect(loadColor(120)).toBe("rgb(248, 81, 73)");
    expect(loadColor(200)).toBe(loadColor(120));
  });
  it("is between green and red at 100%", () => {
    expect(loadColor(100)).toBe("rgb(212, 167, 44)");
  });
});
