import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("JSON serialization", () => {
  test("toJSON and fromJSON round-trip", () => {
    const a = new HwAddress("aa:bb:cc:dd:ee:ff");
    const j = a.toJSON();
    const b = HwAddress.fromJSON(j);
    expect(b.canonical).toBe(a.canonical);
    expect(b.length).toBe(a.length);
  });

  test("fromJSON validation errors", () => {
    expect(() => HwAddress.fromJSON("nope" as any)).toThrow();
    expect(() => HwAddress.fromJSON({ canonical: 123, length: "x" } as any)).toThrow();
    expect(() => HwAddress.fromJSON({ canonical: "aa:bb:cc:dd:ee:ff", length: "48" } as any)).toThrow();
  });
});
