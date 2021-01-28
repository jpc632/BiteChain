const request = require('request');
class API{
    static displayChain(vorpal){
        request.get({
            url: `http://localhost:3000/api/blocks`
        }, (error, response, body) => {
            if(!error && response.statusCode === 200){
                const chain = JSON.parse(body);
                vorpal.log(chain);
            }
        });
    }
}

module.exports = API;