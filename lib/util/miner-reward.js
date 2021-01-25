const { MINE_RATE, BASE_REWARD, INITIAL_DIFFICULTY } = require('../config');

const calculateMinerReward = ({ difficulty = INITIAL_DIFFICULTY , blockSize = 0 }) => {
    const rewardAmount = BASE_REWARD + (difficulty * (blockSize + 1)) / (MINE_RATE * 0.001);
    return Math.floor(rewardAmount);
}

module.exports = { calculateMinerReward };