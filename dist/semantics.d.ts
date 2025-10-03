export type AddressLike = {
    packed: Uint8Array;
    length: number;
    canonical: string;
} | Uint8Array;
/** Grab the first byte regardless of AddressLike shape. */
export declare function firstByte(addr: AddressLike): number;
/** I/G bit: 1 => multicast/group, 0 => unicast/individual */
export declare function isMulticast(addr: AddressLike): boolean;
export declare function isUnicast(addr: AddressLike): boolean;
/** U/L bit: 1 => locally administered, 0 => universally administered */
export declare function isLocallyAdministered(addr: AddressLike): boolean;
export declare function isUniversallyAdministered(addr: AddressLike): boolean;
/** Ethernet broadcast (48-bit only): ff:ff:ff:ff:ff:ff */
export declare function isBroadcast(addr: AddressLike): boolean;
/** Bit helpers (return modified first byte; caller can build a new address if needed). */
export declare const flipUlBit: (addr: AddressLike) => number;
export declare const setUlBit: (addr: AddressLike) => number;
export declare const clearUlBit: (addr: AddressLike) => number;
export declare const clearIgBit: (addr: AddressLike) => number;
/** EUI-48 -> EUI-64: insert ff:fe and flip U/L on first byte. */
export declare function toEui64FromEui48(addr: AddressLike): Uint8Array;
/** EUI-64 -> EUI-48 if matches ff:fe pattern; otherwise null. */
export declare function toEui48FromEui64IfConvertible(addr: AddressLike): Uint8Array | null;
