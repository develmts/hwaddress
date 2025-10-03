// tests/oui/FlatFileProvider.test.ts
import { describe, test, expect, beforeAll } from "vitest";
import { FlatFileProvider } from "../../../src/oui/FlatFileProvider";
import { resolve } from "path";

describe("FlatFileProvider (TXT)", () => {
  let provider: FlatFileProvider;

  beforeAll(() => {
    const txtFile = resolve(process.cwd(), "data/oui-db.txt"); // ajusta si cal
    provider = new FlatFileProvider(txtFile);
  });

  test("lookupExact hit (ASUSTek 24-bit)", async () => {
    const hit = await (provider as any)["lookupExact"]("305A3A");
    expect(hit).toMatch(/ASUS|ASUSTek/i);
  });

  test("lookupExact miss", async () => {
    const miss = await (provider as any)["lookupExact"]("FFFFFF");
    expect(miss).toBeUndefined();
  });
});
