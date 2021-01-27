const request = require('request');

const addTransaction = () => {
    const transaction = {amount: 50, recipient: 'foofoo'};

    request.post({ 
        url: 'http://localhost:3000/api/transact',
        json: transaction
    }, (err, res, body) => {
        if(!err && res.statusCode === 200)
            console.log(body);
    });
}


const vorpal = require('vorpal')();
 
vorpal
  .command('foo', 'Outputs "bar".')
  .action(function(args, callback) {
    this.log('bar');
    callback();
  });
 
vorpal
  .delimiter('Bitechain$')
  .show();

