export declare class HwAddress {
    #private;
    static readonly ALLOWED_SEPARATORS: Set<string>;
    /**
     * Constructs a HardwareAddress from various formats:
     * - string: canonical ("aa:bb:cc")
     * - number | bigint: numeric representation
     * - Uint8Array: packed bytes
     * - HardwareAddress: clone of existing instance
     * @param input - Input address of various types
     * @param lengthOverride - Optional bit length when needed
     */
    constructor(input: string | number | bigint | Uint8Array | HwAddress, lengthOverride?: number);
    get canonical(): string;
    get packed(): Uint8Array;
    get addr(): number | bigint;
    get length(): number;
    /**
     * Returns an array of valid formats for the address length.
     * Example for MAC-48: xx:xx:xx:xx:xx:xx, xxxx.xxxx.xxxx, etc.
     */
    get validFormats(): string[];
    private get aliasFormats();
    /**
     * Returns the address in a custom string format.
     * @param pattern - A format string using 'x' for hex digits and allowed separators.
     */
    format(formatOrAlias: string): string;
    /**
     *
     * @returns a new 24-bit hardware address representing
     * the organizational unit of this addresss
     */
    oui(): HwAddress;
    /**
     *
     * @returns a string with the organization name if any or
     * "Undefined" if none it's associated with this oui
     */
    ouiData(oui?: string): Promise<string>;
    /**
    * Checks if another HardwareAddress is equal to this one.
    * @param other - Another HardwareAddress instance.
    * @returns True if equal in length and value.
    */
    equals(other: HwAddress): boolean;
    /**
     * Compares if this address is less than another (only if same length).
     * @param other - Another HardwareAddress instance.
     * @returns True if this < other.
     */
    lessThan(other: HwAddress): boolean;
    /**
     * Compares if this address is greater than another (only if same length).
     * @param other - Another HardwareAddress instance.
     * @returns True if this > other.
     */
    greaterThan(other: HwAddress): boolean;
    /**
     * Compares if this address is less than or equal to another.
     * @param other - Another HardwareAddress instance.
     * @returns True if this <= other.
     */
    lessThanOrEqual(other: HwAddress): boolean;
    /**
     * Compares if this address is greater than or equal to another.
     * @param other - Another HardwareAddress instance.
     * @returns True if this >= other.
     */
    greaterThanOrEqual(other: HwAddress): boolean;
    /**
     * Returns a hashable string representation for Map/Set use.
     * Format: canonical@length
     */
    hash(): string;
    /**
     * Compares current address to a nother one  numerically.
     * @returns -1 if a < b, 1 if a > b, 0 if equal
     */
    compareTo(other: HwAddress): number;
    toJSON(): {
        canonical: string;
        length: number;
    };
    static fromJSON(data: {
        canonical: string;
        length: number;
    }): HwAddress;
    static canonicalToPacked(canonical: string, length: number): Uint8Array;
    static packedToCanonical(packed: Uint8Array): string;
    static packedToNumeric(packed: Uint8Array, useBigInt?: boolean): number | bigint;
    static numericToPacked(numeric: number | bigint, length: number): Uint8Array;
    static canonToNumeric(canonical: string, length: number, useBigInt?: boolean): number | bigint;
    static numericToCanon(numeric: number | bigint, length: number): string;
    /**
     * Compares two HardwareAddress instances numerically.
     * @returns -1 if a < b, 1 if a > b, 0 if equal
     */
    static compare(a: HwAddress, b: HwAddress): number;
    /**
     * Sorts a list of HardwareAddress instances.
     * @param addresses - Array of HardwareAddress instances.
     * @param direction - 'asc' (default) or 'desc'
     */
    static sort(addresses: HwAddress[], direction?: 'asc' | 'desc'): HwAddress[];
}
export declare class EUI48 extends HwAddress {
    constructor(addr: string | number | bigint | Uint8Array | HwAddress);
}
export declare class EUI64 extends HwAddress {
    constructor(addr: string | number | bigint | Uint8Array | HwAddress);
}
