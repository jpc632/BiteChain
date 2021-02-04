const express = require('express');
const bodyParser = require('body-parser');
const {startup} = require('./startup');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./transaction-miner');

const app = express();
let wallet, 
    blockchain, 
    transactionPool, 
    transactionMiner, 
    pubsub,
    api;

const init = (secret) => {
    blockchain = new Blockchain();
    wallet = new Wallet(secret);
    transactionPool = new TransactionPool();
    pubsub = new PubSub({ blockchain, transactionPool });
    transactionMiner = new TransactionMiner({ blockchain, wallet, transactionPool, pubsub });
    if(!api)
        api = startup({ app, blockchain, transactionPool });

    return api;
}

/*
    HANDLE REQUESTS
*/
app.use(bodyParser.json()); 

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    try{
        if(!transaction){
            transaction = wallet.createTransaction({ 
                amount, 
                recipient, 
                chain: blockchain.chain 
            });
        }else{
            transaction.update({ 
                senderWallet: wallet, 
                recipient, 
                amount 
            });
        }    
    }catch(error){
        return res.status(400).json({ type: 'error', message: error.message});
    }
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;

    res.json({ 
        address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
    });
});

module.exports = init;