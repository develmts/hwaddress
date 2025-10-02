// tests/semantics.spec.ts
import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";
import {
  firstByte,
  isMulticast,
  isUnicast,
  isLocallyAdministered,
  isUniversallyAdministered,
  isBroadcast,
  flipUlBit,
  setUlBit,
  clearUlBit,
  clearIgBit,
  toEui64FromEui48,
  toEui48FromEui64IfConvertible,
} from "../../src/semantics";

describe("semantics helpers", () => {
  describe("firstByte()", () => {
    test("returns first byte from HwAddress", () => {
      const a = new HwAddress("aa:bb:cc:dd:ee:ff");
      expect(firstByte(a)).toBe(0xaa);
    });
    test("returns first byte from Uint8Array", () => {
      const u8 = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]);
      expect(firstByte(u8)).toBe(0xaa);
    });
  });

  describe("I/G and U/L flags", () => {
    test("isMulticast / isUnicast from HwAddress", () => {
      // 01:... has I/G bit set
      const m = new HwAddress("01:00:5e:00:00:fb");
      expect(isMulticast(m)).toBe(true);
      expect(isUnicast(m)).toBe(false);

      const u = new HwAddress("02:00:00:00:00:01"); // I/G cleared
      expect(isMulticast(u)).toBe(false);
      expect(isUnicast(u)).toBe(true);
    });

    test("isLocallyAdministered / isUniversallyAdministered from HwAddress", () => {
      const la = new HwAddress("02:00:00:00:00:00"); // U/L bit set
      expect(isLocallyAdministered(la)).toBe(true);
      expect(isUniversallyAdministered(la)).toBe(false);

      const ua = new HwAddress("00:00:00:00:00:00"); // U/L cleared
      expect(isLocallyAdministered(ua)).toBe(false);
      expect(isUniversallyAdministered(ua)).toBe(true);
    });

    test("works with Uint8Array input", () => {
      const m = new Uint8Array([0x01, 0, 0, 0, 0, 0]);
      expect(isMulticast(m)).toBe(true);
      expect(isUnicast(m)).toBe(false);

      const la = new Uint8Array([0x02, 0, 0, 0, 0, 0]);
      expect(isLocallyAdministered(la)).toBe(true);
      expect(isUniversallyAdministered(la)).toBe(false);
    });
  });

  describe("isBroadcast()", () => {
    test("true only for ff:ff:ff:ff:ff:ff", () => {
      expect(isBroadcast(new HwAddress("ff:ff:ff:ff:ff:ff"))).toBe(true);
      expect(isBroadcast(new HwAddress("ff:ff:ff:ff:ff:fe"))).toBe(false);
    });
    test("returns false for non-48-bit inputs", () => {
      expect(isBroadcast(new HwAddress("00:11:22:33:44:55:66:77"))).toBe(false); // 64-bit
      expect(isBroadcast(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff]))).toBe(false); // 40-bit
    });
    test("works with Uint8Array", () => {
      const bcast = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      expect(isBroadcast(bcast)).toBe(true);
    });
  });

  describe("bit helpers", () => {
    test("flip/set/clear U/L and clear I/G return modified first byte", () => {
      const la = new HwAddress("02:00:00:00:00:00"); // U/L=1
      const ua = new HwAddress("00:00:00:00:00:00"); // U/L=0
      const ig = new HwAddress("01:00:00:00:00:00"); // I/G=1

      // flip U/L
      expect((flipUlBit(la) & 0b10) === 0).toBe(true);
      expect((flipUlBit(ua) & 0b10) === 0b10).toBe(true);

      // set / clear U/L
      expect((setUlBit(ua) & 0b10) === 0b10).toBe(true);
      expect((clearUlBit(la) & 0b10) === 0).toBe(true);

      // clear I/G
      expect((clearIgBit(ig) & 0b1) === 0).toBe(true);
    });

    test("bit helpers accept Uint8Array", () => {
      const u8 = new Uint8Array([0x03, 0, 0, 0, 0, 0]); // I/G=1, U/L=1
      expect((clearIgBit(u8) & 0b1) === 0).toBe(true);
      expect((clearUlBit(u8) & 0b10) === 0).toBe(true);
    });
  });

  describe("EUI-48 <-> EUI-64 conversions", () => {
    test("toEui64FromEui48 inserts ff:fe and flips U/L", () => {
      const e48 = new HwAddress("aa:bb:cc:dd:ee:ff");
      const e64 = toEui64FromEui48(e48);
      // first byte aa ^ 0x02 = a8
      expect(Array.from(e64)).toEqual([0xa8, 0xbb, 0xcc, 0xff, 0xfe, 0xdd, 0xee, 0xff]);
    });

    test("toEui48FromEui64IfConvertible reverses ff:fe form or returns null otherwise", () => {
      const e48 = new HwAddress("aa:bb:cc:dd:ee:ff");
      const e64 = toEui64FromEui48(e48);
      const back = toEui48FromEui64IfConvertible(e64);
      expect(back && Array.from(back)).toEqual([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]);

      const notConvertible = new HwAddress("00:11:22:33:44:55:66:77");
      expect(toEui48FromEui64IfConvertible(notConvertible)).toBeNull();
    });

    test("toEui64FromEui48 throws if input is not 48-bit", () => {
      const bad = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee]); // 40-bit
      expect(() => toEui64FromEui48(bad)).toThrow();
    });
  });
});
