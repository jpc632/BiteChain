const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    return crypto.createHash('sha256')
        .update(inputs.map(input => JSON.stringify(input)).sort().join(' '))
        .digest('hex');
};

module.exports = { cryptoHash };