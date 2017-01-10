import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');

import * as stripeFactory from 'stripe';
import { post } from './post';

let stripe;

config.region = process.env.AWS_REGION;

interface TopupAccount {
    id: string;
    accountId: string;
    stripeCustomerId: string;
};

const assertValidAccountId = (accountId) => {
    if (accountId == null || !isUUID(accountId, 4) ) {
        throw new Error(`Invalid accountId ${accountId}`);
    }
};

const assertValidTopupAccount = (topupAccount: TopupAccount) => {
    assertValidAccountId(topupAccount.accountId);
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
                `set stripeCustomerId = :stripeCustomerId, accountId = :accountId`,
            ExpressionAttributeValues: {
                ':stripeCustomerId': topupAccount.stripeCustomerId,
                ':accountId': topupAccount.accountId,
            },
        })
        .promise();

    return topupAccount;
};

const getOrCreate = async ({ accountId }): Promise<TopupAccount> => {
    const topupAccount: TopupAccount = await get({ accountId });

    if (topupAccount) {
        return topupAccount;
    }

    return update({
        topupAccount: {
            id: uuid(),
            accountId,
            stripeCustomerId: '',
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

const topupExistingAccount = ({ topupAccount, amount }) => {
    if (topupAccount.stripeCustomerId === '') {
        throw new Error(`No card registered for account ${topupAccount.accountId}`);
    }

    return stripe.charges.create({
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

const addStripeTokenToAccount = async ({ topupAccount, stripeToken }): Promise<TopupAccount> => {
    return stripe.customers.create({
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

app.use(bodyParser.urlencoded({ extended: true }));

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.post('/topup', (req, res) => {
    const { accountId, amount, stripeToken } = req.body;

    const attemptTopup = async () => {
        const topupAccount = await getOrCreate({ accountId });

        if (stripeToken) {
            await addStripeTokenToAccount({ topupAccount, stripeToken });
        }

        return topupExistingAccount({ topupAccount, amount })
    };

    attemptTopup()
        .then((topupAccount: TopupAccount) => {
            res.json({ response: { topupAccount } });
        })
        .catch((error) => {
            res.json({ error: error.message });
        });
});

stripe = stripeFactory(process.env.STRIPE_SECRET_KEY);

app.listen(3000);
