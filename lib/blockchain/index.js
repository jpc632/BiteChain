const Block = require('./block');
const { cryptoHash } = require('../util');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock({ data }){
        console.log('Mining Block...');

        const newBlock = Block.mineBlock({
            previousBlock : this.getLatestBlock(),
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain){
        if(this.chain.length >= chain.length)
            return;
        
        if(!Blockchain.isValidChain(chain)){
            console.error('Invalid blockchain!');
            return;
        }

        console.log('Replacing chain with', chain);
        this.chain = chain;
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;
        
        for(let i = 1; i < chain.length; i++){
            const previousBlock = chain[i - 1];
            const { timestamp, previousHash, hash, data, nonce, difficulty } = chain[i];

            if(previousHash !== previousBlock.hash)
                return false;
            
            if(hash !== cryptoHash(timestamp, data, previousHash, nonce, difficulty))
                return false;
        }
        return true;
    }
}

module.exports = Blockchain;