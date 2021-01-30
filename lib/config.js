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

module.exports = { 
    INITIAL_DIFFICULTY, 
    MINE_RATE, 
    STARTING_BALANCE, 
    GENESIS_DATA, 
    REWARD_INPUT, 
    BASE_REWARD
};