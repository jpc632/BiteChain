const Transaction = require("./wallet/transaction");
const { writeChainToFile } = require('./util/handle-storage');

class TransactionMiner{
    constructor({ blockchain, transactionPool, wallet, pubsub }){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }
    
    mineTransactions(){
        // Get the transaction pool's valid transactions
        const validTransactions = this.transactionPool.validTransactions();

        // Generate the miners reward
        validTransactions.push(
            Transaction.rewardTransaction({ 
                minerWallet: this.wallet, 
                blockSize: validTransactions.length + 1, 
                difficulty: this.blockchain.getLatestBlock().difficulty 
            })
        );
    
        // Add a block consisting of these transactions to the blockchain
        this.blockchain.addBlock({ data: validTransactions });

        // Save new chain to local storage
        writeChainToFile(this.blockchain.chain);
    
        // Broadcast the updated blockchain
        this.pubsub.broadcastChain();
    
        // Clear the transaction pool
        this.transactionPool.clearAllTransactions(); 
    }
}   

module.exports = TransactionMiner;