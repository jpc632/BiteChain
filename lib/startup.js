const request = require('request');
const API = require('../api');
const { loadChainFromFile, writeChainToFile } = require('./util/handle-storage');

const startup = ({ app, blockchain, transactionPool }) => {

    loadChainFromFile(blockchain.chain);

    const { DEFAULT_PORT, PORT, ROOT_NODE_ADDRESS, NODE_ADDRESS } = CONFIGURE_PORT(); 

    app.listen(PORT, () => {
        console.log(`The application is listening on port: ${PORT}`);

        if(PORT !== DEFAULT_PORT)
            syncRootState();
    });
 
    const syncRootState = () => {
        request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const rootChain = JSON.parse(body);
                blockchain.replaceChain(rootChain);
                writeChainToFile(blockchain.chain);
            }
        });

        request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const rootTransactionPoolMap = JSON.parse(body);
                transactionPool.setMap(rootTransactionPoolMap);
            }
        });
    }

    const api = new API(NODE_ADDRESS);
    return api;
}

const CONFIGURE_PORT = () => {
    const DEFAULT_PORT = 3000;
    let PEER_PORT;

    if(process.env.GENERATE_PEER_PORT === 'true'){
        PEER_PORT = DEFAULT_PORT + Math.ceil((Math.random() * 1000));
    }

    const PORT = PEER_PORT || DEFAULT_PORT;
    
    return {
        DEFAULT_PORT,
        PORT,
        ROOT_NODE_ADDRESS: `http://localhost:${DEFAULT_PORT}`,
        NODE_ADDRESS: `http://localhost:${PORT}`
    } 
}

module.exports = {startup};