const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block{
    constructor({ data, timestamp, hash, previousHash }){
        this.data = data;
        this.timestamp = timestamp;
        this.hash = hash;
        this.previousHash = previousHash;
    }

    static genesis(){
        return new this(GENESIS_DATA);
    }

    static mineBlock({ previousBlock, data }){
        const timestamp = Date.now();
        const previousHash = previousBlock.hash;
        
        while(true){
            return new this({
                data,
                timestamp,
                hash : cryptoHash(data, timestamp, previousHash),
                previousHash,
            });
        }
    }
}

module.exports = Block;

