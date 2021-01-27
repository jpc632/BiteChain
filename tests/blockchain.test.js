const Blockchain = require('../lib/blockchain');
const Block = require('../lib/blockchain/block');
const { INITIAL_DIFFICULTY } = require('../lib/config');
const Wallet = require('../lib/wallet');
const Transaction = require('../lib/wallet/transaction');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain  = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBeTruthy();
    });

    it('starts with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo-bar';
        blockchain.addBlock({ data : newData });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data : 'fake-data' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBeFalsy();
            });
        });

        describe('when the chain does start with the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({ data : 'real' });
            });

            describe('and `previousHash` reference has changed', () => {
                it('returns false', () => {
                    blockchain.getLatestBlock().previousHash = 'tampered';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBeFalsy();
                });
            });
            
            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.getLatestBlock().data = 'bad-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBeFalsy();
                });
            });

            describe('and the chain does not contain an invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBeTruthy();
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let logMock;

        beforeEach(() => {
            logMock = jest.fn();

            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain[0] = { new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            // it('logs an error', () => {
            //     expect(errorMock).toHaveBeenCalled(); 
            // });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data : 'real' });
            });

            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.addBlock({ data : 'real' });
                    newChain.getLatestBlock().hash = 'fake-hash';
                    blockchain.replaceChain(newChain.chain);
                 });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled(); 
                });
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });
                
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
            });
        });

        describe('and the `validateTransactions` flag is true', () => {
            it('calls validTransactionData()', () => {
                const validTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validTransactionDataMock;
                newChain.addBlock({ data: 'foo' });
                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        })
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet('secret');
            transaction = wallet.createTransaction({ amount: 20, recipient: 'foo-address' });
            rewardTransaction = Transaction.rewardTransaction({ 
                minerWallet: wallet, 
                difficulty: INITIAL_DIFFICULTY, 
                blockSize: 2 
            });
        }); 

        describe('and the transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeTruthy();
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false', () => {
                newChain.addBlock({ data: [rewardTransaction, rewardTransaction ] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has a malformed `outputMap`', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false', () => {
                    transaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction is a reward transaction', () => {
                it('returns false', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the transaction data has a malformed `input`', () => {
            it('returns false', () => {
                wallet.balance = 10000;
                const evilOutputMap = {
                    [wallet.publicKey]: 9900,
                    dummyRecipient: 100
                };

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                }
                newChain.addBlock({ data: [evilTransaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the block contains identical transactions', () => {
            it('returns false', () => {
                rewardTransaction = Transaction.rewardTransaction({ 
                    minerWallet: wallet, 
                    difficulty: newChain.getLatestBlock().difficulty, 
                    blockSize: 3
                });
                newChain.addBlock({ data: [transaction, transaction, rewardTransaction] });
                
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});