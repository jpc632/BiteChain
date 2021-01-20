const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const { CONFIGURE_PORT } = require('./lib/config');
const Blockchain = require('./lib/blockchain');
const PubSub = require('./lib/pubsub');
const TransactionPool = require('./lib/wallet/transaction-pool');
const Wallet = require('./lib/wallet');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain });

const { DEFAULT_PORT, PORT, ROOT_NODE_ADDRESS } = CONFIGURE_PORT(); 

app.listen(PORT, () => {
    console.log(`The application is listening on port: ${PORT}`);

    if(PORT !== DEFAULT_PORT)
        syncChains();
});

/*
    SYNC BLOCKCHAIN
*/
const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if(!error && response.statusCode === 200){
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with ', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
};

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
        if(!transaction)
            transaction = wallet.createTransaction({ amount, recipient });
        else    
            transaction.update({ senderWallet: wallet, recipient, amount });
    }catch(error){
        return res.status(400).json({ type: 'error', message: error.message});
    }
    
    transactionPool.setTransaction(transaction);

    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    
});