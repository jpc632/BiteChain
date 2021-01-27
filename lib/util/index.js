const EDDSA = require('elliptic').eddsa;
const { cryptoHash } = require('./crypto-hash');

const ec = new EDDSA('ed25519');

const verifySignature = ({ publicKey, data, signature }) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
}

module.exports = { ec, verifySignature, cryptoHash };