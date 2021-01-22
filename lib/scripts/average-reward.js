const calcMinerReward = require('../util/miner-reward');
const Blockchain = require("../blockchain");
const TransactionPool = require('../wallet/transaction-pool');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

const blockchain = new Blockchain();
const rewards = [];

for(let i = 0; i < 10; i++){
    let transactionPool = new TransactionPool();
    let numberOfTransactions = Math.floor(Math.random() * 100 + 1);

    for(let j = 0; j < numberOfTransactions; j++){
        let transaction = new Transaction({ senderWallet: new Wallet(), recipient: 'foo', amount: 50})

        transactionPool.setTransaction(transaction);
    }
    blockchain.addBlock({ data: transactionPool.transactionMap });

    let difficulty = blockchain.getLatestBlock().difficulty;
    let blockSize = Object.values(transactionPool.transactionMap).length;
    let rewardAmount = calcMinerReward({ difficulty, blockSize });

    console.log(`${i} - Miner reward: ${rewardAmount}`);
    console.log(`Difficulty: ${difficulty}`);
    console.log(`Block Size: ${blockSize}`);

    rewards.push(rewardAmount);
}

const averageReward = rewards.reduce((total, num) => (total + num))/rewards.length;

console.log('The average reward amount is ', averageReward)