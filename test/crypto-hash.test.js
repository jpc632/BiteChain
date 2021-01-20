const cryptoHash = require('../lib/util/crypto-hash');

describe('cryptoHash()', () => {
    it('generates SHA256 hashed output', () => {
        expect(cryptoHash('test'))
            .toEqual('4d967a30111bf29f0eba01c448b375c1629b2fed01cdfcc3aed91f1b57d5dd5e');
    });

    it('produces same hash with input in any order', () => {
        expect(cryptoHash('one', 'two')).toEqual(cryptoHash('two', 'one'));
    });
});