import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');

import * as stripeFactory from 'stripe';
import fetch from 'node-fetch';

let stripeTest;
let stripeProd

config.region = process.env.AWS_REGION;

interface TopupAccount {
    id: string;
    accountId: string;
    test: boolean;

    stripe?: {
        customer: any;
    };
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
        .query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'accountId',
            KeyConditionExpression: 'accountId = :accountId',
            ExpressionAttributeValues: {
                ':accountId': accountId,
            },
        })
        .promise();

        if (response.Items.length > 1) {
            throw new Error(`Too many database entries for '${accountId}'`);
        }
        return <TopupAccount>response.Items[0];
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
                `set stripe = :stripe, accountId = :accountId`,
            ExpressionAttributeValues: {
                ':stripe': topupAccount.stripe,
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
            test: false,
        }
    });
};

const appendTopupTransaction = async ({ topupAccount, amount, data }: { topupAccount: TopupAccount, amount: number, data: any }) => {
    if (!process.env.TRANSACTION_URL) {
        throw new Error(`no $TRANSACTION_URL in environment`);
    }

    try {
        return await fetch(
            `${process.env.TRANSACTION_URL}/${topupAccount.accountId}`,
            {
                type: 'topup',
                amount,
                data: {
                    ...data,
                    topupAccountId: topupAccount.id,
                    topupCustomerId: topupAccount.stripe.customer.id,
                }
            });
    } catch (error) {
        // remap error message
        throw new Error(`couldn't add transaction: ${JSON.stringify(error)}`);
    }
};

const topupExistingAccount = async ({ topupAccount, amount }: { topupAccount: TopupAccount, amount: number }) => {
    if (!topupAccount.stripe
    || !topupAccount.stripe.customer)
    {
        throw new Error(`No stripe details registered for ${topupAccount.test ? 'test ' : ''} account ${topupAccount.accountId}`);
    }

    const charge = await stripeObjectForTest(topupAccount).charges.create({
        amount,
        currency: 'gbp',
        customer: topupAccount.stripe.customer.id,
        description: `topup for ${topupAccount.accountId}`,
        metadata: {
            accountId: topupAccount.accountId
        },
        expand: ['balance_transaction']
    });

    await appendTopupTransaction({
        amount,
        topupAccount,
        data: {
            stripeFee: String(charge.balance_transaction.fee),
        }
    });

    return topupAccount;
};

const recordCustomerDetails = async ({ customer, topupAccount }): Promise<TopupAccount> => {
    return update({
        topupAccount: {
            ...topupAccount,
            stripe: {
                customer
            }
        }
    });
};

const addStripeTokenToAccount = async ({ topupAccount, stripeToken }): Promise<TopupAccount> => {
    const customer = await stripeObjectForTest(topupAccount.test)
        .customers
        .create({
            source: stripeToken,
            description: `registration for ${topupAccount.accountId}`,
            metadata: {
                accountId: topupAccount.accountId
            }
        });

    return await recordCustomerDetails({ customer, topupAccount });
};

const attemptTopup = async ({ accountId, amount, stripeToken }) => {
    const topupAccount = await getOrCreate({ accountId });

    if (stripeToken) {
        if (topupAccount.stripe){
            throw new Error(`Already have stripe details for '${accountId}'`);
        }

        await addStripeTokenToAccount({ topupAccount, stripeToken });
    }

    return topupExistingAccount({ topupAccount, amount })
};

const assertDynamoConnectivity = async () => {
    await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: 'non-existent-id'
            },
        })
        .promise();
};

const assertStripeConnectivity = async ({ test }) => {
    await stripeObjectForTest({ test })
        .balance
        .retrieve()
};

const assertConnectivity = async () => {
    await assertDynamoConnectivity();
    await assertStripeConnectivity({ test: false });
    await assertStripeConnectivity({ test: true });
};

const app = express();

app.use(bodyParser.json());

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    assertConnectivity()
        .then(() => res.status(200).json({ response: "connectivity okay" }))
        .catch((error) => res.status(500).json({ error }));
});

app.post('/topup', (req, res) => {
    const { accountId, amount, stripeToken } = req.body;

    attemptTopup({ accountId, amount, stripeToken })
        .then((topupAccount: TopupAccount) => {
            res.json({ response: { topupAccount } });
        })
        .catch((error) => {
            res.json({ error: error.message });
        });
});
/* "/topup" returns the following response:
{
  "response": {
    "topupAccount": {
      "accountId": "45cf84b2-229a-4210-a78b-c53ce280131e",
      "id": "011c5f29-9a38-48bf-b380-94eff3f9a68a",
      "test": true
      "stripe": { "customer": { ... } }
    }
  }
}
*/

stripeTest = stripeFactory(process.env.STRIPE_SECRET_KEY_TEST);
stripeProd = stripeFactory(process.env.STRIPE_SECRET_KEY_PROD);

app.listen(3000);
