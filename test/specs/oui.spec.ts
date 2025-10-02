import { describe, test, expect, afterEach, vi } from "vitest";
import { PassThrough } from "stream";

// Prepare a tiny fake ieee-oui.txt content
const FAKE_OUI = [
  "# comment",
  "305A3A\tASUSTek COMPUTER INC.",
  "998877\tUndefinedVendor"
].join("\n");

// ESM-safe mock of 'fs' BEFORE importing the SUT
vi.mock("fs", () => {
  const { PassThrough } = require("stream") as typeof import("stream");
  return {
    // existsSync must return true so the code path uses createReadStream
    existsSync: () => true,
    // Return a readable that emits FAKE_OUI and ends
    createReadStream: () => {
      const src = new PassThrough();
      src.end(FAKE_OUI);
      return src as unknown as import("fs").ReadStream;
    }
  };
});

// Now import after the mock so src/hwaddress picks up the mocked fs
import { HwAddress } from "../../src/hwaddress";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("OUI lookup", () => {
  test("ouiData returns organization name when present", async () => {
    const a = new HwAddress("30:5a:3a:7f:5e:cc");
    await expect(a.ouiData()).resolves.toBe("ASUSTek COMPUTER INC.");
  });

  test("ouiData returns 'Undefined' when not found", async () => {
    const a = new HwAddress("99:88:77:66:55:44");
    await expect(a.ouiData()).resolves.toBe("Undefined");
  });
});
