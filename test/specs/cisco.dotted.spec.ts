import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("Cisco dotted format", () => {
  test("constructor rejects aabb.ccdd.eeff ( not supported )", () => {
    // const dotted = "a1b2.c3d4.e5f6";
    // const addr = new HwAddress(dotted);
    // expect(addr.canonical).toBe("A1:B2:C3:D4:E5:F6");
    expect(()=> new HwAddress("a1b2.c3d4.e5f6")).toThrow()
  });

  test("constructor rejects mixed-case dotted as well", () => {
    expect(() => new HwAddress("AAbb.CcDD.eEfF")).toThrow();
  });

  test("constructor rejects dot-separated octets (aa.bb.cc.dd.ee.ff)", () => {
    expect(() => new HwAddress("aa.bb.cc.dd.ee.ff")).toThrow();
  });
});
