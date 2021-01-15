const INITIAL_DIFFICULTY = 2;
const MINE_RATE = 1000;

const GENESIS_DATA = {
    data : [],
    timestamp : 1,
    previousHash: null,
    hash: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9',
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY
};

module.exports = { MINE_RATE, GENESIS_DATA };