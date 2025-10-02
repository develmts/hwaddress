import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("EUI-64 support", () => {
  const canon64 = "00:11:22:33:44:55:66:77";
  const packed64 = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]);

  test("constructs from 64-bit canonical string (auto-detects length)", () => {
    const a = new HwAddress(canon64);
    expect(a.canonical).toBe("00:11:22:33:44:55:66:77");
    expect(a.packed.length).toBe(8);
    expect(a.packed).toEqual(packed64);
    expect(a.length).toBe(64);
  });

  test("static helpers handle 64-bit packed/canonical", () => {
    const p = HwAddress.canonicalToPacked(canon64, 64);
    expect(p.length).toBe(8);
    expect(p).toEqual(packed64);

    const c = HwAddress.packedToCanonical(p);
    expect(c).toBe("00:11:22:33:44:55:66:77");
  });
});
