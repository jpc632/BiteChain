const redis = require('redis');

const CHANNELS = {
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTIONPOOL: 'TRANSACTIONPOOL'
}

class PubSub{
    constructor({ blockchain, transactionPool }){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannels();
        this.subscriber.on(
            'message', 
            (channel, message) => this.handleMessage(channel, message)
        );
    }

    handleMessage(channel, message){
        console.log(
            `Message recieved. 
            Channel: ${channel}. 
            Message: ${message}`
        );
        const parsedMessage = JSON.parse(message);

        if(channel === CHANNELS.BLOCKCHAIN){
            this.blockchain.replaceChain(parsedMessage, true, () => {
                this.transactionPool.clearRecordedTransactions({ chain: parsedMessage });
            });
        }
        else if(channel === CHANNELS.TRANSACTIONPOOL){
            this.transactionPool.setTransaction(parsedMessage);
        }
    }

    subscribeToChannels(){
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    publish({ channel, message }){
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    broadcastChain(){
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction){
        this.publish({
            channel: CHANNELS.TRANSACTIONPOOL,
            message: JSON.stringify(transaction)
        })
    }
}

module.exports = PubSub;