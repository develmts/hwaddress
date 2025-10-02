![CI](https://github.com/develmts/hwaddress/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/develmts/hwaddress/main/badges/coverage.json)





# hwaddress

A tiny, dependency-free TypeScript/Node.js library to parse, normalize and work with hardware addresses (EUI/MAC) in **40/48/56/64 bits**.  
It focuses on correctness, small surface area, and predictable behavior for backend usage (Node.js).

---

## Features

- Parse from canonical strings (`aa:bb:...`) or `Uint8Array` (auto-detects bit length: 40/48/56/64).
- Convert between **canonical**, **packed bytes**, and **numeric** representations.
- Format addresses in multiple layouts (canonical, dashed, plain, custom patterns).
- Basic OUI lookup via a simple text source (Node-only).
- Strong tests with Vitest, coverage reports, and simple micro-benchmarks (no extra deps).

> Note: This library is **backend-oriented**. It uses Node APIs for OUI loading and does not target the browser.

---

## Install

```bash
npm i hwaddress
# or, for local development of this repo:
npm i
```

---

## Quick start

```ts
import { HwAddress } from "hwaddress";

// 48-bit from canonical string
const a = new HwAddress("99:88:77:66:55:44");
a.canonical; // "99:88:77:66:55:44"
a.packed;    // Uint8Array(6) [0x99,0x88,0x77,0x66,0x55,0x44]
a.addr;      // number (safe for 48-bit)

// 64-bit (EUI-64) from canonical string
const b = new HwAddress("00:11:22:33:44:55:66:77");
b.packed.length; // 8
b.length;        // 64

// 64-bit with exact numeric value: pass a BigInt
const c = new HwAddress(0x0011223344556677n, 64);
typeof c.addr;   // "bigint"

// Convert between forms
HwAddress.canonicalToPacked("99:88:77:66:55:44", 48); // → Uint8Array(6)
HwAddress.packedToCanonical(new Uint8Array([0x99,0x88,0x77,0x66,0x55,0x44])); // → "99:88:77:66:55:44"
HwAddress.canonToNumeric("99:88:77:66:55:44", 48); // → 0x998877665544
```

---

## Supported input formats

The constructor currently accepts:

- `aa:bb:cc:dd:ee[:ff[:gg[:hh]]]` (colon-separated; **auto-detects** 5/6/7/8 octets)
- `aa-bb-cc-dd-ee[-ff[-gg[-hh]]]` (dash-separated)
- `Uint8Array` of 5/6/7/8 bytes
- `number | bigint` with an explicit `length` (multiple of 8)
- `HwAddress` (clone)

> Cisco dotted (`aabb.ccdd.eeff`) and plain hex (`aabbccddeeff`) as **input** are not supported at the moment. You can add a small helper to normalize them before constructing, or extend the parser.

---

## Numeric precision and 64-bit addresses

`HwAddress` supports 40/48/56/64-bit addresses.

- Constructed from **string/Uint8Array**, `.addr` is a **Number**.  
  Safe for 40/48/56; for **64-bit** it may exceed `Number.MAX_SAFE_INTEGER` (2^53−1).
- Constructed from **BigInt**, `.addr` remains a **BigInt** (exact).

**Recommendations**
- Prefer `.packed` or `.canonical` if you don’t need a scalar.
- For exact 64-bit numeric, construct with **BigInt**.

**Out of scope**
- Addresses **> 64 bits** (e.g., WWN/FC/SAS 128-bit) are not supported.

---

## Thread / OpenThread note (EUI-64)

Thread devices expose an IEEE **EUI-64**. Many tools/CLIs show it as **plain hex without separators** (e.g., `f4ce3638d6b665ce`).  
You can convert it to canonical before constructing:

```ts
function hex64ToCanonical(hex16: string) {
  if (!/^[0-9a-f]{16}$/i.test(hex16)) throw new Error("invalid 64-bit hex");
  return hex16.match(/.{2}/g)!.join(":");
}

const canon = hex64ToCanonical("f4ce3638d6b665ce");
const addr = new HwAddress(canon); // length=64
```

Some 802.15.4 stacks display the extended address in reversed (little-endian) byte order; if your tool shows the OUI at the end, reverse the byte order before using it.

---

## API (short)

```ts
class HwAddress {
  constructor(input: string | number | bigint | Uint8Array | HwAddress, lengthOverride?: number);

  get canonical(): string;         // lower-case, colon-separated
  get packed(): Uint8Array;        // defensive copy
  get addr(): number | bigint;     // number for <=56-bit; may be bigint if constructed with BigInt
  get length(): number;            // in bits

  format(patternOrAlias: string): string; // e.g., "canonical", "dashed", "plain", or custom 'x' patterns

  oui(): HwAddress;                // returns the 24-bit OUI as a HwAddress
  ouiData(oui?: string): Promise<string>; // resolves vendor name or "Undefined"

  equals(other: HwAddress): boolean;
  compareTo(other: HwAddress): number;    // -1/0/1 (throws if length mismatch)
  hash(): string;                         // "canonical@length"

  // Static converters
  static canonicalToPacked(canonical: string, length: number): Uint8Array;
  static packedToCanonical(packed: Uint8Array): string;
  static packedToNumeric(packed: Uint8Array, useBigInt?: boolean): number | bigint;
  static numericToPacked(numeric: number | bigint, length: number): Uint8Array;
  static canonToNumeric(canonical: string, length: number, useBigInt?: boolean): number | bigint;
  static numericToCanon(numeric: number | bigint, length: number): string;
  static compare(a: HwAddress, b: HwAddress): number;
  static sort(addresses: HwAddress[], direction?: "asc" | "desc"): HwAddress[];
}
```

---

## Development

### Tests & coverage
```bash
npm run test:run
npm run test:cov
# HTML report at coverage/index.html
```

### Benchmarks (no deps)
```bash
npm run bench:simple
# results stored to bench/results/*.json and *.csv
```

### Build & module outputs
Dual build (ESM + CJS) with TypeScript only:
```bash
npm run build
# ESM: dist/esm/index.js (package is type:module)
# CJS: dist/cjs/index.js (with dist/cjs/package.json { type: "commonjs" })
# Types: dist/esm/index.d.ts
```

### Versioning
This repo uses [Changesets](https://github.com/changesets/changesets) for SemVer and changelog generation.  
You can run locally:
```bash
npm run changeset           # create a new changeset (patch/minor/major)
npm run version:packages    # apply versions and generate CHANGELOG
```

---

## License

[MIT](./LICENSE.md)
