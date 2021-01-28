const request = require('request');
const { CONFIGURE_PORT } = require('./config');
const { loadChainFromFile, writeChainToFile } = require('./util/handle-storage');

const startup = ({ app, blockchain, transactionPool }) => {

    loadChainFromFile(blockchain.chain);

    const { DEFAULT_PORT, PORT, ROOT_NODE_ADDRESS } = CONFIGURE_PORT(); 

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
}

module.exports = startup;