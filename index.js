import {EUI48} from './dist/hwaddress.js'

const _real = {
    canon :"30:5A:3A:7F:5E:CC",
    numeric : 0x305A3A7F5ECC,
    packed : new Uint8Array(6) [ 48, 90, 58, 127, 94, 204 ]
}
// const _canon = "99:88:77:66:55:44"
// //                01234567890123456
// const _maxnumeric =  419996487398549
// const _numeric = 0x998877665544
// const _packed = new Uint8Array( [ 153, 136, 119, 102, 85, 68 ])


const _addr = new EUI48(_real.numeric)
console.log( _addr.addr)
console.log( _addr.packed)
console.log( _addr.canonical)
console.log( await _addr.ouiData())

