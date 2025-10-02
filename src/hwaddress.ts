//import {getOUI} from "./ieee.js"

import fs from "fs"
import readline from "readline"
import got from 'got' 

// src/hwaddress.ts
import {
  isMulticast, isUnicast, isLocallyAdministered, isUniversallyAdministered,
  isBroadcast, toEui64FromEui48, toEui48FromEui64IfConvertible,
  firstByte, flipUlBit, setUlBit, clearUlBit, clearIgBit
} from "./semantics.js";

// (opcional) els re-exportes a través del paquet:
export {
  isMulticast, isUnicast, isLocallyAdministered, isUniversallyAdministered,
  isBroadcast, toEui64FromEui48, toEui48FromEui64IfConvertible,
  firstByte, flipUlBit, setUlBit, clearUlBit, clearIgBit
};



const IEEE_OUI = "https://gist.githubusercontent.com/gildardoperez/eb73712613587358665916d8fa71f9d7/raw/416d767a9ef6379b55dc95aa406856287d395855/ieee-oui.txt"
const defURL = IEEE_OUI
const defPath = "./ieee-oui.txt"
const defList = [defURL,defPath]

function OUIgetStream(loc: string) : any{
  let opts: string[] = defList
  let stream: any = {}
  if (loc && loc != "")
    opts = [ loc, ...defList]

  for(const src of opts){
    try{
      if (src.indexOf(":") != -1){ 
        stream = got.stream(src)
      }else{
        if (!fs.existsSync(src))
          throw new Error(src + " doesn't exists")
        stream = fs.createReadStream(src)
      }
    }catch(err){
      continue
    }
  }
  return stream
}


async function OUIparse(loc:string = ""): Promise<any[]>{
  let opts: string[] = ["",""]
  let stream: any = OUIgetStream(loc)  
  return new Promise((resolve, reject) => {
    const aRes: any[] = []
    let rl: any = {}
    
    // console.log("final stream ", stream.path)
    try{
      rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
      });
    }catch(err:any){
      console.log("Unable to create stream", err.msg.split(/\n/)[0])
      reject(err)
    }
  
    rl
      .on('line', (line : string) => {
      // strip out comments or parse the line and push it to lineBuffer
      if (line.charAt(0) != "#"){
        let parts = line.split("\t")
        let addr = parts[0].slice(0,2)+":"+parts[0].slice(2,4)+":"+parts[0].slice(4,6)
        aRes.push([addr, parts[1]])
      }        
    })
      .on('close', () => resolve(aRes));
  })
}

let OUITab: any[] = []

async function getOUI(oui: string): Promise<string>{
  if (OUITab.length == 0){
    OUITab = await OUIparse()
  }
  try{
    return OUITab.find(e => { return e[0] == oui })[1] 
  } catch(err){
    return "Undefined"
  }
}


export class HwAddress {

  #canon: string;
  #packed: Uint8Array;
  #addr: number | bigint;
  #length: number;

  static readonly ALLOWED_SEPARATORS = new Set([':', '-', '.', ' ']);
  static #validFormatCache: Map<number, string[]> = new Map();
  static #aliasFormatCache: Map<number, Map<string, string>> = new Map();

  /**
   * Constructs a HardwareAddress from various formats:
   * - string: canonical ("aa:bb:cc")
   * - number | bigint: numeric representation
   * - Uint8Array: packed bytes
   * - HardwareAddress: clone of existing instance
   * @param input - Input address of various types
   * @param lengthOverride - Optional bit length when needed
   */
  constructor(
    input: string | number | bigint | Uint8Array | HwAddress,
    lengthOverride?: number
  ) {
    if (input instanceof HwAddress) {
      this.#canon = input.canonical;
      this.#packed = new Uint8Array(input.packed); // deep copy
      this.#addr = input.addr;
      this.#length = input.length;
    } else if (typeof input === 'string') {
      if (!input.match(/^([0-9a-f]{2}[:-])+[0-9a-f]{2}$/i)) {
        throw new Error('Invalid canonical format');
      }
      const length = input.split(/[:-]/).length * 8;
      this.#length = length;
      this.#canon = input.replace(/[:-]/g, ":").toLowerCase();
      this.#packed = HwAddress.canonicalToPacked(this.#canon, length);
      this.#addr = HwAddress.packedToNumeric(this.#packed, this.#packed.length > 6);
    } else if (input instanceof Uint8Array) {
      this.#packed = new Uint8Array(input);
      this.#length = input.length * 8;
      this.#canon = HwAddress.packedToCanonical(this.#packed);
      this.#addr = HwAddress.packedToNumeric(this.#packed, input.length > 6);
    } else if (typeof input === 'number' || typeof input === 'bigint') {
      if (!lengthOverride || lengthOverride % 8 !== 0) {
        throw new Error('Bit length (multiple of 8) is required for numeric input');
      }
      this.#length = lengthOverride;
      this.#addr = input;
      this.#packed = HwAddress.numericToPacked(input, lengthOverride);
      this.#canon = HwAddress.packedToCanonical(this.#packed);
    } else {
      throw new Error('Unsupported input type for HardwareAddress');
    }
  }

