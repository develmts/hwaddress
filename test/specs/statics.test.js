import t from "tap";
import { HwAddress, EUI48, EUI64 } from "../../dist/hwaddress.js"


t.test("Static conversion and helpers", t => {
    const tester = {
        canon: "99:88:77:66:55:44", 
        numeric :  0x998877665544, // 168811397797188
        packed: new Uint8Array( [ 153, 136, 119, 102, 85, 68 ])
    }

    // from string     
    t.equal(HwAddress.canonToNumeric(tester.canon, 48),  tester.numeric, 'from string to numeric')
    t.equal( JSON.stringify(HwAddress.canonicalToPacked(tester.canon, 48)), 
             JSON.stringify(tester.packed), 'from string to packed')

    // from numeric
    // t.equal( HwAddress.numericToCanon(tester.numeric), tester.canon, 'from numeric to string')
    // t.equal( JSON.stringify(HwAddress.numericToPacked(tester.numeric)), 
    //          JSON.stringify(tester.packed), 'from numeric to packed')
    
    // from packed
    t.equal( HwAddress.packedToCanonical(tester.packed), tester.canon, 'from packed to string')
    t.equal( HwAddress.packedToNumeric(tester.packed), tester.numeric, 'from packed to numeric')
    t.end()
    
})
