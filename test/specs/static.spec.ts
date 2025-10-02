import { test, expect } from "vitest";
import { HwAddress } from "../../src/hwaddress";

test("Static conversion and helpers", () => {
  const tester = {
    canon: "99:88:77:66:55:44",
    numeric: 0x998877665544, // 168811397797188
    packed: new Uint8Array([153, 136, 119, 102, 85, 68])
  };

  // from string
  expect(HwAddress.canonToNumeric(tester.canon, 48)).toBe(tester.numeric);
  expect(HwAddress.canonicalToPacked(tester.canon, 48)).toEqual(tester.packed);

  // from numeric
  // expect(HwAddress.numericToCanon(tester.numeric)).toBe(tester.canon);
  // expect(HwAddress.numericToPacked(tester.numeric)).toEqual(tester.packed);

  // from packed
  expect(HwAddress.packedToCanonical(tester.packed)).toBe(tester.canon);
  expect(HwAddress.packedToNumeric(tester.packed)).toBe(tester.numeric);
});
