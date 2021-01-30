const request = require('request');
class API{
    constructor(NODE_ADDRESS){
        this.NODE_ADDRESS = NODE_ADDRESS;
    }

    displayChain(cli){
        request.get({
            url: `${this.NODE_ADDRESS}/api/blocks`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const chain = JSON.parse(body);
                cli.log(chain);
            }
        });
    }

    displayWallet(cli){
        request.get({
            url: `${this.NODE_ADDRESS}/api/wallet-info`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const walletDetails = JSON.parse(body);
                cli.log(walletDetails);
            }
        });
    }

    displayTransactionPool(cli){
        request.get({
            url: `${this.NODE_ADDRESS}/api/transaction-pool-map`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const transactionPool = JSON.parse(body);
                cli.log(transactionPool);
            }else{
                cli.log(this.NODE_ADDRESS);
                cli.log(error);
            }
        });
    }

    transferFunds(cli, args){
        const transaction = { 
            amount: args.amt, 
            recipient: args.rcp 
        };
        request.post({ 
            url: `${this.NODE_ADDRESS}/api/transact`,
            json: transaction
        }, (err, res, body) => {
            if(!err && res.statusCode === 200)
                cli.log('Success');
        });
    }

    mineBlock(cli){
        request.get({
            url: `${this.NODE_ADDRESS}/api/mine-transactions`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const block = JSON.parse(body);
                cli.log(block);
            }
        });
    }
}

module.exports = API;