const Block = require('./block');
const { MINE_RATE, GENESIS_DATA } = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const data = 'foo-data';
    const timestamp = 2000;
    const hash = 'foo-hash ';
    const previousHash = 'prev-foo-hash';
    const nonce = 0;
    const difficulty = 1;
    const block = new Block({ data, timestamp, hash, previousHash, nonce, difficulty });

    it('has object properties', () => {
        expect(block.data).toEqual(data);
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.previousHash).toEqual(previousHash);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
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
            expect(minedBlock.hash)
            .toEqual(
                cryptoHash(
                    data,
                    minedBlock.timestamp,
                    previousBlock.hash,
                    minedBlock.nonce,
                    minedBlock.difficulty
                )
            );
        });

        it('sets a `hash` that matches the difficulty criteria', () => {
            expect(minedBlock.hash.substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        describe('adjustDifficulty()', () => {
            it('raises the defficulty for a quickly mined block', () => {
                expect(Block.adjustDifficulty({
                    originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
                })).toEqual(block.difficulty + 1);
            });

            it('lowers the defficulty for a slowly mined block', () => {
                expect(Block.adjustDifficulty({
                    originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
                })).toEqual(block.difficulty - 1);
            });

            it('adjusts the `difficulty`', () => {
                const possibleResults = [previousBlock.difficulty + 1, previousBlock.difficulty - 1];
                
                expect(possibleResults.includes(minedBlock.difficulty)).toBeTruthy();
            });

            it('has a lower limit of 1', () => {
                block.difficulty = -1;

                expect(Block.adjustDifficulty( { originalBlock: block })).toEqual(1);
            });
        });
    });
});