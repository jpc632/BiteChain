const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
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
        if(this.chain.length >= chain.length){
            console.error('The incoming chain must be longer.');
            return;
        }
        
        if(!Blockchain.isValidChain(chain)){
            console.error('The incoming chain must be valid.');
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