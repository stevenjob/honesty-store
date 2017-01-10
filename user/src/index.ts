import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');
import { signAccessToken, signRefreshToken, verifyToken } from './token';
import { User, UserProfile, UserWithAccessToken, UserWithAccessAndRefreshTokens, UserWithMagicLinkToken } from './client';

config.region = process.env.AWS_REGION;

interface InternalUser extends User {
    created: number;
    refreshToken: string;
    version: number;
}

const createAssertValidUuid = (name) =>
    (uuid) => {
        if (uuid == null || !isUUID(uuid, 4)) {
            throw new Error(`Invalid ${name} ${uuid}`);
        }
    };

const assertValidUserId = createAssertValidUuid('userId');
const assertValidRefreshToken = createAssertValidUuid('refreshToken');
const assertValidDefaultStoreId = createAssertValidUuid('defaultStoreId');

const assertValidEmailAddress = (emailAddress) => {
    if (emailAddress == null || !isEmail(emailAddress)) {
        throw new Error(`Invalid emailAddress ${emailAddress}`);
    }
};

const assertValidUserProfile = (userProfile: UserProfile) => {
    if (Object.keys(userProfile).some(key => ['defaultStoreId', 'emailAddress'].indexOf(key) === -1)) {
        throw new Error(`Invalid user profile`);
    }
    if ('defaultStoreId' in userProfile) {
        assertValidDefaultStoreId(userProfile.defaultStoreId);
    }
    if ('emailAddress' in userProfile) {
        assertValidEmailAddress(userProfile.emailAddress);
    }
    return true;
};

const externaliseUser = (user: InternalUser): User => {
    const {
        created,
        refreshToken,
        version,
        ...externaliseUser
    } = user;
    return externaliseUser;
};

const externaliseUserWithAccessToken = (user: InternalUser): UserWithAccessToken => ({
    ...externaliseUser(user),
    accessToken: signAccessToken({ userId: user.id })
});

const externaliseUserWithAccessTokenAndRefreshToken = (user: InternalUser): UserWithAccessAndRefreshTokens => ({
    ...externaliseUserWithAccessToken(user),
    refreshToken: signRefreshToken({ userId: user.id, refreshToken: user.refreshToken })
});

const externaliseUserWithMagicLinkToken = (user: InternalUser): UserWithMagicLinkToken => ({
    ...externaliseUserWithAccessToken(user),
    magicLinkToken: signAccessToken({ userId: user.id })
});

const getInternal = async ({ userId }): Promise<InternalUser> => {
    assertValidUserId(userId);

    const response = await new DynamoDB.DocumentClient()
        .get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: userId
            }
        })
        .promise();

    return <InternalUser>response.Item;
};

const get = async ({ userId }): Promise<User> => externaliseUser(await getInternal({ userId }));

const getByAccessToken = async ({ accessToken }): Promise<User> => {
    const { userId, refreshToken } = verifyToken(accessToken);
    assertValidUserId(userId);

    if (refreshToken != null) {
        throw new Error(`Invalid accessToken`);
    }

    // We trust the JWT signing to validate access tokens
    return await get({ userId });
};

const getByRefreshToken = async ({ refreshToken }): Promise<UserWithAccessToken> => {
    const { userId, refreshToken: token } = verifyToken(refreshToken);
    assertValidUserId(userId);
    assertValidRefreshToken(token);

    const user = await getInternal({ userId });

    // As well as the JWT signing, we validate a stored uuid for refresh tokens
    if (token !== user.refreshToken) {
        throw new Error(`Invalid refreshToken`);
    }

    return externaliseUserWithAccessToken(user);
};

const getByMagicLinkToken = async ({ magicLinkToken }): Promise<UserWithAccessAndRefreshTokens> => {
    const { userId, refreshToken } = verifyToken(magicLinkToken);
    assertValidUserId(userId);

    const user = await getInternal({ userId });

    if (refreshToken != null) {
        throw new Error(`Invalid magicLinkToken`);
    }

    return externaliseUserWithAccessTokenAndRefreshToken(user);
};

const scanByEmailAddress = async ({ emailAddress }): Promise<UserWithMagicLinkToken> => {
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

    return externaliseUserWithMagicLinkToken(<InternalUser>response.Items[0]);
};

const createUser = async ({ userId, userProfile }): Promise<UserWithAccessAndRefreshTokens> => {
    const user: InternalUser = {
        id: userId,
        created: Date.now(),
        refreshToken: uuid(),
        version: 0,
        accountId: userProfile.accountId,
        defaultStoreId: userProfile.defaultStoreId,
        emailAddress: userProfile.emailAddress
    };

    const response = await new DynamoDB.DocumentClient()
        .put({
            TableName: process.env.TABLE_NAME,
            Item: user
        })
        .promise();

    return externaliseUserWithAccessTokenAndRefreshToken(user);
};

const updateUser = async ({ userId, userProfile }): Promise<User> => {
    assertValidUserId(userId);

    const originalUser = await getInternal({ userId });

    if (originalUser == null) {
        throw new Error(`User not found ${userId}`);
    }

    assertValidUserProfile(userProfile);

    const updatedUser: InternalUser = {
        ...originalUser,
        ...userProfile,
        id: userId,
        refreshToken: originalUser.refreshToken,
        version: originalUser.version + 1
    };

    if (originalUser.emailAddress == null && updatedUser.emailAddress != null) {
        // TODO: create real transaction account
        updatedUser.accountId = await Promise.resolve('b423607f-64de-441f-ac39-12d50aaedbe9')
    }

    const response = await new DynamoDB.DocumentClient()
        .update({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: userId
            },
            ConditionExpression: 'version=:originalVersion',
            UpdateExpression: 'set accountId=:transactions, defaultStoreId=:defaultStoreId, emailAddress=:emailAddress, refreshToken=:refreshToken, version=:updatedVersion',
            ExpressionAttributeValues: {
                ':originalVersion': originalUser.version,
                ':accountId': updatedUser.accountId,
                ':defaultStoreId': updatedUser.defaultStoreId,
                ':emailAddress': updatedUser.emailAddress,
                ':refreshToken': updatedUser.refreshToken,
                ':updatedVersion': updatedUser.version,
            }
        })
        .promise();

    return updatedUser;
};

const app = express();

app.use(bodyParser.json());

const router = express.Router();

router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    get({ userId })
        .then((user) => {
            res.json({ response: user });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.get('/accessToken/:accessToken', (req, res) => {
    const { accessToken } = req.params;
    getByAccessToken({ accessToken })
        .then((user) => {
            res.json({ response: user });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.get('/refreshToken/:refreshToken', (req, res) => {
    const { refreshToken } = req.params;
    getByRefreshToken({ refreshToken })
        .then((user) => {
            res.json({ response: user });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.get('/magicLinkToken/:magicLinkToken', (req, res) => {
    const { magicLinkToken } = req.params;
    getByMagicLinkToken({ magicLinkToken })
        .then((user) => {
            res.json({ response: user });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.post('/', (req, res) => {
    const { userId, ...userProfile } = req.body;
    createUser({ userId, userProfile })
        .then((user) => {
            res.json({ response: user });
        })
        .catch(({ message }) => {
            res.json({ error: { message } });
        });
});

router.put('/:userId', (req, res) => {
    const { userId } = req.params;
    const userProfile = req.body;
    updateUser({ userId, userProfile })
        .then((user) => {
            res.json({ response: user });
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
});

app.listen(3000);
