const Block = require('./block');
const { cryptoHash } = require('../util');
const { REWARD_INPUT } = require('../config');
const { calculateMinerReward } = require('../util/miner-reward');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

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

    replaceChain(chain, validateTransactions, onSuccess){
        if(this.chain.length >= chain.length)
            return;
        
        if(!Blockchain.isValidChain(chain)){
            console.error('Invalid blockchain!');
            return;
        }

        if(validateTransactions && !this.validTransactionData({ chain })){
            console.error('The incoming chain has invalid data');
            return;
        }

        if(onSuccess) onSuccess();

        console.log('Replacing chain with', chain);
        this.chain = chain;
    }

    validTransactionData({ chain }){
        for(let i = 1; i < chain.length; i++){
            const block = chain[i];
            const previousBlock = chain[i - 1];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;

            console.log(JSON.stringify(block));
            for(let transaction of block.data){
                
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount++;

                    if(rewardTransactionCount > 1){
                        console.error('Miner reward count exceeds limit.');
                        return false;
                    }
        
                    let difficulty = previousBlock.difficulty;
                    let blockSize = block.data.length;
                    
                    if(Object.values(transaction.outputMap)[0] != calculateMinerReward({ difficulty, blockSize })){
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                }else{
                    if(!Transaction.validTransaction(transaction)){
                        console.error('Invalid Transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if(transaction.input.amount !== trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error('An identical transaction appears more than once in the block');
                        return false;
                    }else{
                        transactionSet.add(transaction);
                    }
                }
            }
        }
        return true;
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

            if(Math.abs(previousBlock.difficulty - difficulty) > 1)
                return false;
        }
        return true;
    }
}

module.exports = Blockchain;