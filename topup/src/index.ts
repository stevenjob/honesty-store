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
    stripeCustomerIds: string[];
};

const assertEnvironment = (names: string[]) => {
    for (const name of names) {
        if (!process.env[name]) {
            console.error(`$${name} not present in environment`);
            process.exit(1);
        }
    }
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
                `set stripeCustomerIds = :stripeCustomerIds, accountId = :accountId`,
            ExpressionAttributeValues: {
                ':stripeCustomerIds': topupAccount.stripeCustomerIds,
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
            stripeCustomerIds: []
        }
    });
};

const appendTopupTransaction = ({ topupAccount, amount, customerId, data }) =>
    post(
        `${process.env.TRANSACTION_URL}/${topupAccount.accountId}`,
        {
            type: 'topup',
            amount: `${amount}`,
            data: {
                ...data,
                topupAccountId: topupAccount.id,
                topupCustomerId: customerId,
            }
        })
        .catch((error) => {
            // remap error message
            throw new Error(`couldn't add transaction: ${JSON.stringify(error)}`);
        });

const topupExistingAccount = ({ topupAccount, amount }) => {
    if (topupAccount.stripeCustomerIds.length === 0) {
        throw new Error(`No cards registered for account ${topupAccount.accountId}`);
    }

    // use the latest card
    const stripeIds = topupAccount.stripeCustomerIds;
    const customerId = stripeIds[stripeIds.length - 1];

    return stripe.charges.create({
        amount,
        currency: 'gbp',
        customer: customerId,
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
            customerId,
            data: {
                stripeFee: charge.balance_transaction.net
            }
        });
        return topupAccount;
    });
};

const recordCustomerId = ({ customer, topupAccount }): Promise<TopupAccount> => {
    topupAccount.stripeCustomerIds.push(customer.id);
    return update({ topupAccount });
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

assertEnvironment([
    'AWS_REGION',
    'TABLE_NAME',
    'TABLE_NAME',
    'TRANSACTION_URL',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
]);

stripe = stripeFactory(process.env.STRIPE_SECRET_KEY);

app.listen(3000);
