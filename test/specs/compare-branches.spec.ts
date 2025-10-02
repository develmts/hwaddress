import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("Comparison branch coverage", () => {
  const a = new HwAddress("00:00:00:00:00:01");
  const b = new HwAddress("00:00:00:00:00:02");
  const c = new HwAddress("00:00:00:00:00:02");

  test("lessThanOrEqual true and false branches", () => {
    expect(a.lessThanOrEqual(b)).toBe(true);  // a < b
    expect(b.lessThanOrEqual(a)).toBe(false); // b <= a false
    expect(b.lessThanOrEqual(c)).toBe(true);  // b == c
  });

  test("greaterThanOrEqual true and false branches", () => {
    expect(b.greaterThanOrEqual(a)).toBe(true);  // b > a
    expect(a.greaterThanOrEqual(b)).toBe(false); // a >= b false
    expect(b.greaterThanOrEqual(c)).toBe(true);  // b == c
  });
});
