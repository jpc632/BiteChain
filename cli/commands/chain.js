const request = require('request');
const { NODE_ADDRESS } = require('../../lib/config');
module.exports = (vorpal) => {
  vorpal
    .command('chain', 'View all blocks on the chain.')
    .action(function(args, callback) {
        request.get({
            url: `${NODE_ADDRESS}/api/blocks`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const chain = JSON.parse(body);
                this.log(chain);
            }
        });
        callback();
    });
}