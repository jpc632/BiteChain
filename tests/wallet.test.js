const Wallet = require('../lib/wallet');
const Transaction = require('../lib/wallet/transaction');
const { verifySignature } = require('../lib/util');
const Blockchain = require('../lib/blockchain');
const { STARTING_BALANCE } = require('../lib/config');

describe('Wallet', () => {
    let wallet;
    beforeEach(() => {
        wallet = new Wallet('secret');
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'dummy';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBeTruthy();
        });

        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet("other").sign(data)
                })
            ).toBeFalsy();
        });
    });

    describe('createTransaction()', () => {
        describe('and the `amount` exceeds the `balance`', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'dummy-recipient'}))
                    .toThrow('Amount exceeds balance!');
            });
        });

        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'dummy-recipient';
                transaction = wallet.createTransaction({ amount, recipient });
            });
            
            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBeTruthy();
            });

            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        describe('where a chain is passsed', () => {
            it('calls Wallet.calculateBalance()', () => {
                const calculateBalanceMock = jest.fn();
                const originalCalculateBalance = Wallet.calculateBalance;
                Wallet.calculateBalance = calculateBalanceMock;
                
                wallet.createTransaction({ 
                    recipient: 'foo', 
                    amount: 50,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs for the wallet', () => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({ 
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    }
                )).toEqual(STARTING_BALANCE)
            });
        });

        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet("other").createTransaction({
                    recipient: wallet.publicKey,
                    amount: 10
                });
                transactionTwo = new Wallet("foo").createTransaction({
                    recipient: wallet.publicKey,
                    amount: 20
                });

                blockchain.addBlock({ data: [transactionOne, transactionTwo ]});
            });

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    }
                )).toEqual(
                    STARTING_BALANCE + 
                    transactionOne.outputMap[wallet.publicKey] + 
                    transactionTwo.outputMap[wallet.publicKey]
                );
            });

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'foo',
                        amount: 20
                    });

                    blockchain.addBlock({ data: [recentTransaction] });
                });

                it('returns the output amount of the recent transaction', () => {
                    expect(Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-foo',
                            amount: 80
                        });

                        sameBlockTransaction = Transaction.rewardTransaction({ 
                            minerWallet: wallet,
                            difficulty: 4,
                            blockSize: 1
                        });
                        
                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction]});
                        nextBlockTransaction = new Wallet('foofoo').createTransaction({
                            recipient: wallet.publicKey, 
                            amount: 75
                        });
                        blockchain.addBlock({ data: [nextBlockTransaction] });
                    });

                    it('includes the output amount in the returned balance', () => {
                        expect(
                            Wallet.calculateBalance({
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })
                        ).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] +
                            sameBlockTransaction.outputMap[wallet.publicKey] + 
                            nextBlockTransaction.outputMap[wallet.publicKey]
                        );
                    });
                });
            });
        });
    });
});