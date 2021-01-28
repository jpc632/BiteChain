// const vorpal = require('vorpal')();
// const request = require('request');
// const { NODE_ADDRESS } = require('../lib/config');

// vorpal
//     .command('transfer <amount> <recipient>', 'Transfer funds to another wallet.')
//     .action(function(args, callback) {
//         const transaction = { 
//             amount: args.amount, 
//             recipient: args.recipient 
//         };

//         request.post({ 
//             url: `${NODE_ADDRESS}/api/transact`,
//             json: transaction
//         }, (err, res, body) => {
//             if(!err && res.statusCode === 200)
//                 this.log('Success');
//         });
//         callback();
//     });

// vorpal
//     .command('wallet', 'Display your wallet details.')
//     .action(function(args, callback) {
//         request.get({
//             url: `${NODE_ADDRESS}/api/wallet-info`
//         }, (error, response, body) => {
//             if(!error && response.statusCode === 200){
//                 const walletDetails = JSON.parse(body);
//                 this.log(walletDetails);
//             }
//         });
//         callback();
//     });

// vorpal
//     .command('mine', 'Mine a new block.')
//     .action(function(args, callback) {
//         request.get({
//             url: `${NODE_ADDRESS}/api/mine-transactions`
//         }, (error, response, body) => {
//             if(!error && response.statusCode === 200){
//                 const block = JSON.parse(body);
//                 this.log(block);
//             }
//         });
//         callback();
//     });

// vorpal
//     .command('transaction-pool', 'View pending transactions.')
//     .action(function(args, callback) {
//         request.get({
//             url: `${NODE_ADDRESS}/api/transaction-pool-map`
//         }, (error, response, body) => {
//             if(!error && response.statusCode === 200){
//                 const transactionPool = JSON.parse(body);
//                 this.log(transactionPool);
//             }
//         });
//         callback();
//     });


//   vorpal
//     .command('chain', 'View all blocks on the chain.')
//     .action(function(args, callback) {
//         request.get({
//             url: `${NODE_ADDRESS}/api/blocks`
//         }, (error, response, body) => {
//             if(!error && response.statusCode === 200){
//                 const chain = JSON.parse(body);
//                 this.log(chain);
//             }
//         });
//         callback();
//     });

// module.exports = function (vorpal) {
//   vorpal
//     .use(require('./commands/chain'))
//     .delimiter('Bitechain →')
//     .show()
// }