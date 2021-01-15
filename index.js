const express = require('express');
const Blockchain = require('./blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./pubsub');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => pubsub.broadcastChain(), 100);

app.use(bodyParser.json()); 

app.get('/api/blocks', (req, res) => {
    // Send response in JSON format
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    
    res.redirect('/api/blocks');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`The application is listening on port: ${PORT}`);
})