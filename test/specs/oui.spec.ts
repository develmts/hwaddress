import { describe, test, expect, beforeAll, afterAll, vi } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

let HwAddress: typeof import("../../src/hwaddress").HwAddress;

// Resolve __dirname for ESM tests
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

beforeAll(async () => {
  // Point provider to local JSON DB (no network, no mocks)
  //process.env.HWADDR_OUI_PATH = path.resolve(__dirname, "../../data/oui-db.json");

  // Ensure a clean module graph so the provider picks the env var on import
  vi.resetModules();

  // Dynamically import after env is set
  const mod = (await import("../../src/hwaddress")) as typeof import("../../src/hwaddress");
  HwAddress = mod.HwAddress;
});

afterAll(() => {
  // Clean up any test-side environment changes
  //delete process.env.HWADDR_OUI_PATH;
});

describe("OUI lookup (real provider, local DB)", () => {
  test("returns organization name when present", async () => {
    // Known ASUS prefix present in our oui-db.json: 305A3A → "ASUSTek COMPUTER INC."
    const a = new HwAddress("30:5a:3a:7f:5e:cc");
    console.log("return", await a.ouiData())
    // await expect(a.ouiData()).resolves.toBe("ASUSTek COMPUTER INC.");
    await expect(a.ouiData()).resolves.toMatch(/asus/i);
  });

  test("returns 'Undefined' when prefix not found", async () => {
    const a = new HwAddress("99:88:77:66:55:44");
    await expect(a.ouiData()).resolves.toBe("Undefined");
  });
});
