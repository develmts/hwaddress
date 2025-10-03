// src/oui/providers/FlatFileProvider.ts
// Local-only OUI source (dependency-free). Supports both JSON and TXT formats.
// - JSON: { "286FB9": "Vendor", ... }
// - TXT:  PREFIX<TAB>Vendor
//
// Default path can be overridden via HWADDR_OUI_PATH env variable.

import fs from "node:fs";
import readline from "node:readline";
import { AbstractOuiProvider, PrefixHex } from "./AbstractOUIProvider.js";

const DEFAULT_OUI_PATH = process.env.HWADDR_OUI_PATH || "./data/oui-db.json";

export class FlatFileProvider extends AbstractOuiProvider {
  private path: string;
  private map: Map<PrefixHex, string> | null = null;

  constructor(path: string = DEFAULT_OUI_PATH) {
    super();
    this.path = path;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.map) return;

    if (!fs.existsSync(this.path)) {
      this.map = new Map(); // gracefully empty
      return;
    }

    const raw = fs.readFileSync(this.path, "utf8").trim();

    if (raw.startsWith("{")) {
      // JSON format
      const obj = JSON.parse(raw) as Record<string, string>;
      // this.map = new Map(Object.entries(obj));
      const map = new Map<PrefixHex, string>();
      for (const [k, v] of Object.entries(obj)) {
        const clean = k.toUpperCase().replace(/[^0-9A-F]/g, "");
        map.set(clean, v);
      }
      this.map = map;
      return;
    }

    // TXT format: prefix \t vendor
    const map = new Map<PrefixHex, string>();
    const stream = fs.createReadStream(this.path, { encoding: "utf8" });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of rl) {
      if (!line || line[0] === "#") continue;
      const parts = line.split("\t");
      if (parts.length < 2) continue;
      const rawHex = parts[0].trim().toUpperCase().replace(/[^0-9A-F]/g, "");
      if (!/^[0-9A-F]{6}$/.test(rawHex)) continue;
      if (![6, 7, 9].includes(rawHex.length)) continue;

      const name = parts[1].trim();
      map.set(rawHex, name)
      // const rawPrefix = parts[0].trim().slice(0, 6).toUpperCase();
      //  if (!/^[0-9A-F]{6}$/.test(rawPrefix)) continue;
      // const prefix = `${rawPrefix.slice(0, 2)}:${rawPrefix.slice(2, 4)}:${rawPrefix.slice(4, 6)}` as PrefixHex;
      // const name = parts[1].trim();
      // map.set(prefix, name);
    }

    this.map = map;
  }

  // protected async lookupExact(prefix: PrefixHex): Promise<string | undefined> {
  //   await this.ensureLoaded();
  //   if (prefix.length === "AA:BB:CC".length) {
  //     return this.map!.get(prefix) ;
  //   }
  //   return undefined;
  // }

  protected async lookupExact(prefix: PrefixHex): Promise<string | undefined> {
    await this.ensureLoaded();
    // console.log("Looking for:",prefix)
    // Normalize input "AA:BB:CC" → "AABBCC"
    const key = prefix.replace(/[^0-9A-F]/gi, "").toUpperCase();

    return this.map!.get(key);
  }

}
