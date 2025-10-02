// src/semantics.ts
// No imports from hwaddress to avoid circular deps.

export type AddressLike = {
  packed: Uint8Array;   // bytes
  length: number;       // in bits
  canonical: string;    // "aa:bb:..."
} | Uint8Array;

/** Grab the first byte regardless of AddressLike shape. */
export function firstByte(addr: AddressLike): number {
  const bytes = addr instanceof Uint8Array ? addr : addr.packed;
  const b0 = bytes[0];
  if (typeof b0 !== "number") throw new Error("invalid address input");
  return b0;
}

/** I/G bit: 1 => multicast/group, 0 => unicast/individual */
export function isMulticast(addr: AddressLike): boolean {
  return (firstByte(addr) & 0b00000001) === 0b00000001;
}
export function isUnicast(addr: AddressLike): boolean {
  return !isMulticast(addr);
}

/** U/L bit: 1 => locally administered, 0 => universally administered */
export function isLocallyAdministered(addr: AddressLike): boolean {
  return (firstByte(addr) & 0b00000010) === 0b00000010;
}
export function isUniversallyAdministered(addr: AddressLike): boolean {
  return !isLocallyAdministered(addr);
}

/** Ethernet broadcast (48-bit only): ff:ff:ff:ff:ff:ff */
export function isBroadcast(addr: AddressLike): boolean {
  const bytes = addr instanceof Uint8Array ? addr : addr.packed;
  const len = addr instanceof Uint8Array ? bytes.length * 8 : addr.length;
  if (len !== 48) return false;
  for (let i = 0; i < 6; i++) if (bytes[i] !== 0xff) return false;
  return true;
}

/** Bit helpers (return modified first byte; caller can build a new address if needed). */
export const flipUlBit = (addr: AddressLike) => firstByte(addr) ^ 0b00000010;
export const setUlBit  = (addr: AddressLike) => firstByte(addr) | 0b00000010;
export const clearUlBit= (addr: AddressLike) => firstByte(addr) & ~0b00000010;
export const clearIgBit= (addr: AddressLike) => firstByte(addr) & ~0b00000001;

/** EUI-48 -> EUI-64: insert ff:fe and flip U/L on first byte. */
export function toEui64FromEui48(addr: AddressLike): Uint8Array {
  const p = addr instanceof Uint8Array ? addr : addr.packed;
  if (p.length !== 6) throw new Error("toEui64FromEui48: input must be 48-bit");
  const out = new Uint8Array(8);
  out[0] = p[0] ^ 0b00000010; // flip U/L
  out.set(p.slice(1, 3), 1);
  out[3] = 0xff;
  out[4] = 0xfe;
  out.set(p.slice(3, 6), 5);
  return out;
}

/** EUI-64 -> EUI-48 if matches ff:fe pattern; otherwise null. */
export function toEui48FromEui64IfConvertible(addr: AddressLike): Uint8Array | null {
  const p = addr instanceof Uint8Array ? addr : addr.packed;
  if (p.length !== 8) return null;
  if (p[3] !== 0xff || p[4] !== 0xfe) return null;
  const out = new Uint8Array(6);
  out[0] = p[0] ^ 0b00000010; // flip back U/L
  out[1] = p[1];
  out[2] = p[2];
  out[3] = p[5];
  out[4] = p[6];
  out[5] = p[7];
  return out;
}
