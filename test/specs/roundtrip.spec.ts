import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

// This file exercises round-trips using available static helpers.
// We avoid relying on numeric→canonical helpers if they are not part of the public API.

// describe("Round-trip conversions (EUI-48)", () => {
//   const canon = "99:88:77:66:55:44";
//   const numeric = 0x998877665544; // within JS safe integer range for 48-bit
//   const packed = new Uint8Array([0x99, 0x88, 0x77, 0x66, 0x55, 0x44]);

//   test("canonical → packed → canonical", () => {
//     const p = HwAddress.canonicalToPacked(canon, 48);
//     expect(p).toEqual(packed);
//     const c = HwAddress.packedToCanonical(p);
//     expect(c).toBe("99:88:77:66:55:44".toUpperCase());
//   });

//   test("canonical → numeric → packed (numeric consistency)", () => {
//     const n = HwAddress.canonToNumeric(canon, 48);
//     expect(n).toBe(numeric);
//     const p = HwAddress.canonicalToPacked(canon, 48);
//     const n2 = HwAddress.packedToNumeric(p);
//     expect(n2).toBe(n);
//   });

//   test("instance round-trip properties agree with static helpers", () => {
//     const a = new HwAddress(canon);
//     expect(a.packed).toEqual(packed);
//     expect(a.canonical).toBe("99:88:77:66:55:44".toUpperCase());
//     expect(a.addr).toBe(numeric);
//     // Cross-check with statics
//     expect(HwAddress.packedToCanonical(a.packed)).toBe(a.canonical);
//     expect(HwAddress.packedToNumeric(a.packed)).toBe(a.addr);
//   });
// });

describe("Round-trip conversions (EUI-48)", () => {
  const canon = "99:88:77:66:55:44";
  const numeric = 0x998877665544;
  const packed = new Uint8Array([0x99, 0x88, 0x77, 0x66, 0x55, 0x44]);

  test("canonical → packed → canonical", () => {
    const p = HwAddress.canonicalToPacked(canon, 48);
    expect(p).toEqual(packed);
    const c = HwAddress.packedToCanonical(p);
    expect(c).toBe("99:88:77:66:55:44");
  });

  test("canonical → numeric → packed (numeric consistency)", () => {
    const n = HwAddress.canonToNumeric(canon, 48);
    expect(n).toBe(numeric);
    const p = HwAddress.canonicalToPacked(canon, 48);
    const n2 = HwAddress.packedToNumeric(p);
    expect(n2).toBe(n);
  });

  test("instance round-trip properties agree with static helpers", () => {
    const a = new HwAddress(canon);
    expect(a.packed).toEqual(packed);
    expect(a.canonical).toBe("99:88:77:66:55:44");
    expect(a.addr).toBe(numeric);
    expect(HwAddress.packedToCanonical(a.packed)).toBe(a.canonical);
    expect(HwAddress.packedToNumeric(a.packed)).toBe(a.addr);
  });
});
