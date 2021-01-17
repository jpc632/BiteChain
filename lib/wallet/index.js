const cryptoHash = require('../util/crypto-hash')
const { STARTING_BALANCE } = require('../config');
const { ec } = require('../util');

class Wallet{
    constructor(){
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic('hex');
    }

    sign(data){
        return this.keyPair.sign(cryptoHash(data));
    }
}

module.exports = Wallet;

//  1) Gives user public address in system (used to track balance)
//
//  2) track and calculate balance of user through blockchain history
//
//  3) validate transactions using signatures