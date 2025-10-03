export type VendorName = string;
export type PrefixHex = string;
export type AddressLike = {
    canonical: string;
} | {
    packed: Uint8Array;
} | Uint8Array;
export declare abstract class AbstractOuiProvider {
    private cache;
    constructor(enableCache?: boolean);
    /** Resolve a vendor from a full hardware address. Tries 24 -> 28 -> 36 in order. */
    resolveFromAddress(addr: AddressLike): Promise<VendorName | undefined>;
    /**
     * Generic direct resolve for a given prefix (6/7/9 hex, uppercase or not, with or without separators).
     * Useful for callers that already extracted a specific-length OUI.
     */
    resolveByPrefix(prefix: string): Promise<VendorName | undefined>;
    /** Implemented by concrete providers: return vendor for exact prefix or undefined. */
    protected abstract lookupExact(prefixHex: PrefixHex): Promise<VendorName | undefined> | VendorName | undefined;
    /** Clears internal cache (tests/tools). */
    clearCache(): void;
    /** Build the candidate prefixes (24 -> 28 -> 36) from a full hex string. */
    protected buildCandidates(fullHexUpper: string): PrefixHex[];
    /** Normalize any address-like into uppercase hex without separators. */
    protected fullAddressToHex(addr: AddressLike): string;
    /** Normalize "AA:BB:CC", "AABBCCD", "AA-BB-CC-DD-E" -> uppercase hex, validated length 6/7/9. */
    protected normalizePrefixGeneric(prefix: string): PrefixHex;
    /** Bytes -> "AABBCC..." */
    protected bytesToHexUpper(bytes: Uint8Array): string;
}
