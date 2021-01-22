const { MINE_RATE, BASE_REWARD } = require('../config');

const calcMinerReward = ({ difficulty, blockSize }) => {
    const rewardAmount = BASE_REWARD + (difficulty * (blockSize + 1)) / (MINE_RATE * 0.001);
    return Math.floor(rewardAmount);
}

module.exports = { calcMinerReward };