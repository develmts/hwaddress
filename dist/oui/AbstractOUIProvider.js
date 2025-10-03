// src/oui/providers/AbstractProvider.ts
// Orchestrates OUI resolution: always 24 -> 28 -> 36 from a full address.
// No imports, no I/O. Concrete providers implement only `lookupExact()`.
export class AbstractOuiProvider {
    constructor(enableCache = true) {
        this.cache = enableCache ? new Map() : new Map();
    }
    /** Resolve a vendor from a full hardware address. Tries 24 -> 28 -> 36 in order. */
    async resolveFromAddress(addr) {
        const hex = this.fullAddressToHex(addr); // "AABBCCDDEEFF" / "0011223344556677"
        // console.log(`resulting hex: ${hex} length`)
        // if (hex.length < 9) return undefined;               // need at least 36 bits (9 hex) to attempt full cascade
        const candidates = this.buildCandidates(hex); // [6,7,9]-length prefixes
        // console.log(`Searching for ${candidates}`)
        for (const p of candidates) {
            const cached = this.cache.get(p);
            if (cached !== undefined)
                return cached;
            const hit = await this.lookupExact(p);
            if (hit !== undefined) {
                this.cache.set(p, hit);
                return hit;
            }
            // negative-cache each attempted prefix to avoid re-queries
            this.cache.set(p, undefined);
        }
        return undefined;
    }
    /**
     * Generic direct resolve for a given prefix (6/7/9 hex, uppercase or not, with or without separators).
     * Useful for callers that already extracted a specific-length OUI.
     */
    async resolveByPrefix(prefix) {
        const p = this.normalizePrefixGeneric(prefix); // "AABBCC" | "AABBCCD" | "AABBCCDDE"
        const cached = this.cache.get(p);
        if (cached !== undefined)
            return cached;
        const hit = await this.lookupExact(p);
        this.cache.set(p, hit);
        return hit;
    }
    /** Clears internal cache (tests/tools). */
    clearCache() {
        this.cache.clear();
    }
    // -------------------- helpers (generic, provider-agnostic) --------------------
    /** Build the candidate prefixes (24 -> 28 -> 36) from a full hex string. */
    buildCandidates(fullHexUpper) {
        return [
            fullHexUpper.slice(0, 6), // 24 bits = 6 hex
            fullHexUpper.slice(0, 7), // 28 bits = 7 hex
            fullHexUpper.slice(0, 9), // 36 bits = 9 hex
        ];
    }
    /** Normalize any address-like into uppercase hex without separators. */
    fullAddressToHex(addr) {
        if (addr instanceof Uint8Array)
            return this.bytesToHexUpper(addr);
        if ('packed' in addr &&
            addr.packed.length > 0 &&
            addr.packed instanceof Uint8Array) {
            return this.bytesToHexUpper(addr.packed);
        }
        if ('canonical' in addr && typeof addr.canonical === 'string') {
            return addr.canonical.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
        }
        throw new Error('Unsupported address-like input');
    }
    /** Normalize "AA:BB:CC", "AABBCCD", "AA-BB-CC-DD-E" -> uppercase hex, validated length 6/7/9. */
    normalizePrefixGeneric(prefix) {
        if (/[^0-9a-fA-F:\-]/.test(prefix)) {
            throw new Error("Invalid OUI prefix: non-hex characters found");
        }
        const hex = prefix.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
        if (hex.length !== 6 && hex.length !== 7 && hex.length !== 9) {
            throw new Error('Invalid OUI prefix length: expected 6, 7, or 9 hex nibbles');
        }
        return hex;
    }
    /** Bytes -> "AABBCC..." */
    bytesToHexUpper(bytes) {
        let out = '';
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            out += (b >>> 4).toString(16).toUpperCase();
            out += (b & 0x0f).toString(16).toUpperCase();
        }
        return out;
    }
}
