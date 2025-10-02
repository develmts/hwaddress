import t from "tap";
import { HwAddress, EUI48, EUI64 } from "../../dist/hwaddress.js"

// fails if no address param

t.test("Fails on incorrect params", t => {

    t.throws(() => new HwAddress(""), 'should throw an exception')
    t.throws(() => new HwAddress(-1), 'should throw an exception')
    t.end()
})

t.test("Do normalization on creation" ,t => {
    const tester = {
        canon: "99:88:77:66:55:44", 
        numeric :  0x998877665544, // 168811397797188
        packed: new Uint8Array( [ 153, 136, 119, 102, 85, 68 ])
    }

    // from string     
    let _addr = new HwAddress(tester.canon)
    t.equal(_addr.addr , tester.numeric, 'from string to numeric')
    t.equal(JSON.stringify(Array.from(_addr.packed)) , JSON.stringify(Array.from(tester.packed)), 'from string to packed')

    // from numeric
    _addr = new HwAddress(tester.numeric, 48)
    // console.log ("tester", tester.canon)
    // console.log("address", _addr.canonical)
    t.equal(_addr.canonical , tester.canon, 'from numeric to string')
    t.equal ( JSON.stringify(_addr.packed), JSON.stringify(tester.packed), 'from numeric to packed')
    //t.equal(_addr.packed , tester.packed, 'from numeric to packed')

    // from packed
    _addr = new HwAddress(tester.packed)
    t.equal(_addr.canonical , tester.canon,'from packed to string')
    t.equal(_addr.addr , tester.numeric, 'from packed to numeric')
    t.end()
})


t.test("Find the correct Orginazation value", async t => {
    let _addr = {}
    const noOrg = {
        canon: "99:88:77:66:55:44", 
        name: "Undefined"
    }
    const correct = {
        canon: "30:5a:3a:7f:5e:cc",
        name : "ASUSTek COMPUTER INC."
    }

    _addr = new HwAddress(correct.canon)
    t.equal(await _addr.ouiData(), correct.name, "Found correct one if exixst")

    _addr = new HwAddress(noOrg.canon)
    t.equal(await _addr.ouiData(), noOrg.name, "Undefiend if not exists")
    t.end()

})