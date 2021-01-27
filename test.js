const request = require('request');

const addTransaction = () => {
        const transaction = {amount: 50, recipient: 'foofoo'};

        request.post({ 
            url: 'http://localhost:3000/api/transact',
            //body: JSON.stringify(transaction),
            json: transaction
        }, (err, res, body) => {
            if(!err && res.statusCode === 200)
                console.log(body);
        });
    }

addTransaction();