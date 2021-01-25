const Transaction = require("./transaction");

class TransactionPool{
    constructor(){
        this.transactionMap = {}; 
    }

    setTransaction(transaction){
        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap){
        this.transactionMap = transactionMap;
    }

    existingTransaction({ inputAddress }){
        const transactions = Object.values(this.transactionMap);

        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    validTransactions(){
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction)
        );
    }

    clearAllTransactions(){
        this.transactionMap = {};
    }

    clearRecordedTransactions({ chain }){
        for(let block of chain){
            for(let transaction of block.data){
                if(transaction.id in this.transactionMap)
                    delete this.transactionMap[transaction.id];
            }
        }
    }
}

module.exports = TransactionPool;