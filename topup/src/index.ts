import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');

import * as stripeFactory from 'stripe';
import { post } from './post';

let stripeTest;
let stripeProd

config.region = process.env.AWS_REGION;

interface TopupAccount {
    id: string;
    accountId: string;
    stripeCustomerId: string;
    test: boolean;
};

const assertValidAccountId = (accountId) => {
    if (accountId == null || !isUUID(accountId, 4) ) {
        throw new Error(`Invalid accountId '${accountId}'`);
    }
};

const assertValidTopupAccount = (topupAccount: TopupAccount) => {
    assertValidAccountId(topupAccount.accountId);
};

const stripeObjectForTest = ({ test }) => {
    return test ? stripeTest : stripeProd;
};

const get = async ({ accountId }): Promise<TopupAccount> => {
    assertValidAccountId(accountId);

    const response = await new DynamoDB.DocumentClient()
        .scan({
            TableName: process.env.TABLE_NAME,
            IndexName: 'accountId',
            FilterExpression: 'accountId = :accountId',
            ExpressionAttributeValues: {
                ':accountId': accountId,
            },
        })
        .promise();

    switch (response.Items.length) {
      case 0:
        return undefined;
      case 1:
        return <TopupAccount>response.Items[0];
      default:
        throw new Error(`Too many database entries for ${accountId}`);
    }
};

const update = async ({ topupAccount }: { topupAccount: TopupAccount }) => {
    assertValidTopupAccount(topupAccount);

    const response = await new DynamoDB.DocumentClient()
        .update({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: topupAccount.id
            },
            UpdateExpression:
                `set stripeCustomerId = :stripeCustomerId, accountId = :accountId, test = :test`,
            ExpressionAttributeValues: {
                ':stripeCustomerId': topupAccount.stripeCustomerId,
                ':accountId': topupAccount.accountId,
                ':test': topupAccount.test,
            },
        })
        .promise();

    return topupAccount;
};

const getOrCreate = async ({ accountId, test }): Promise<TopupAccount> => {
    const topupAccount: TopupAccount = await get({ accountId });

    if (topupAccount) {
        if (topupAccount.test !== test) {
            const expectedString = (test ? 'test' : 'prod');
            const accountString = (topupAccount.test ? 'test' : 'prod');

            throw new Error(`Expected ${expectedString} account, found ${accountString} account`);
        }

        return topupAccount;
    }

    return update({
        topupAccount: {
            id: uuid(),
            accountId,
            stripeCustomerId: '',
            test
        }
    });
};

const appendTopupTransaction = ({ topupAccount, amount, data }) => {
    if (!process.env.TRANSACTION_URL) {
        throw new Error(`no $TRANSACTION_URL in environment`);
    }

    return post(
        `${process.env.TRANSACTION_URL}/${topupAccount.accountId}`,
        {
            type: 'topup',
            amount: `${amount}`,
            data: {
                ...data,
                topupAccountId: topupAccount.id,
                topupCustomerId: topupAccount.stripeCustomerId,
            }
        })
        .catch((error) => {
            // remap error message
            throw new Error(`couldn't add transaction: ${JSON.stringify(error)}`);
        });
};

const topupExistingAccount = ({ topupAccount, amount, test }) => {
    if (topupAccount.stripeCustomerId === '') {
        throw new Error(`No card registered for ${test ? 'test ' : ''} account ${topupAccount.accountId}`);
    }

    return stripeObjectForTest({ test }).charges.create({
        amount,
        currency: 'gbp',
        customer: topupAccount.stripeCustomerId,
        description: `topup for ${topupAccount.accountId}`,
        metadata: {
            topupId: topupAccount.id,
            accountId: topupAccount.accountId
        },
        expand: ['balance_transaction']
    })
    .then(async (charge) => {
        await appendTopupTransaction({
            amount,
            topupAccount,
            data: {
                stripeFee: charge.balance_transaction.net
            }
        });
        return topupAccount;
    });
};

const recordCustomerId = ({ customer, topupAccount }): Promise<TopupAccount> => {
    return update({
        topupAccount: {
            ...topupAccount,
            stripeCustomerId: customer.id
        }
    });
};

const addStripeTokenToAccount = async ({ topupAccount, stripeToken, test }): Promise<TopupAccount> => {
    return stripeObjectForTest({ test }).customers.create({
        source: stripeToken,
        description: `topup for ${topupAccount.accountId}`,
        metadata: {
            topupId: topupAccount.id,
            accountId: topupAccount.accountId
        }
    }).then((customer) =>
        recordCustomerId({ customer, topupAccount })
    );
};

const app = express();

app.use(bodyParser.json());

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.post('/topup', (req, res) => {
    const { accountId, amount, stripeToken, test } = req.body;

    const attemptTopup = async () => {
        const topupAccount = await getOrCreate({ accountId, test });

        if (stripeToken) {
            await addStripeTokenToAccount({ topupAccount, stripeToken, test });
        }

        return topupExistingAccount({ topupAccount, amount, test })
    };

    attemptTopup()
        .then((topupAccount: TopupAccount) => {
            res.json({ response: { topupAccount } });
        })
        .catch((error) => {
            res.json({ error: error.message });
        });
});

stripeTest = stripeFactory(process.env.STRIPE_SECRET_KEY_TEST);
stripeProd = stripeFactory(process.env.STRIPE_SECRET_KEY_PROD);

app.listen(3000);
