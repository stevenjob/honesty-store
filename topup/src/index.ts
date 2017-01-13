import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');

import * as stripeFactory from 'stripe';
import { TransactionDetails, TransactionAndBalance, createTransaction } from '../../transaction/src/client/index';

const stripeTest = stripeFactory(process.env.STRIPE_SECRET_KEY_TEST);
const stripeProd = stripeFactory(process.env.STRIPE_SECRET_KEY_LIVE);

config.region = process.env.AWS_REGION;

interface TopupAccount {
    id: string;
    accountId: string;
    userId: string;
    test: boolean;

    stripe?: {
        customer: any;
        nextChargeToken: string;
    };
};

const createAssertValidUuid = (name) =>
    (uuid) => {
        if (uuid == null || !isUUID(uuid, 4)) {
            throw new Error(`Invalid ${name} ${uuid}`);
        }
    };


const assertValidAccountId = createAssertValidUuid('accountId');
const assertValidUserId = createAssertValidUuid('userId');

const assertValidTopupAccount = (topupAccount: TopupAccount) => {
    assertValidAccountId(topupAccount.accountId);
};

const stripeForUser = ({ test }) => {
    return test ? stripeTest : stripeProd;
};

const get = async ({ userId }): Promise<TopupAccount> => {
    assertValidUserId(userId);

    const response = await new DynamoDB.DocumentClient()
        .query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'userId',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        })
        .promise();

        if (response.Items.length > 1) {
            throw new Error(`Too many database entries for userId '${userId}'`);
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
                `set stripe = :stripe, accountId = :accountId, userId = :userId`,
            ExpressionAttributeValues: {
                ':stripe': topupAccount.stripe,
                ':accountId': topupAccount.accountId,
                ':userId': topupAccount.userId,
            },
        })
        .promise();

    return topupAccount;
};

const getOrCreate = async ({ accountId, userId }): Promise<TopupAccount> => {
    assertValidAccountId(accountId);
    assertValidAccountId(userId);

    const topupAccount: TopupAccount = await get({ userId });

    if (topupAccount) {
        return topupAccount;
    }

    return update({
        topupAccount: {
            id: uuid(),
            userId,
            accountId,
            test: false,
        }
    });
};

const appendTopupTransaction = async ({ topupAccount, amount, data }: { topupAccount: TopupAccount, amount: number, data: any }) => {
    const transactionDetails: TransactionDetails = {
        type: 'topup',
        amount,
        data: {
            ...data,
            topupAccountId: topupAccount.id,
            topupCustomerId: topupAccount.stripe.customer.id,
        }
    };

    try {
        return await createTransaction(topupAccount.accountId, transactionDetails);
    } catch (error) {
        // remap error message
        throw new Error(`couldn't add transaction: ${JSON.stringify(error)}`);
    }
};

const topupExistingAccount = async ({ topupAccount, amount }: { topupAccount: TopupAccount, amount: number }) => {
    if (!topupAccount.stripe
    || !topupAccount.stripe.customer
    || !topupAccount.stripe.nextChargeToken)
    {
        throw new Error(`No stripe details registered for ${topupAccount.test ? 'test ' : ''} account ${topupAccount.accountId}`);
    }

    const charge = await stripeForUser(topupAccount).charges.create({
        amount,
        currency: 'gbp',
        customer: topupAccount.stripe.customer.id,
        description: `topup for ${topupAccount.accountId}`,
        metadata: {
            accountId: topupAccount.accountId
        },
        idempotency_key: topupAccount.stripe.nextChargeToken,
        expand: ['balance_transaction']
    });

    const transactionDetails = await appendTopupTransaction({
        amount,
        topupAccount,
        data: {
            stripeFee: String(charge.balance_transaction.fee),
            chargeId: String(charge.id),
        }
    });

    topupAccount.stripe.nextChargeToken = uuid();

    return transactionDetails;
};

const recordCustomerDetails = async ({ customer, topupAccount }): Promise<TopupAccount> => {
    const newAccount = { ...topupAccount };

    newAccount.stripe.customer = customer;

    return update({ topupAccount: newAccount });
};

const addStripeTokenToAccount = async ({ topupAccount, stripeToken }): Promise<TopupAccount> => {
    const customer = await stripeForUser(topupAccount)
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

const attemptTopup = async ({ accountId, userId, amount, stripeToken }) => {
    const topupAccount = await getOrCreate({ accountId, userId });

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
    await stripeForUser({ test })
        .balance
        .retrieve()
};

const assertConnectivity = async () => {
    await assertDynamoConnectivity();
    await assertStripeConnectivity({ test: false });
    await assertStripeConnectivity({ test: true });
};

const router = express.Router();
const app = express();

app.use(bodyParser.json());

router.post('/topup', (req, res) => {
    const { accountId, userId, amount, stripeToken } = req.body;

    attemptTopup({ accountId, userId, amount, stripeToken })
        .then((transactionAndBalance: TransactionAndBalance) => {
            res.json({ response: transactionAndBalance });
        })
        .catch((error) => {
            res.json({ error: error.message });
        });
});

app.use('/topup/v1', router);

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    assertConnectivity()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.listen(3000);
