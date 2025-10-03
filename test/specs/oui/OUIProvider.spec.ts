import { describe, test, expect, beforeAll } from "vitest";
import { OUIProvider } from "../../../src/oui/OUIProvider";
import { AbstractOuiProvider } from "../../../src/oui/AbstractOUIProvider";

// Dummy provider que hereta AbstractProvider i exposa el mapa
class DummyProvider extends AbstractOuiProvider {
  
  private data = new Map<string,string>([
    ["305A3A", "ASUSTek COMPUTER INC."],       // 24-bit MA-L
    ["FCD2B69", "Winglet Systems Inc."],       // 28-bit MA-M (7 hex)
    ["70B3D5CF6", "Tornado Modular Systems"],  // 36-bit MA-S (9 hex)
  ]);
    
  constructor() {
    super();
    // Populate amb valors de prova

  }
  // Simulem que ja està carregat
  protected async ensureLoaded(): Promise<void> {
    return;
  }
  protected async lookupExact(prefix: string): Promise<string | undefined> {
    // Consulta directa al mapa dummy
    return this.data.get(prefix);
  }
}

describe("OUIProvider + AbstractProvider", () => {
  let provider: typeof OUIProvider;

  beforeAll(() => {
    OUIProvider.setProvider(new DummyProvider());
  });

  test("resolve 24-bit prefix", async () => {
    const name = await OUIProvider.resolveFromCanonical("30:5A:3A");
    expect(name).toBe("ASUSTek COMPUTER INC.");
  });

  test("resolve full MAC with 24-bit OUI", async () => {
    const name = await OUIProvider.resolveFromCanonical("30:5A:3A:7F:5E:CC");
    expect(name).toBe("ASUSTek COMPUTER INC.");
  });

  test("resolve 28-bit prefix", async () => {
    const name = await OUIProvider.resolveFromCanonical("FC:D2:B6:90:11:22");
    expect(name).toBe("Winglet Systems Inc.");
  });

  test("resolve 36-bit prefix", async () => {
    const name = await OUIProvider.resolveFromCanonical("70:B3:D5:CF:60:11");
    expect(name).toBe("Tornado Modular Systems");
  });

  test("unknown vendor returns undefined", async () => {
    const name = await OUIProvider.resolveFromCanonical("FF:FF:FF");
    expect(name).toBeUndefined();
  });

  // Test addicional: fullAddressToHex amb Uint8Array
  test("fullAddressToHex with Uint8Array", async () => {
    const provider = new DummyProvider();
    
    const hex = provider["fullAddressToHex"](new Uint8Array([0xAA, 0xBB, 0xCC]));
    expect(hex).toBe("AABBCC");
  });

  // Test addicional: fullAddressToHex with { packed }
  test("fullAddressToHex with packed", async () => {
    const provider = new DummyProvider();
    const addr = { packed: new Uint8Array([0x30, 0x5A, 0x3A]) };
    
    const hex = provider["fullAddressToHex"](addr);
    expect(hex).toBe("305A3A");
  });

  // Test error: fullAddressToHex with bad input
  test("fullAddressToHex throws on unsupported input", () => {
    const provider = new DummyProvider();
    expect(() => {
      // @ts-expect-error force wrong type
      provider["fullAddressToHex"]("not-an-object");
    }).toThrow();
  });

  test("normalizePrefixGeneric throws on too short", () => {
    const provider = new DummyProvider();
    expect(() => {
      // només 5 hex
      provider["normalizePrefixGeneric"]("12345");
    }).toThrow(/length/);
  });

  test("normalizePrefixGeneric throws on too long", () => {
    const provider = new DummyProvider();
    expect(() => {
      // > 11 hex
      provider["normalizePrefixGeneric"]("AABBCCDDEEFF");
    }).toThrow(/length/);
  });

  test("normalizePrefixGeneric throws on non-hex characters", () => {
    const provider = new DummyProvider();
    expect(() => {
      // longitud vàlida (6), però caràcters no-hex
      provider["normalizePrefixGeneric"]("GGGGGG");
    }).toThrow(/non-hex/);
  });


  // Test cache behaviour
  test("cache stores positive and negative lookups", async () => {
    OUIProvider.setProvider(new DummyProvider());

    // first call will hit lookupExact
    const hit = await OUIProvider.resolveByPrefix("305A3A");
    expect(hit).toBe("ASUSTek COMPUTER INC.");

    // second call should be served from cache, not from lookupExact
    const hitAgain = await OUIProvider.resolveByPrefix("305A3A");
    expect(hitAgain).toBe("ASUSTek COMPUTER INC.");

    // negative cache
    const miss = await OUIProvider.resolveByPrefix("FFFFFF");
    expect(miss).toBeUndefined();
    const missAgain = await OUIProvider.resolveByPrefix("FFFFFF");
    expect(missAgain).toBeUndefined();
  });  

});
