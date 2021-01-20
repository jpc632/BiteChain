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
    })
});