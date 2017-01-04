import { DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isInt = require('validator/lib/isInt');

interface Transaction {
    id: string;
    type: 'topup' | 'purchase';
    amount: number;
    data: {
        [key: string]: string;
    }
}

interface Account {
    id: string;
    balance: number;
    transactions: Transaction[];
}

const assertValidAccountId = (accountId) => {
    if (accountId == null || !isUUID(accountId, 4) ) {
        throw new Error(`Invalid accountId ${accountId}`);
    }
};

const assertValidTransaction = ({type, amount, data}: Transaction) => {
    if (type == null || (type !== 'topup' && type !== 'purchase')) {
        throw new Error(`Invalid transaction type ${type}`);
    }
    if (amount == null || !isInt(String(amount))) {
        throw new Error(`Invalid transaction type ${type}`);
    }
    if (data == null || typeof data !== 'object') {
        throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
    }
    for (const key of Object.keys(data)) {
        if (typeof data[key] !== 'string') {
            throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
        }
    }
};

const get = async ({ accountId }): Promise<Account> => {
    assertValidAccountId(accountId);

    const response = await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: accountId
            }
        })
        .promise();

    return <Account>response.Item;
};

const createAccount = async ({ accountId }) => {
    assertValidAccountId(accountId);

    const account: Account = {
        id: accountId,
        balance: 0,
        transactions: []
    };

    const response = await new DynamoDB.DocumentClient()
        .put({
            TableName: process.env.TABLE_NAME,
            Item: account
        })
        .promise();

    return account;
};

const createTransaction = async ({ accountId, type, amount, data }) => {
    assertValidAccountId(accountId);

    const originalAccount = await get({ accountId });

    if (originalAccount == null) {
        throw new Error(`Account not found ${accountId}`);
    }

    const transaction: Transaction = {
        id: uuid(),
        type,
        amount,
        data
    };

    assertValidTransaction(transaction);

    const updatedAccount: Account = {
        ...originalAccount,
        balance: originalAccount.balance + transaction.amount,
        transactions: [transaction, ...originalAccount.transactions]
    };

    if (updatedAccount.balance < 0) {
        throw new Error(`Balance would be negative ${updatedAccount.balance}`);
    }

    const response = await new DynamoDB.DocumentClient()
        .update({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: accountId
            },
            ConditionExpression: 'balance=:originalBalance',
            UpdateExpression: "set balance=:updatedBalance, transactions=:transactions",
            ExpressionAttributeValues: {
                ':originalBalance': originalAccount.balance,
                ':updatedBalance': updatedAccount.balance,
                ':transactions': updatedAccount.transactions
            }
        })
        .promise();

    return updatedAccount;
};

const app = express();

app.use(bodyParser.json());

const router = express.Router();

router.get('/:accountId', (req, res) => {
    const { accountId } = req.params;
    get({ accountId })
        .then((account) => {
            res.json({ account });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.post('/:accountId', (req, res) => {
    const { accountId } = req.params;
    const { type, amount, data } = req.body;
    createTransaction({ accountId, type, amount, data })
        .then((account) => {
            res.json({ account });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.post('/', (req, res) => {
    const { accountId } = req.body;
    createAccount({ accountId })
        .then((account) => {
            res.json({ account });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

app.use('/transaction/v1', router);

app.listen(3000);
