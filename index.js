const express = require('express');
const bodyParser = require('body-parser');
const startup = require('./lib/startup');
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
    pubsub;

const init = (secret) => {
    blockchain = new Blockchain();
    wallet = new Wallet(secret);
    transactionPool = new TransactionPool();
    pubsub = new PubSub({ blockchain, transactionPool });
    transactionMiner = new TransactionMiner({ blockchain, wallet, transactionPool, pubsub });

    startup({ app, blockchain, transactionPool });
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

const vorpal = require('vorpal')();
const request = require('request');
const { CONFIGURE_PORT } = require('./lib/config');
const { NODE_ADDRESS } = CONFIGURE_PORT;

vorpal
    .command('transfer', 'Transfer funds to another wallet.')
    .option('-a, --amount <amt>', 'The amount to send.')
    .option('-r, --recipient <rcp>', 'The recipients wallet address.')
    .types({
        string: ['r', 'recipient']
    })
    .action(function(args, callback) {
        const transaction = { 
            amount: args.amt, 
            recipient: args.rcp 
        };

        request.post({ 
            url: `http://localhost:3000/api/transact`,
            json: transaction
        }, (err, res, body) => {
            if(!err && res.statusCode === 200)
                this.log('Success');
        });
        callback();
    });

vorpal
    .command('wallet', 'Display your wallet details.')
    .action(function(args, callback) {
        request.get({
            url: `http://localhost:3000/api/wallet-info`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const walletDetails = JSON.parse(body);
                this.log(walletDetails);
            }
        });
        callback();
    });

vorpal
    .command('mine', 'Mine a new block.')
    .action(function(args, callback) {
        request.get({
            url: `http://localhost:3000/api/mine-transactions`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const block = JSON.parse(body);
                this.log(block);
            }
        });
        callback();
    });

vorpal
    .command('transaction-pool', 'View pending transactions.')
    .action(function(args, callback) {
        request.get({
            url: `http://localhost:3000/api/transaction-pool-map`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const transactionPool = JSON.parse(body);
                this.log(transactionPool);
            }
        });
        callback();
    });

const API = require('./api');
var inquirer = require('inquirer');

vorpal
    .command('chain', 'View all blocks on the chain.')
    .action(function(args, callback) {
        API.displayChain(this);
        callback();
    });

vorpal
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

vorpal
    .exec('login')
    .then(function(){
        return vorpal
            .delimiter('Bitechain$')
            .show();
});


