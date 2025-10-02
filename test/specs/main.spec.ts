import { describe, test, expect } from "vitest";
import { HwAddress, EUI48, EUI64 } from "../../src/hwaddress"
// "../../dist/hwaddress";

// Fails if no address param
describe("HwAddress basic behavior", () => {
  test("fails on incorrect params", () => {
    expect(() => new HwAddress("")).toThrow();
    expect(() => new HwAddress(-1)).toThrow();
  });

  test("normalizes on creation", () => {
    const tester = {
      canon: "99:88:77:66:55:44",
      numeric: 0x998877665544, // 168811397797188
      packed: new Uint8Array([153, 136, 119, 102, 85, 68])
    };

    // from string
    let addr = new HwAddress(tester.canon);
    expect(addr.addr).toBe(tester.numeric);
    // Typed arrays compare by content with toEqual
    expect(addr.packed).toEqual(tester.packed);

    // from numeric
    addr = new HwAddress(tester.numeric, 48);
    expect(addr.canonical).toBe(tester.canon);
    expect(addr.packed).toEqual(tester.packed);

    // from packed
    addr = new HwAddress(tester.packed);
    expect(addr.canonical).toBe(tester.canon);
    expect(addr.addr).toBe(tester.numeric);
  });

  test("finds the correct Organization value", async () => {
    const noOrg = {
      canon: "99:88:77:66:55:44",
      name: "Undefined"
    };
    const correct = {
      canon: "30:5a:3a:7f:5e:cc",
      name: "ASUSTek COMPUTER INC."
    };

    let addr = new HwAddress(correct.canon);
    await expect(addr.ouiData()).resolves.toBe(correct.name);

    addr = new HwAddress(noOrg.canon);
    await expect(addr.ouiData()).resolves.toBe(noOrg.name);
  });
});
