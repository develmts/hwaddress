//import {getOUI} from "./ieee.js"
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HwAddress_instances, _a, _HwAddress_canon, _HwAddress_packed, _HwAddress_addr, _HwAddress_length, _HwAddress_validFormatCache, _HwAddress_aliasFormatCache, _HwAddress_assertComparable;
import { OUIProvider } from "./oui/OUIProvider.js";
// src/hwaddress.ts
import { isMulticast, isUnicast, isLocallyAdministered, isUniversallyAdministered, isBroadcast, toEui64FromEui48, toEui48FromEui64IfConvertible, firstByte, flipUlBit, setUlBit, clearUlBit, clearIgBit } from "./semantics.js";
// (opcional) els re-exportes a través del paquet:
export { isMulticast, isUnicast, isLocallyAdministered, isUniversallyAdministered, isBroadcast, toEui64FromEui48, toEui48FromEui64IfConvertible, firstByte, flipUlBit, setUlBit, clearUlBit, clearIgBit };
const IEEE_OUI = "https://gist.githubusercontent.com/gildardoperez/eb73712613587358665916d8fa71f9d7/raw/416d767a9ef6379b55dc95aa406856287d395855/ieee-oui.txt";
const defURL = IEEE_OUI;
const defPath = "./ieee-oui.txt";
const defList = [defURL, defPath];
//  
//   let opts: string[] = defList
//   let stream: any = {}
//   if (loc && loc != "")
//     opts = [ loc, ...defList]
//   for(const src of opts){
//     try{
//       if (src.indexOf(":") != -1){ 
//         stream = got.stream(src)
//       }else{
//         if (!fs.existsSync(src))
//           throw new Error(src + " doesn't exists")
//         stream = fs.createReadStream(src)
//       }
//     }catch(err){
//       continue
//     }
//   }
//   return stream
// }
// async function OUIparse(loc:string = ""): Promise<any[]>{
//   let opts: string[] = ["",""]
//   let stream: any = OUIgetStream(loc)  
//   return new Promise((resolve, reject) => {
//     const aRes: any[] = []
//     let rl: any = {}
//     // console.log("final stream ", stream.path)
//     try{
//       rl = readline.createInterface({
//         input: stream,
//         crlfDelay: Infinity
//       });
//     }catch(err:any){
//       console.log("Unable to create stream", err.msg.split(/\n/)[0])
//       reject(err)
//     }
//     rl
//       .on('line', (line : string) => {
//       // strip out comments or parse the line and push it to lineBuffer
//       if (line.charAt(0) != "#"){
//         let parts = line.split("\t")
//         let addr = parts[0].slice(0,2)+":"+parts[0].slice(2,4)+":"+parts[0].slice(4,6)
//         aRes.push([addr, parts[1]])
//       }        
//     })
//       .on('close', () => resolve(aRes));
//   })
// }
// let OUITab: any[] = []
// async function getOUI(oui: string): Promise<string>{
//   if (OUITab.length == 0){
//     OUITab = await OUIparse()
//   }
//   try{
//     return OUITab.find(e => { return e[0] == oui })[1] 
//   } catch(err){
//     return "Undefined"
//   }
// }
export class HwAddress {
    /**
     * Constructs a HardwareAddress from various formats:
     * - string: canonical ("aa:bb:cc")
     * - number | bigint: numeric representation
     * - Uint8Array: packed bytes
     * - HardwareAddress: clone of existing instance
     * @param input - Input address of various types
     * @param lengthOverride - Optional bit length when needed
     */
    constructor(input, lengthOverride) {
        _HwAddress_instances.add(this);
        _HwAddress_canon.set(this, void 0);
        _HwAddress_packed.set(this, void 0);
        _HwAddress_addr.set(this, void 0);
        _HwAddress_length.set(this, void 0);
        if (input instanceof _a) {
            __classPrivateFieldSet(this, _HwAddress_canon, input.canonical, "f");
            __classPrivateFieldSet(this, _HwAddress_packed, new Uint8Array(input.packed), "f"); // deep copy
            __classPrivateFieldSet(this, _HwAddress_addr, input.addr, "f");
            __classPrivateFieldSet(this, _HwAddress_length, input.length, "f");
        }
        else if (typeof input === 'string') {
            if (!input.match(/^([0-9a-f]{2}[:-])+[0-9a-f]{2}$/i)) {
                throw new Error('Invalid canonical format');
            }
            const length = input.split(/[:-]/).length * 8;
            __classPrivateFieldSet(this, _HwAddress_length, length, "f");
            __classPrivateFieldSet(this, _HwAddress_canon, input.replace(/[:-]/g, ":").toLowerCase(), "f");
            __classPrivateFieldSet(this, _HwAddress_packed, _a.canonicalToPacked(__classPrivateFieldGet(this, _HwAddress_canon, "f"), length), "f");
            __classPrivateFieldSet(this, _HwAddress_addr, _a.packedToNumeric(__classPrivateFieldGet(this, _HwAddress_packed, "f"), __classPrivateFieldGet(this, _HwAddress_packed, "f").length > 6), "f");
        }
        else if (input instanceof Uint8Array) {
            __classPrivateFieldSet(this, _HwAddress_packed, new Uint8Array(input), "f");
            __classPrivateFieldSet(this, _HwAddress_length, input.length * 8, "f");
            __classPrivateFieldSet(this, _HwAddress_canon, _a.packedToCanonical(__classPrivateFieldGet(this, _HwAddress_packed, "f")), "f");
            __classPrivateFieldSet(this, _HwAddress_addr, _a.packedToNumeric(__classPrivateFieldGet(this, _HwAddress_packed, "f"), input.length > 6), "f");
        }
        else if (typeof input === 'number' || typeof input === 'bigint') {
            if (!lengthOverride || lengthOverride % 8 !== 0) {
                throw new Error('Bit length (multiple of 8) is required for numeric input');
            }
            __classPrivateFieldSet(this, _HwAddress_length, lengthOverride, "f");
            __classPrivateFieldSet(this, _HwAddress_addr, input, "f");
            __classPrivateFieldSet(this, _HwAddress_packed, _a.numericToPacked(input, lengthOverride), "f");
            __classPrivateFieldSet(this, _HwAddress_canon, _a.packedToCanonical(__classPrivateFieldGet(this, _HwAddress_packed, "f")), "f");
        }
        else {
            throw new Error('Unsupported input type for HardwareAddress');
        }
    }
    // --- 🔍 Public Getters ---
    get canonical() {
        return __classPrivateFieldGet(this, _HwAddress_canon, "f");
    }
    get packed() {
        return new Uint8Array(__classPrivateFieldGet(this, _HwAddress_packed, "f")); // Return copy to preserve immutability
    }
    get addr() {
        return __classPrivateFieldGet(this, _HwAddress_addr, "f");
    }
    get length() {
        return __classPrivateFieldGet(this, _HwAddress_length, "f");
    }
    // formatting related
    /**
     * Returns an array of valid formats for the address length.
     * Example for MAC-48: xx:xx:xx:xx:xx:xx, xxxx.xxxx.xxxx, etc.
     */
    get validFormats() {
        if (__classPrivateFieldGet(_a, _a, "f", _HwAddress_validFormatCache).has(this.length)) {
            return __classPrivateFieldGet(_a, _a, "f", _HwAddress_validFormatCache).get(this.length);
        }
        const nibbles = this.length / 4;
        const makeChunks = (chunkSize, sep) => {
            return Array(nibbles / chunkSize)
                .fill(0)
                .map(() => 'x'.repeat(chunkSize))
                .join(sep);
        };
        const formats = [];
        for (const sep of _a.ALLOWED_SEPARATORS) {
            [2, 4, 6].forEach(size => {
                if (nibbles % size === 0) {
                    formats.push(makeChunks(size, sep));
                }
            });
        }
        formats.push('x'.repeat(nibbles)); // raw hex
        __classPrivateFieldGet(_a, _a, "f", _HwAddress_validFormatCache).set(this.length, formats);
        return formats;
    }
    get aliasFormats() {
        if (__classPrivateFieldGet(_a, _a, "f", _HwAddress_aliasFormatCache).has(this.length)) {
            return __classPrivateFieldGet(_a, _a, "f", _HwAddress_aliasFormatCache).get(this.length);
        }
        const formats = this.validFormats;
        const nibbles = this.length / 4;
        const aliasMap = new Map();
        for (const f of formats) {
            if (f.includes(':') && f.split(':').length === 6)
                aliasMap.set('canonical', f);
            if (f.includes('-') && f.split('-').length === 6)
                aliasMap.set('dashed', f);
            if (f.includes('.') && f.split('.').length === 3)
                aliasMap.set('dotted', f);
            if (!/[.:\- ]/.test(f))
                aliasMap.set('plain', f);
        }
        // Add all formats by their own pattern as well
        for (const f of formats) {
            aliasMap.set(f, f);
        }
        __classPrivateFieldGet(_a, _a, "f", _HwAddress_aliasFormatCache).set(this.length, aliasMap);
        return aliasMap;
    }
    /**
     * Returns the address in a custom string format.
     * @param pattern - A format string using 'x' for hex digits and allowed separators.
     */
    format(formatOrAlias) {
        const format = this.aliasFormats.get(formatOrAlias) ?? formatOrAlias;
        const hex = __classPrivateFieldGet(this, _HwAddress_packed, "f").reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
        const clean = format.replace(/[^x]/gi, '');
        if (clean.length !== hex.length) {
            throw new Error(`Format mismatch: pattern has ${clean.length} hex digits but address has ${hex.length}`);
        }
        let result = '';
        let hexIndex = 0;
        for (const char of format) {
            if (char.toLowerCase() === 'x') {
                result += hex[hexIndex++];
            }
            else if (_a.ALLOWED_SEPARATORS.has(char)) {
                result += char;
            }
            else {
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
    oui() {
        // return new HwAddress(this.addr, 24)
        // const oui = HwAddress.packedToCanonical(
        //   HwAddress.canonicalToPacked(this.#canon, 24)
        // )
        const oui = __classPrivateFieldGet(this, _HwAddress_canon, "f").slice(0, 8);
        return new _a(oui, 24);
    }
    /**
     *
     * @returns a string with the organization name if any or
     * "Undefined" if none it's associated with this oui
     */
    async ouiData(oui = "") {
        const canonical = (oui && oui !== "")
            ? oui.toUpperCase()
            : this.oui().canonical.toUpperCase();
        try {
            // Prefer full canonical when available to allow future 28/36 strategies
            const name = await OUIProvider.resolveFromCanonical(canonical);
            return name ?? "Undefined";
        }
        catch (err) {
            return "Undefined";
        }
    }
    /**
    * Checks if another HardwareAddress is equal to this one.
    * @param other - Another HardwareAddress instance.
    * @returns True if equal in length and value.
    */
    equals(other) {
        return this.length === other.length && this.addr === other.addr;
    }
    /**
     * Compares if this address is less than another (only if same length).
     * @param other - Another HardwareAddress instance.
     * @returns True if this < other.
     */
    lessThan(other) {
        __classPrivateFieldGet(this, _HwAddress_instances, "m", _HwAddress_assertComparable).call(this, other);
        return this.addr < other.addr;
    }
    /**
     * Compares if this address is greater than another (only if same length).
     * @param other - Another HardwareAddress instance.
     * @returns True if this > other.
     */
    greaterThan(other) {
        __classPrivateFieldGet(this, _HwAddress_instances, "m", _HwAddress_assertComparable).call(this, other);
        return this.addr > other.addr;
    }
    /**
     * Compares if this address is less than or equal to another.
     * @param other - Another HardwareAddress instance.
     * @returns True if this <= other.
     */
    lessThanOrEqual(other) {
        __classPrivateFieldGet(this, _HwAddress_instances, "m", _HwAddress_assertComparable).call(this, other);
        return this.addr <= other.addr;
    }
    /**
     * Compares if this address is greater than or equal to another.
     * @param other - Another HardwareAddress instance.
     * @returns True if this >= other.
     */
    greaterThanOrEqual(other) {
        __classPrivateFieldGet(this, _HwAddress_instances, "m", _HwAddress_assertComparable).call(this, other);
        return this.addr >= other.addr;
    }
    /**
     * Returns a hashable string representation for Map/Set use.
     * Format: canonical@length
     */
    hash() {
        return `${__classPrivateFieldGet(this, _HwAddress_canon, "f")}@${this.length}`;
    }
    /**
     * Compares current address to a nother one  numerically.
     * @returns -1 if a < b, 1 if a > b, 0 if equal
     */
    compareTo(other) {
        if (this.length !== other.length) {
            throw new Error(`Cannot compare addresses of different lengths: ${this.length} vs ${other.length}`);
        }
        if (this.addr < other.addr)
            return -1;
        if (this.addr > other.addr)
            return 1;
        return 0;
    }
    toJSON() {
        return {
            canonical: __classPrivateFieldGet(this, _HwAddress_canon, "f"),
            length: this.length
        };
    }
    static fromJSON(data) {
        if (typeof data !== 'object' ||
            typeof data.canonical !== 'string' ||
            typeof data.length !== 'number') {
            throw new Error('Invalid HardwareAddress JSON');
        }
        return new _a(data.canonical, data.length);
    }
    // --- Static Utilities ---
    static canonicalToPacked(canonical, length) {
        const byteLength = length / 8;
        const parts = canonical.split(':').map(part => parseInt(part, 16));
        if (parts.length !== byteLength ||
            parts.some(p => isNaN(p) || p < 0 || p > 255)) {
            throw new Error('Invalid canonical address or incorrect length');
        }
        return new Uint8Array(parts);
    }
    static packedToCanonical(packed) {
        // console.log("convert from:", packed)
        return Array.from(packed)
            .map((b, i) => {
            // console.log(`ST, |${i}|${b}|`)
            return b.toString(16).padStart(2, '0');
        })
            .join(':');
    }
    static packedToNumeric(packed, useBigInt = false) {
        // if (useBigInt || packed.length > 6) {
        //   return packed.reduce<bigint>((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
        // } else {
        //   return packed.reduce<number>((acc, byte) => (acc << 8) | byte, 0);
        // }
        let res = BigInt(0);
        res = packed.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
        return Number(res);
    }
    static numericToPacked(numeric, length) {
        const byteLength = length / 8;
        const packed = new Uint8Array(byteLength);
        if (typeof numeric === 'bigint') {
            for (let i = byteLength - 1; i >= 0; i--) {
                packed[i] = Number(numeric & 0xffn);
                numeric >>= 8n;
            }
        }
        else if (typeof numeric === 'number') {
            if (numeric < 0 || numeric > Number.MAX_SAFE_INTEGER) {
                throw new Error('Numeric address must be a safe JavaScript Number or use BigInt');
            }
            for (let i = byteLength - 1; i >= 0; i--) {
                packed[i] = numeric & 0xff;
                //console.log("N2P", numeric , packed)
                numeric = Math.floor(numeric / 256);
            }
        }
        else {
            throw new Error('Invalid numeric value: must be Number or BigInt');
        }
        return packed;
    }
    static canonToNumeric(canonical, length, useBigInt = false) {
        return _a.packedToNumeric(_a.canonicalToPacked(canonical, length), useBigInt);
    }
    static numericToCanon(numeric, length) {
        return _a.packedToCanonical(_a.numericToPacked(numeric, length));
    }
    /**
     * Compares two HardwareAddress instances numerically.
     * @returns -1 if a < b, 1 if a > b, 0 if equal
     */
    static compare(a, b) {
        if (a.length !== b.length) {
            throw new Error(`Cannot compare addresses of different lengths: ${a.length} vs ${b.length}`);
        }
        if (a.addr < b.addr)
            return -1;
        if (a.addr > b.addr)
            return 1;
        return 0;
    }
    /**
     * Sorts a list of HardwareAddress instances.
     * @param addresses - Array of HardwareAddress instances.
     * @param direction - 'asc' (default) or 'desc'
     */
    static sort(addresses, direction = 'asc') {
        const sorted = [...addresses].sort(_a.compare);
        return direction === 'desc' ? sorted.reverse() : sorted;
    }
}
_a = HwAddress, _HwAddress_canon = new WeakMap(), _HwAddress_packed = new WeakMap(), _HwAddress_addr = new WeakMap(), _HwAddress_length = new WeakMap(), _HwAddress_instances = new WeakSet(), _HwAddress_assertComparable = function _HwAddress_assertComparable(other) {
    if (this.length !== other.length) {
        throw new Error(`Cannot compare addresses of different lengths: ${this.length} vs ${other.length}`);
    }
};
HwAddress.ALLOWED_SEPARATORS = new Set([':', '-', '.', ' ']);
_HwAddress_validFormatCache = { value: new Map() };
_HwAddress_aliasFormatCache = { value: new Map() };
export class EUI48 extends HwAddress {
    constructor(addr) {
        super(addr, 48);
    }
}
export class EUI64 extends HwAddress {
    constructor(addr) {
        super(addr, 64);
    }
}
