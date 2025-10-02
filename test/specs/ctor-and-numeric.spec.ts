import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("HwAddress constructor and numeric helpers", () => {
  test("constructs from Uint8Array (48-bit)", () => {
    const packed = new Uint8Array([0x99,0x88,0x77,0x66,0x55,0x44]);
    const a = new HwAddress(packed);
    expect(a.length).toBe(48);
    expect(a.canonical).toBe("99:88:77:66:55:44");
    expect(a.packed).toEqual(packed);
  });

  test("constructs from Uint8Array (64-bit)", () => {
    const packed = new Uint8Array([0,1,2,3,4,5,6,7]);
    const a = new HwAddress(packed);
    expect(a.length).toBe(64);
    expect(a.canonical).toBe("00:01:02:03:04:05:06:07");
  });

  test("constructs from bigint (48-bit)", () => {
    const val = 0x998877665544n;
    const a = new HwAddress(val, 48);
    expect(a.canonical).toBe("99:88:77:66:55:44");
    // addr preserves the input type (bigint in this branch)
    expect(typeof a.addr).toBe("bigint");
    expect(a.addr).toBe(val);    
    // expect(a.addr).toBeTypeOf("number"); // packedToNumeric returns Number(res)
  });

  test("numericToPacked throws for number > MAX_SAFE_INTEGER", () => {
    const over = Number.MAX_SAFE_INTEGER + 1;
    expect(() => HwAddress.numericToPacked(over, 48)).toThrow();
  });

  test("numericToPacked accepts bigint for 64-bit", () => {
    const val = 0x0011223344556677n;
    const p = HwAddress.numericToPacked(val, 64);
    expect(p).toEqual(new Uint8Array([0,0x11,0x22,0x33,0x44,0x55,0x66,0x77]));
  });

  test("clone from HwAddress", () => {
    const a = new HwAddress("99:88:77:66:55:44");
    const b = new HwAddress(a);
    expect(b.canonical).toBe(a.canonical);
    expect(b.packed).toEqual(a.packed);
    expect(b.addr).toBe(a.addr);
    expect(b).not.toBe(a); // deep copy
  });

  test("throws on invalid numeric input lengthOverride", () => {
    expect(() => new HwAddress(123)).toThrow(); // lengthOverride required
    expect(() => new HwAddress(123, 20)).toThrow(); // not multiple of 8
  });
});
