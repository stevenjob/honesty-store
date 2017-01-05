import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');

config.region = process.env.AWS_REGION;

interface User {
    id: string;
    accountID: string;
    emailAddress: string;
    accessToken: string;
    refreshToken: string;
}

const createAssertValidUuid = (name) =>
    (uuid) => {
        if (uuid == null || !isUUID(uuid, 4) ) {
            throw new Error(`Invalid ${name} ${uuid}`);
        }
    };

const assertValidUserId = createAssertValidUuid('userId');
const assertValidAccessToken = createAssertValidUuid('accessToken');
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
    assertValidAccessToken(accessToken);

    const response = await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: {
                accessToken
            }
        })
        .promise();

    return <User>response.Item;
};

const getByRefreshToken = async ({ refreshToken }): Promise<User> => {
    assertValidRefreshToken(refreshToken);

    const response = await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: {
                refreshToken
            }
        })
        .promise();

    return <User>response.Item;
};

const getByEmailAddress = async ({ emailAddress }): Promise<User> => {
    assertValidEmailAddress(emailAddress);

    const response = await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: {
                emailAddress
            }
        })
        .promise();

    return <User>response.Item;
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
            return getByEmailAddress({ emailAddress });
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
