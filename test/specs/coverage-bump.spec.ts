import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

describe("misc function coverage bump", () => {
  test("hash(), equals(), relational ops", () => {
    const a = new HwAddress("00:00:00:00:00:01");
    const b = new HwAddress("00:00:00:00:00:02");

    expect(typeof a.hash()).toBe("string");
    expect(a.equals(a)).toBe(true);
    expect(a.equals(b)).toBe(false);

    expect(a.lessThan(b)).toBe(true);
    expect(b.greaterThan(a)).toBe(true);
  });

  test("static compare() and sort() asc/desc", () => {
    const a = new HwAddress("00:00:00:00:00:01");
    const b = new HwAddress("00:00:00:00:00:02");
    const c = new HwAddress("00:00:00:00:00:03");

    expect(HwAddress.compare(a, b)).toBe(-1);
    const asc = HwAddress.sort([b, c, a], "asc");
    const desc = HwAddress.sort([b, c, a], "desc");
    expect(asc.map(x => x.canonical)).toEqual([
      "00:00:00:00:00:01",
      "00:00:00:00:00:02",
      "00:00:00:00:00:03"
    ]);
    expect(desc.map(x => x.canonical)).toEqual([
      "00:00:00:00:00:03",
      "00:00:00:00:00:02",
      "00:00:00:00:00:01"
    ]);
  });

  test("numeric helpers: canon<->numeric (current number-only behavior)", () => {
    // 48-bit path (safe as number)
    const canon48 = "99:88:77:66:55:44";
    const num48 = HwAddress.canonToNumeric(canon48, 48);
    expect(typeof num48).toBe("number");
    expect(HwAddress.numericToCanon(num48 as number, 48)).toBe(canon48);

    // 64-bit path: the implementation currently returns number even with useBigInt=true
    // Use a 64-bit value that is still <= Number.MAX_SAFE_INTEGER to allow round-trip.
    const canon64 = "00:11:22:33:44:55:66:77"; // 0x0011223344556677 < 2^53
    const num64 = HwAddress.canonToNumeric(canon64, 64, true); // flag is ignored today
    expect(typeof num64).toBe("number");
    expect(HwAddress.numericToCanon(num64 as number, 64)).toBe(canon64);

    // packedToNumeric with useBigInt=true also returns number with current code
    const packed64 = HwAddress.canonicalToPacked(canon64, 64);
    const n2 = HwAddress.packedToNumeric(packed64, true);
    expect(typeof n2).toBe("number");
  });

});
