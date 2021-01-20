const Wallet = require('../lib/wallet');
const Transaction = require('../lib/wallet/transaction');
const { verifySignature } = require('../lib/util');

describe('Wallet', () => {
    let wallet;
    beforeEach(() => {
        wallet = new Wallet();
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
                    signature: new Wallet().sign(data)
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
    });
});