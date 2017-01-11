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
    stripe: {
        customerId: string;
        card: {
            exp_month: number;
            exp_year: number;
            last4: string;
        }
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
                `set stripe = :stripe, accountId = :accountId, test = :test`,
            ExpressionAttributeValues: {
                ':stripe': topupAccount.stripe,
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
            test,
            stripe: {
                customerId: '',
                card: {
                    exp_month: 0,
                    exp_year: 0,
                    last4: '',
                }
            },
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
                    topupCustomerId: topupAccount.stripe.customerId,
                }
            });
    } catch (error) {
        // remap error message
        throw new Error(`couldn't add transaction: ${JSON.stringify(error)}`);
    }
};

const topupExistingAccount = async ({ topupAccount, amount, test }: { topupAccount: TopupAccount, amount: number, test: boolean }) => {
    if (topupAccount.stripe.customerId === '') {
        throw new Error(`No card registered for ${test ? 'test ' : ''} account ${topupAccount.accountId}`);
    }

    const charge = await stripeObjectForTest({ test }).charges.create({
        amount,
        currency: 'gbp',
        customer: topupAccount.stripe.customerId,
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

const findcard = (paymentSources) => {
    for (const source of paymentSources) {
        if (source.object === 'card') {
            const { exp_month, exp_year, last4 } = source;
            return { exp_month, exp_year, last4 };
        }
    }
};

const recordCustomerDetails = async ({ customer, topupAccount }): Promise<TopupAccount> => {
    const card = findcard(customer.sources.data);

    if (!card) {
        // may have been a bitcoin payment - disallowed for now
        throw new Error(`Can't find card details for registration`);
    }

    return update({
        topupAccount: {
            ...topupAccount,
            stripe: {
                customerId: customer.id,
                card
            },
        }
    });
};

const addStripeTokenToAccount = async ({ topupAccount, stripeToken, test }): Promise<TopupAccount> => {
    const customer = await stripeObjectForTest({ test })
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

const attemptTopup = async ({ accountId, amount, stripeToken, test }) => {
    const topupAccount = await getOrCreate({ accountId, test });

    if (stripeToken) {
        await addStripeTokenToAccount({ topupAccount, stripeToken, test });
    }

    return topupExistingAccount({ topupAccount, amount, test })
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
    const { accountId, amount, stripeToken, test } = req.body;

    attemptTopup({ accountId, amount, stripeToken, test })
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
      "stripe": {
        "customerId": "cus_9uXz4SUGk6lBKT",
        "card": {
          "last4": "4242",
          "exp_month": 12,
          "exp_year": 2018
        }
      },
      "test": true
    }
  }
}
*/

stripeTest = stripeFactory(process.env.STRIPE_SECRET_KEY_TEST);
stripeProd = stripeFactory(process.env.STRIPE_SECRET_KEY_PROD);

app.listen(3000);
