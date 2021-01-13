const { mineBlock } = require('./block');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
        this.difficulty
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock({ data }){
        const newBlock = Block.mineBlock({
            previousBlock : this.getLatestBlock(),
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain){
        if(this.chain.length >= chain.length)
            return;
        
        if(!Blockchain.isValidChain(chain))
            return;

        this.chain = chain;
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;
        
        for(let i = 1; i < chain.length; i++){
            const previousBlock = chain[i - 1];
            const { timestamp, previousHash, hash, data } = chain[i];

            if(previousHash !== previousBlock.hash)
                return false;
            
            if(hash !== cryptoHash(timestamp, data, previousHash))
                return false;
        }
        return true;
    }
}

module.exports = Blockchain;