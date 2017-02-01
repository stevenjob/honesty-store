// tslint:disable no-console
import fetch from 'node-fetch';
import Stripe = require('stripe');

if (process.argv.length !== 3) {
    console.error(`Usage: ${process.argv[1]} url-to-test`);
    process.exit(2);
}

const baseUrl = process.argv[2];
const version = 1;
const emailAddress = `${process.env.USER}@scottlogic.co.uk`;
const item1 = '46ced0c0-8815-4ed2-bfb6-40537f5bd512';
const item2 = 'faeda516-bd9f-41ec-b949-7a676312b0ae';
const card = {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2019,
    cvc: '123'
};
const storeCode = 'sl-ncl';

const globals = {
    refreshToken: '',
    accessToken: '',
    accountId: '',
    userId: ''
};

const fetch2 = async (service, path, headers = undefined, body = undefined, method = 'POST') => {
    const url = `${baseUrl}/${service}/v${version}${path}`;
    console.log(`${method} ${url} ${JSON.stringify(body)}`);

    const response: any = await fetch(url, {
        method,
        headers: {
            ...headers,
            'content-type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    }).then(r => r.json());

    if (response.error) {
        throw new Error(response.error.message);
    }

    return response.response;
};

const register = async () => {
    const { accessToken, refreshToken } = await fetch2(
        'api',
        '/register',
        undefined,
        { storeCode });

    globals.refreshToken = refreshToken;
    globals.accessToken = accessToken;
};

const generateStripeToken = async () => {
    const key = process.env.STRIPE_SECRET_KEY_TEST;

    if (!key) {
        console.error('need $STRIPE_SECRET_KEY_TEST');
        process.exit(1);
    }

    const stripe = Stripe(key);
    const token = await stripe.tokens.create({ card });

    return token.id;
};

const topupAndPurchase = async () => {
    const { user } = await fetch2(
        'api',
        '/register2',
        {
            authorization: `Bearer: ${globals.accessToken}`
        },
        {
            emailAddress,
            itemID: item1,
            stripeToken: await generateStripeToken(),
            topUpAmount: 500
        });

    const { accountId, id: userId } = user;
    globals.accountId = accountId;
    globals.userId = userId;
};

const getSession = async () => {
    await fetch2(
        'api',
        '/session',
        {
            authorization: `Bearer: ${globals.refreshToken}`
        });
};

const topup = async () => {
    await fetch2(
        'api',
        '/topup',
        {
            authorization: `Bearer: ${globals.accessToken}`
        },
        {
            amount: 500
        });
};

const purchaseMultiple = async () => {
    await fetch2(
        'api',
        '/purchase',
        {
            authorization: `Bearer: ${globals.accessToken}`
        },
        {
            itemID: item2,
            quantity: 3
        });
};

const test = async () => {
    await register();
    await topupAndPurchase();
    await getSession();
    await topup();
    await purchaseMultiple();
};

test()
    .then(() => console.log('tests passed'))
    .catch((e) => { console.error(e); process.exit(1); });
