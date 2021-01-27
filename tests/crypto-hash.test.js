const { cryptoHash } = require('../lib/util/crypto-hash');

describe('cryptoHash()', () => {
    it('produces same hash with input in any order', () => {
        expect(cryptoHash('one', 'two')).toEqual(cryptoHash('two', 'one'));
    });
});