import { describe, test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

function isMulticast(firstByte: number): boolean {
  return (firstByte & 0b00000001) === 0b00000001; // I/G bit
}
function isLocallyAdministered(firstByte: number): boolean {
  return (firstByte & 0b00000010) === 0b00000010; // U/L bit
}

describe("HwAddress semantics (I/G and U/L bits, broadcast)", () => {
  test("multicast address has I/G bit set", () => {
    const mac = "01:00:5e:00:00:fb";
    const a = new HwAddress(mac);
    const b0 = a.packed[0];
    expect(isMulticast(b0)).toBe(true);
    expect(isLocallyAdministered(b0)).toBe(false);
    expect(a.canonical).toBe("01:00:5e:00:00:fb");
  });

  test("locally administered address has U/L bit set", () => {
    const mac = "2a:00:00:00:00:01"; // 0x2a => U/L=1, I/G=0
    const a = new HwAddress(mac);
    const b0 = a.packed[0];
    expect(isMulticast(b0)).toBe(false);
    expect(isLocallyAdministered(b0)).toBe(true);
    expect(a.canonical).toBe("2a:00:00:00:00:01");
  });

  test("broadcast is canonicalized correctly (lowercase with colons)", () => {
    const mac = "ff:ff:ff:ff:ff:ff";
    const a = new HwAddress(mac);
    expect(a.canonical).toBe("ff:ff:ff:ff:ff:ff");
    expect(Array.from(a.packed).every((v) => v === 0xff)).toBe(true);
  });
});
