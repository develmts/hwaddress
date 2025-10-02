import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("Formatting and aliases", () => {
  test("validFormats exposes canonical/dashed/dotted/plain when applicable", () => {
    const a = new HwAddress("aa:bb:cc:dd:ee:ff");
    const f = a.validFormats;
    expect(f.length).toBeGreaterThan(0);
    // Canonical (six groups of 2 with ':')
    expect(f.some(x => x === "xx:xx:xx:xx:xx:xx")).toBe(true);
    // Dashes:
    expect(f.some(x => x === "xx-xx-xx-xx-xx-xx")).toBe(true);
    // Plain hex:
    expect(f.some(x => x === "xxxxxxxxxxxx")).toBe(true);
  });

  test("format() accepts alias and exact pattern", () => {
    const a = new HwAddress("aa:bb:cc:dd:ee:ff");
    expect(a.format("canonical")).toBe("aa:bb:cc:dd:ee:ff");
    expect(a.format("xx-xx-xx-xx-xx-xx")).toBe("aa-bb-cc-dd-ee-ff");
  });

  test("format() throws on invalid chars or wrong x-count", () => {
    const a = new HwAddress("aa:bb:cc:dd:ee:ff");
    expect(() => a.format("xx*xx*xx*xx*xx*xx")).toThrow(); // '*' not allowed
    expect(() => a.format("xxx:xx:xx:xx:xx:xx")).toThrow(); // 13 hexes vs 12
  });
});
