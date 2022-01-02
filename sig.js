const ethers = require('ethers')
let flatSig = '0x4b64aefd1d4ad741a875aaf0eecc68e88e73abdc68501985ae5848b29fb8a3192908705b91125550e7f22eeb2678f16aca53dcbdd2175daf10b05a07a263c3251b'

let msg = "Some custom message";

let recovered = ethers.utils.verifyMessage(msg, flatSig);
console.log(recovered);

