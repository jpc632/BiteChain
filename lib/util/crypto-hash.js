const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    return crypto.createHash('sha256')
            .update(inputs.sort().join(' '))
            .digest('hex');
};

module.exports = cryptoHash;