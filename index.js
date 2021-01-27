const express = require('express');
const bodyParser = require('body-parser');
const startup = require('./lib/startup');
const Blockchain = require('./lib/blockchain');
const PubSub = require('./lib/pubsub');
const TransactionPool = require('./lib/wallet/transaction-pool');
const Wallet = require('./lib/wallet');
const TransactionMiner = require('./lib/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet("secret");
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, wallet, transactionPool, pubsub });

startup({ app, blockchain, transactionPool });

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



const request = require('request');

const addTransaction = () => {
    const transaction = {amount: 50, recipient: 'foofoo'};

    request.post({ 
        url: 'http://localhost:3000/api/transact',
        json: transaction
    }, (err, res, body) => {
        if(!err && res.statusCode === 200)
            return body;
    });

    return transaction;
}


const vorpal = require('vorpal')();
 
vorpal
    .command('foo', 'Outputs "bar".')
    .action(function(args, callback) {
        const transaction = addTransaction();
        this.log(transaction);
        callback();
    });
 
vorpal
    .delimiter('Bitechain$')
    .show();

