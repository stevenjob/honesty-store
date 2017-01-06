import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');
import { signAccessToken, signRefreshToken, verifyToken } from './token';

config.region = process.env.AWS_REGION;

interface User {
    id: string;
    accountID: string;
    emailAddress: string;
    refreshToken: string;
}

const createAssertValidUuid = (name) =>
    (uuid) => {
        if (uuid == null || !isUUID(uuid, 4) ) {
            throw new Error(`Invalid ${name} ${uuid}`);
        }
    };

const assertValidUserId = createAssertValidUuid('userId');
const assertValidRefreshToken = createAssertValidUuid('refreshToken');

const assertValidEmailAddress = (emailAddress) => {
    if (emailAddress == null || !isEmail(emailAddress) ) {
        throw new Error(`Invalid emailAddress ${emailAddress}`);
    }
};

const get = async ({ userId }): Promise<User> => {
    assertValidUserId(userId);

    const response = await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: userId
            }
        })
        .promise();

    return <User>response.Item;
};

const getByAccessToken = async ({ accessToken }): Promise<User> => {
    const { userId } = verifyToken(accessToken);
    assertValidUserId(userId);

    // We trust the JWT signing to validate access tokens
    return await get({ userId });
};

const getByRefreshToken = async ({ refreshToken }): Promise<User> => {
    const { userId, refreshToken: token } = verifyToken(refreshToken);
    assertValidUserId(userId);
    assertValidRefreshToken(token);

    const user = await get({ userId });

    // As well as the JWT signing, we validate a stored uuid for refresh tokens
    if (token !== user.refreshToken) {
        throw new Error(`Invalid refreshToken`);
    }

    return user;
};

const scanByEmailAddress = async ({ emailAddress }): Promise<User> => {
    assertValidEmailAddress(emailAddress);

    const response = await new DynamoDB.DocumentClient()
        .scan({
            TableName: process.env.TABLE_NAME,
            FilterExpression: "emailAddress = :emailAddress",
            ExpressionAttributeValues: {
                ":emailAddress": emailAddress
            }
        })
        .promise();

    if (response.Items.length > 1) {
        throw new Error(`Multiple users found with the same emailAddress`);
    }

    return <User>response.Items[0];
};

const app = express();

app.use(bodyParser.json());

const router = express.Router();

router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    get({ userId })
        .then((user) => {
            res.json({ user });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.get('/', (req, res) => {
    const { accessToken, refreshToken, emailAddress } = req.params;

    const lookup = () => {
        if (accessToken != null) {
            return getByAccessToken({ accessToken });
        }
        if (refreshToken != null) {
            return getByRefreshToken({ refreshToken });
        }
        if (emailAddress != null) {
            return scanByEmailAddress({ emailAddress });
        }
        return Promise.reject(new Error(`No valid parameters specified`));
    }

    const promise = lookup()
        .then((user) => {
            res.json({ user });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

app.use('/user/v1', router);

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    get({ userId: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649' })
        .then(() => {
            res.send(200);
        })
        .catch(() => {
            res.send(500);
        });
})

app.listen(3000);
