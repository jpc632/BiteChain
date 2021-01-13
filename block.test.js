const Block = require('./block');
const { GENESIS_DATA } = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const data = 'foo-data';
    const timestamp = '01/01/2021';
    const hash = 'foo-hash ';
    const previousHash = 'prev-foo-hash';
    const block = new Block({ data, timestamp, hash, previousHash });

    it('has object properties', () => {
        expect(block.data).toEqual(data);
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.previousHash).toEqual(previousHash);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns the initial block of the chain', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const previousBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({ previousBlock, data });

        it('returns a block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `previousHash` to be the `hash` of the previous block', () => {
            expect(minedBlock.previousHash).toEqual(previousBlock.hash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets the `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });
        
        it('creates a SHA256 `hash` based on the input', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(data, minedBlock.timestamp, previousBlock.hash));
        });
    });
});