import { describe, test, expect } from "vitest";
import * as api from "../../src/index";

describe("public API surface", () => {
  test("exports HwAddress", () => {
    expect(api.HwAddress).toBeDefined();
  });

  test("exports semantics helpers", () => {
    // comprova un parell com a sentinella
    expect(api.isMulticast).toBeTypeOf("function");
    expect(api.toEui64FromEui48).toBeTypeOf("function");
  });
});
