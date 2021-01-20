const { MINE_RATE, GENESIS_DATA } = require("../../config");
const { cryptoHash } = require("../../util");

class Block{
    constructor({ data, timestamp, hash, previousHash, nonce, difficulty}){
        this.data = data;
        this.timestamp = timestamp;
        this.hash = hash;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis(){
        return new this(GENESIS_DATA);
    }

    static mineBlock({ previousBlock, data }){
        const previousHash = previousBlock.hash;
        let { difficulty } = previousBlock;
        let hash, timestamp;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ previousBlock, timestamp });
            hash = cryptoHash(data,timestamp, previousHash, difficulty, nonce);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this({
            data,
            timestamp,
            hash,
            previousHash,
            nonce,
            difficulty
        });
    }

    static adjustDifficulty({ previousBlock, timestamp }){
        const timeToMine = timestamp - previousBlock.timestamp; 
        const { difficulty } = previousBlock;

        if(difficulty < 1) 
            return 1;

        return timeToMine > MINE_RATE ? difficulty - 1 : difficulty + 1;
    }
}

module.exports = Block;

