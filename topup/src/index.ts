import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import * as stripeFactory from 'stripe';
import * as winston from 'winston';

import { TransactionDetails, TransactionAndBalance, createTransaction } from '../../transaction/src/client/index';
import { TopupAccount, TopupRequest } from './client/index';
import { promiseResponse } from '../../service/src/endpoint-then-catch';

const stripeTest = stripeFactory(process.env.STRIPE_SECRET_KEY_TEST);
const stripeProd = stripeFactory(process.env.STRIPE_SECRET_KEY_LIVE);

config.region = process.env.AWS_REGION;

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

    const queryResponse = await new DynamoDB.DocumentClient()
        .query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'userId',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        })
        .promise();

    if (queryResponse.Items.length > 1) {
        throw new Error(`Too many database entries for userId '${userId}'`);
    }

    const id = queryResponse.Items[0]['id'];

    const getResponse = await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: { id }
        })
        .promise();

    return <TopupAccount>getResponse.Item;
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
                ':stripe': topupAccount.stripe || {},
                ':accountId': topupAccount.accountId,
                ':userId': topupAccount.userId,
            },
        })
        .promise();

    return topupAccount;
};

const getOrCreate = async ({ accountId, userId }): Promise<TopupAccount> => {
    assertValidAccountId(accountId);
    assertValidUserId(userId);

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
        winston.error(`couldn't createTransaction()`, error);
        // remap error message
        throw new Error(`couldn't add transaction: ${error.message}`);
    }
};

const createStripeCharge = async ({ topupAccount, amount }: { topupAccount: TopupAccount, amount: number }) => {
    try {
        return await stripeForUser(topupAccount).charges.create({
            amount,
            currency: 'gbp',
            customer: topupAccount.stripe.customer.id,
            description: `topup for ${topupAccount.accountId}`,
            metadata: {
                accountId: topupAccount.accountId
            },
            expand: ['balance_transaction'],
        },
        {
            idempotency_key: topupAccount.stripe.nextChargeToken,
        });
    } catch (error) {
        winston.error(`couldn't create stripe charge`, error);
        if (error.message === 'Must provide source or customer.') {
            /* Note to future devs: this error appears to be a bug with stripe's API.
             *
             * We've correctly provided a customer, so the error seems odd. I
             * believe it's to do with the idempotency_key being incorrect, so
             * that's the first place to start looking. */
            throw new Error(`${error.message} (from topup: or the idempotency_key has already been used)`);
        }

        throw error;
    }
};

const topupExistingAccount = async ({ topupAccount, amount }: { topupAccount: TopupAccount, amount: number }) => {
    if (!topupAccount.stripe
    || !topupAccount.stripe.customer
    || !topupAccount.stripe.nextChargeToken)
    {
        throw new Error(`No stripe details registered for ${topupAccount.test ? 'test ' : ''}account ${topupAccount.accountId} - please provide stripeToken`);
    }

    const charge = await createStripeCharge({ topupAccount, amount });

    const transactionDetails = await appendTopupTransaction({
        amount,
        topupAccount,
        data: {
            stripeFee: String(charge.balance_transaction.fee),
            chargeId: String(charge.id),
        }
    });

    topupAccount.stripe.nextChargeToken = uuid();
    await update({ topupAccount });

    return transactionDetails;
};

const recordCustomerDetails = async ({ customer, topupAccount }): Promise<TopupAccount> => {
    if (topupAccount.stripe) {
        throw new Error(`Already have stripe details for '${topupAccount.accountId}'`);
    }

    const newAccount = {
        ...topupAccount,
        stripe: {
            customer,
            nextChargeToken: uuid(),
        }
    }

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

const attemptTopup = async ({ accountId, userId, amount, stripeToken }: TopupRequest) => {
    let topupAccount = await getOrCreate({ accountId, userId });

    if (stripeToken) {
        if (topupAccount.stripe){
            throw new Error(`Already have stripe details for '${accountId}'`);
        }

        topupAccount = await addStripeTokenToAccount({ topupAccount, stripeToken });
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

    promiseResponse<TransactionAndBalance>(
        attemptTopup({ accountId, userId, amount, stripeToken }),
        res);
});

app.use('/topup/v1', router);

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    assertConnectivity()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.listen(3000);
