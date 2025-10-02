import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("HwAddress invalid input handling", () => {
  test("auto-detects length for short/long colon-separated inputs", () => {
    const a5 = new HwAddress("aa:bb:cc:dd:ee");              // 5 octets
    expect(a5.length).toBe(40);
    expect(a5.canonical).toBe("aa:bb:cc:dd:ee");

    const a7 = new HwAddress("aa:bb:cc:dd:ee:ff:00");        // 7 octets
    expect(a7.length).toBe(56);
    expect(a7.canonical).toBe("aa:bb:cc:dd:ee:ff:00");
  });

  test("rejects non-hex characters", () => {
    expect(() => new HwAddress("gg:bb:cc:dd:ee:ff")).toThrow();            // 'g' not hex
    expect(() => new HwAddress("zzzz.ccdd.eeff", 48)).toThrow();           // Cisco dotted but invalid hex
  });

  test("rejects unsupported separators", () => {
    expect(() => new HwAddress("aa_bb_cc_dd_ee_ff", 48)).toThrow();        // underscores
    expect(() => new HwAddress("aa.bb.cc.dd.ee.ff", 48)).toThrow();        // dot-separated octets (not Cisco dotted)
  });

  test("rejects empty and non-sense values", () => {
    expect(() => new HwAddress("", 48)).toThrow();

    expect(() => new HwAddress(-1 as any, 48)).toThrow();

    expect(() => new HwAddress({} as any, 48)).toThrow();
  });
});
