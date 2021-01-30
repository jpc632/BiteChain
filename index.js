const express = require('express');
const bodyParser = require('body-parser');
const {startup} = require('./lib/startup');
const Blockchain = require('./lib/blockchain');
const PubSub = require('./lib/pubsub');
const TransactionPool = require('./lib/wallet/transaction-pool');
const Wallet = require('./lib/wallet');
const TransactionMiner = require('./lib/transaction-miner');

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

    api = startup({ app, blockchain, transactionPool });
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

const cli = require('vorpal')();
cli.use(require('./cli'));

cli
    .command('transfer <amt> <rcp>', 'Transfer funds to another wallet.')
    .option('-a, --amount <amt>', 'The amount to send.')
    .option('-r, --recipient <rcp>', 'The recipients wallet address.')
    .types({
        string: ['r', 'recipient']
    })
    .action(function(args, callback) {
        api.transferFunds(this, args);
        callback();
    });

cli
    .command('wallet', 'Display your wallet details.')
    .action(function(args, callback) {
        api.displayWallet(this);
        callback();
    });

cli
    .command('mine', 'Mine a new block.')
    .action(function(args, callback) {
        api.mineBlock(this);
        callback();
    });

cli
    .command('transaction-pool', 'View pending transactions.')
    .action(function(args, callback) {
        api.displayTransactionPool(this);
        callback();
    });

var inquirer = require('inquirer');

cli
    .command('chain', 'View all blocks on the chain.')
    .action(function(args, callback) {
        api.displayChain(this);
        callback();
    });

cli
    .command('login', 'Login to your Bitechain wallet.')
    .action(function(args, cb){
        const self = this;
        return inquirer.prompt({
            type: 'input',
            name: 'secret',
            message: 'Enter your secret phrase to access your wallet: ',
        }).then(result => {
            init(result.secret);
            cb();
        });
    });

cli
    .exec('login')
    .then(function(){
        return cli
            .delimiter('Bitechain$')
            .show();
});