  // --- 🔍 Public Getters ---
  get canonical(): string {
    return this.#canon;
  }

  get packed(): Uint8Array {
    return new Uint8Array(this.#packed); // Return copy to preserve immutability
  }

  get addr(): number | bigint {
    return this.#addr;
  }

  get length(): number {
    return this.#length;
  }  

  // formatting related

  /**
   * Returns an array of valid formats for the address length.
   * Example for MAC-48: xx:xx:xx:xx:xx:xx, xxxx.xxxx.xxxx, etc.
   */
  get validFormats(): string[] {
    if (HwAddress.#validFormatCache.has(this.length)) {
      return HwAddress.#validFormatCache.get(this.length)!;
    }

    const nibbles = this.length / 4;

    const makeChunks = (chunkSize: number, sep: string): string => {
      return Array(nibbles / chunkSize)
        .fill(0)
        .map(() => 'x'.repeat(chunkSize))
        .join(sep);
    };

    const formats: string[] = [];

    for (const sep of HwAddress.ALLOWED_SEPARATORS) {
      [2, 4, 6].forEach(size => {
        if (nibbles % size === 0) {
          formats.push(makeChunks(size, sep));
        }
      });
    }

    formats.push('x'.repeat(nibbles)); // raw hex

    HwAddress.#validFormatCache.set(this.length, formats);
    return formats;
  }

  private get aliasFormats(): Map<string, string> {
    if (HwAddress.#aliasFormatCache.has(this.length)) {
      return HwAddress.#aliasFormatCache.get(this.length)!;
    }
  
    const formats = this.validFormats;
    const nibbles = this.length / 4;
  
    const aliasMap = new Map<string, string>();
  
    for (const f of formats) {
      if (f.includes(':') && f.split(':').length === 6) aliasMap.set('canonical', f);
      if (f.includes('-') && f.split('-').length === 6) aliasMap.set('dashed', f);
      if (f.includes('.') && f.split('.').length === 3) aliasMap.set('dotted', f);
      if (!/[.:\- ]/.test(f)) aliasMap.set('plain', f);
    }
  
    // Add all formats by their own pattern as well
    for (const f of formats) {
      aliasMap.set(f, f);
    }
  
    HwAddress.#aliasFormatCache.set(this.length, aliasMap);
    return aliasMap;
  }

  /**
   * Returns the address in a custom string format.
   * @param pattern - A format string using 'x' for hex digits and allowed separators.
   */
  format(formatOrAlias: string): string {
    const format = this.aliasFormats.get(formatOrAlias) ?? formatOrAlias;

    const hex = this.#packed.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
    const clean = format.replace(/[^x]/gi, '');

    if (clean.length !== hex.length) {
      throw new Error(`Format mismatch: pattern has ${clean.length} hex digits but address has ${hex.length}`);
    }

    let result = '';
    let hexIndex = 0;

    for (const char of format) {
      if (char.toLowerCase() === 'x') {
        result += hex[hexIndex++];
      } else if (HwAddress.ALLOWED_SEPARATORS.has(char)) {
        result += char;
      } else {
        throw new Error(`Invalid character '${char}' in format string`);
      }
    }

    return result;
  }

  /**
   * 
   * @returns a new 24-bit hardware address representing 
   * the organizational unit of this addresss
   */

  oui(): HwAddress{
    // return new HwAddress(this.addr, 24)

    // const oui = HwAddress.packedToCanonical(
    //   HwAddress.canonicalToPacked(this.#canon, 24)
    // )

    const oui = this.#canon.slice(0,8)
    return new HwAddress(oui,24)
  }
  /**
   * 
   * @returns a string with the organization name if any or 
   * "Undefined" if none it's associated with this oui
   */

  async ouiData(oui:string = ""): Promise<string> {
    if (!oui || oui == ""){
      oui = this.oui().#canon
    }
    return await getOUI(oui.toUpperCase()) 
  }

  /**
  * Checks if another HardwareAddress is equal to this one.
  * @param other - Another HardwareAddress instance.
  * @returns True if equal in length and value.
  */
  equals(other: HwAddress): boolean {
    return this.length === other.length && this.addr === other.addr;
  }

  /**
   * Compares if this address is less than another (only if same length).
   * @param other - Another HardwareAddress instance.
   * @returns True if this < other.
   */
  lessThan(other: HwAddress): boolean {
    this.#assertComparable(other);
    return this.addr < other.addr;
  }

  /**
   * Compares if this address is greater than another (only if same length).
   * @param other - Another HardwareAddress instance.
   * @returns True if this > other.
   */
  greaterThan(other: HwAddress): boolean {
    this.#assertComparable(other);
    return this.addr > other.addr;
  }

  /**
   * Compares if this address is less than or equal to another.
   * @param other - Another HardwareAddress instance.
   * @returns True if this <= other.
   */
  lessThanOrEqual(other: HwAddress): boolean {
    this.#assertComparable(other);
    return this.addr <= other.addr;
  }

  /**
   * Compares if this address is greater than or equal to another.
   * @param other - Another HardwareAddress instance.
   * @returns True if this >= other.
   */
  greaterThanOrEqual(other: HwAddress): boolean {
    this.#assertComparable(other);
    return this.addr >= other.addr;
  }

  /**
   * Internal check to make sure two addresses can be compared.
   */
  #assertComparable(other: HwAddress): void {
    if (this.length !== other.length) {
      throw new Error(`Cannot compare addresses of different lengths: ${this.length} vs ${other.length}`);
    }
  }

