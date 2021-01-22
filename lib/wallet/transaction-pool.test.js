const Blockchain = require('../blockchain');
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./');

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: 'dummy-recipient',
            amount: 20
        });
    });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction)
            
            expect(transactionPool.transactionMap[transaction.id])
                .toBe(transaction);
        })
    });

    describe('existingTransaction()', () => {
        it('returns whether a transaction address exists based on senders address', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })).toBe(transaction);
        });
    });

    describe('validTransactions()', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;

            for(let i = 0; i < 10; i++){
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'dummy-recipient',
                    amount: 30
                });

                if(i % 3 == 0)
                    transaction.input.amount = 9999;
                else if(i % 3 == 1)
                    transaction.input.signature = new Wallet().sign('foo');
                else
                    validTransactions.push(transaction);

                transactionPool.setTransaction(transaction);
            }
        });

        it('returns valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

        it('logs errors for invalid transactions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('clearAllTransactions()', () => {
        it('clears the transaction pool', () => {
            transactionPool.setTransaction(transaction);
            transactionPool.clearAllTransactions();

            expect(transactionPool.transactionMap).toEqual({});
        })
    });

    describe('clearRecordedTransactions()', () => {
        it('clears the transaction pool of existing blockchain transactions', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i = 0; i < 6; i++){
                const transaction = new Wallet().createTransaction({
                    recipient: 'foo',
                    amount: 20
                });
                transactionPool.setTransaction(transaction);

                if(i % 2 == 0)
                    blockchain.addBlock({ data: [transaction] });
                else
                    expectedTransactionMap[transaction.id] = transaction;
            }
            transactionPool.clearRecordedTransactions({ chain: blockchain.chain });

            expect(expectedTransactionMap).toEqual(transactionPool.transactionMap);
        });
    });
});