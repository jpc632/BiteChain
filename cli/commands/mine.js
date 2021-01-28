module.exports = (vorpal) => {
    vorpal
        .command('mine', 'Mine a new block.')
        .action(function(args, callback) {
            request.get({
                url: `${NODE_ADDRESS}/api/mine-transactions`
            }, (error, response, body) => {
                if(!error && response.statusCode === 200){
                    const block = JSON.parse(body);
                    this.log(block);
                }
            });
            callback();
        });
}

