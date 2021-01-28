const INITIAL_DIFFICULTY = 1;
const MINE_RATE = 200;
const REWARD_INPUT = { address: '*authorised-reward-transaction*' };
const BASE_REWARD = 20;
const STARTING_BALANCE = 500;

const GENESIS_DATA = {
    data: ["GENESIS"],
    timestamp: 10000,
    previousHash: null,
    hash: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9',
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY
};

const CONFIGURE_PORT = () => {
    const DEFAULT_PORT = 3000;
    let PEER_PORT;

    if(process.env.GENERATE_PEER_PORT === 'true')
        PEER_PORT = DEFAULT_PORT + Math.ceil((Math.random() * 1000));

    const PORT = PEER_PORT || DEFAULT_PORT;
    
    return {
        DEFAULT_PORT,
        PORT,
        ROOT_NODE_ADDRESS: `http://localhost:${DEFAULT_PORT}`,
        NODE_ADDRESS: `http://localhost:${PORT}`
    } 
}

module.exports = { 
    INITIAL_DIFFICULTY, 
    MINE_RATE, 
    STARTING_BALANCE, 
    GENESIS_DATA, 
    CONFIGURE_PORT,
    REWARD_INPUT, 
    BASE_REWARD
};