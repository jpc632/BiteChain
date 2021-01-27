const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');
 
class Wallet{
    constructor(secret){
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.keyFromSecret(secret);
        this.publicKey = this.keyPair.getPublic('hex');
    }

    sign(data){
        return this.keyPair.sign(cryptoHash(data)).toHex();
    }

    createTransaction({ amount, recipient, chain }){
        if(chain){
            this.balance = Wallet.calculateBalance({ 
                chain, 
                address: this.publicKey 
            });
        }

        if(amount > this.balance)
            throw new Error('Amount exceeds balance!');

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }){
        let hasConductedTransaction = false;
        let balance = 0;
        
        for(let i = chain.length - 1; i > 0; i--){
            const block = chain[i];

            for(let transaction of block.data){
                if(transaction.input.address === address)
                    hasConductedTransaction = true;
                
                const addressOutput = transaction.outputMap[address];

                if(addressOutput)
                    balance += addressOutput;
            }
            if(hasConductedTransaction) break;
        }
        return hasConductedTransaction ? balance : STARTING_BALANCE + balance;
    }

    toString(){
        return `
            Wallet
        `
    }
}

module.exports = Wallet;