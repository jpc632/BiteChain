const init = require('../lib');
const inquirer = require('inquirer');

let api;

module.exports = function(vorpal){
    vorpal
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

    vorpal
        .command('wallet', 'Display your wallet details.')
        .action(function(args, callback) {
            api.displayWallet(this);
            callback();
        });

    vorpal
        .command('mine', 'Mine a new block.')
        .action(function(args, callback) {
            api.mineBlock(this);
            callback();
        });

    vorpal
        .command('transaction-pool', 'View pending transactions.')
        .action(function(args, callback) {
            api.displayTransactionPool(this);
            callback();
        });

    vorpal
        .command('chain', 'View all blocks on the chain.')
        .action(function(args, callback) {
            api.displayChain(this);
            callback();
        });

    vorpal
        .command('login', 'Login to your Bitechain wallet.')
        .action(function(args, cb){
            return inquirer.prompt({
                type: 'input',
                name: 'secret',
                message: 'Enter your secret phrase to access your wallet: ',
            }).then(result => {
                api = init(result.secret);
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
}