  /**
   * Returns a hashable string representation for Map/Set use.
   * Format: canonical@length
   */
  hash(): string {
    return `${this.#canon}@${this.length}`;
  }
  
  /**
   * Compares current address to a nother one  numerically.
   * @returns -1 if a < b, 1 if a > b, 0 if equal
   */
  compareTo(other: HwAddress) : number {
    if (this.length !== other.length) {
      throw new Error(`Cannot compare addresses of different lengths: ${this.length} vs ${other.length}`);
    }

    if (this.addr < other.addr) return -1;
    if (this.addr > other.addr) return 1;
    return 0;
  }

  toJSON(): { canonical: string; length: number } {
    return {
      canonical: this.#canon,
      length: this.length
    };
  }

  static fromJSON(data: { canonical: string; length: number }): HwAddress {
    if (
      typeof data !== 'object' ||
      typeof data.canonical !== 'string' ||
      typeof data.length !== 'number'
    ) {
      throw new Error('Invalid HardwareAddress JSON');
    }
  
    return new HwAddress(data.canonical, data.length);
  }

  // --- Static Utilities ---

  static canonicalToPacked(canonical: string, length: number): Uint8Array {
    const byteLength = length / 8;
    const parts = canonical.split(':').map(part => parseInt(part, 16));
    if (
      parts.length !== byteLength ||
      parts.some(p => isNaN(p) || p < 0 || p > 255)
    ) {
      throw new Error('Invalid canonical address or incorrect length');
    }
    return new Uint8Array(parts);
  }

  static packedToCanonical(packed: Uint8Array): string {
    // console.log("convert from:", packed)
    return Array.from(packed)
      .map((b,i) => {
        // console.log(`ST, |${i}|${b}|`)
        return b.toString(16).padStart(2, '0')
      })
      .join(':');
  }

  static packedToNumeric(packed: Uint8Array, useBigInt = false): number | bigint {
    // if (useBigInt || packed.length > 6) {
    //   return packed.reduce<bigint>((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
    // } else {
    //   return packed.reduce<number>((acc, byte) => (acc << 8) | byte, 0);
    // }
    let res = BigInt(0)
    res = packed.reduce<bigint>((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
    return Number(res)
  }

  static numericToPacked(numeric: number | bigint, length: number): Uint8Array {
    const byteLength = length / 8;
    const packed = new Uint8Array(byteLength);
    if (typeof numeric === 'bigint') {
      for (let i = byteLength - 1; i >= 0; i--) {
        packed[i] = Number(numeric & 0xffn);
        numeric >>= 8n;
      }
    } else if (typeof numeric === 'number') {
      if (numeric < 0 || numeric > Number.MAX_SAFE_INTEGER) {
        throw new Error('Numeric address must be a safe JavaScript Number or use BigInt');
      }
      for (let i = byteLength - 1; i >= 0; i--) {
        packed[i] = numeric & 0xff;
        //console.log("N2P", numeric , packed)
        numeric = Math.floor(numeric / 256);
      }
    } else {
      throw new Error('Invalid numeric value: must be Number or BigInt');
    }

    return packed;
  }

  static canonToNumeric(canonical: string, length: number, useBigInt = false): number | bigint {
    return HwAddress.packedToNumeric(HwAddress.canonicalToPacked(canonical, length), useBigInt);
  }

  static numericToCanon(numeric: number | bigint, length: number): string {
    return HwAddress.packedToCanonical(HwAddress.numericToPacked(numeric, length));
  }
  
  /**
   * Compares two HardwareAddress instances numerically.
   * @returns -1 if a < b, 1 if a > b, 0 if equal
   */
  static compare(a: HwAddress, b: HwAddress): number {
    if (a.length !== b.length) {
      throw new Error(`Cannot compare addresses of different lengths: ${a.length} vs ${b.length}`);
    }

    if (a.addr < b.addr) return -1;
    if (a.addr > b.addr) return 1;
    return 0;
  }  

  /**
   * Sorts a list of HardwareAddress instances.
   * @param addresses - Array of HardwareAddress instances.
   * @param direction - 'asc' (default) or 'desc'
   */
  static sort(addresses: HwAddress[], direction: 'asc' | 'desc' = 'asc'): HwAddress[] {
    const sorted = [...addresses].sort(HwAddress.compare);
    return direction === 'desc' ? sorted.reverse() : sorted;
  }
}



export class EUI48 extends HwAddress{
  constructor(addr: string | number | bigint | Uint8Array | HwAddress) {
    super(addr,48)
  }
}

export class EUI64 extends HwAddress{
  constructor(addr: string | number | bigint | Uint8Array | HwAddress) {
    super(addr, 64)
  }
}

