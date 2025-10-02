import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("Comparison, sorting and hash", () => {
  const a = new HwAddress("00:00:00:00:00:01");
  const b = new HwAddress("00:00:00:00:00:02");
  const c = new HwAddress("00:00:00:00:00:02");
  const z = new HwAddress("00:00:00:00:00:01:01"); // 56-bit, for length mismatch error

  test("equals compares length and value", () => {
    expect(a.equals(b)).toBe(false);
    expect(b.equals(c)).toBe(true);
  });

  test("compareTo and compare (same length)", () => {
    expect(a.compareTo(b)).toBe(-1);
    expect(b.compareTo(a)).toBe(1);
    expect(b.compareTo(c)).toBe(0);
  });

  test("compareTo throws on different lengths", () => {
    expect(() => a.compareTo(z)).toThrow();
  });

  test("static sort asc/desc", () => {
    const sorted = HwAddress.sort([b, a, c]); // asc by default
    expect(sorted.map(x => x.canonical)).toEqual([
      "00:00:00:00:00:01",
      "00:00:00:00:00:02",
      "00:00:00:00:00:02"
    ]);
    const desc = HwAddress.sort([b, a, c], "desc");
    expect(desc[0].canonical).toBe("00:00:00:00:00:02");
  });

  test("hash format is canonical@length", () => {
    expect(a.hash()).toBe("00:00:00:00:00:01@48");
  });
});
