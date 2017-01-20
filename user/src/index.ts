import { config, DynamoDB, SES } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './token';
import { User, UserProfile, UserWithAccessToken, UserWithAccessAndRefreshTokens, TEST_DATA_USER_ID } from './client';
import { createAccount, getAccount, TEST_DATA_EMPTY_ACCOUNT_ID } from '../../transaction/src/client';
import { baseUrl } from '../../service/src/baseUrl';
import { promiseResponse } from '../../service/src/endpoint-then-catch';

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

const assertNotNull = (name, value) => {
    if (value == null) {
        throw new Error(`${name} is null`);
    }
}

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

    const user = <InternalUser>response.Item

    if (user == null) {
        throw new Error(`User not found ${userId}`);
    }

    return user;
};

const get = async ({ userId }): Promise<User> => externaliseUser(await getInternal({ userId }));

const getByAccessToken = async ({ accessToken }): Promise<User> => {
    const { userId } = verifyAccessToken(accessToken);
    assertValidUserId(userId);

    // We trust the JWT signing to validate access tokens
    return await get({ userId });
};

const getByRefreshToken = async ({ refreshToken }): Promise<UserWithAccessToken> => {
    const { userId, refreshToken: token } = verifyRefreshToken(refreshToken);
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
    const { userId } = verifyAccessToken(magicLinkToken);
    assertValidUserId(userId);

    const user = await getInternal({ userId });

    return externaliseUserWithAccessTokenAndRefreshToken(user);
};

const scanByEmailAddress = async ({ emailAddress }) => {
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

    const user = <InternalUser>response.Items[0];

    if (user == null) {
        throw new Error(`User not found ${emailAddress}`);
    }

    return user;
};

const createUser = async ({ userId, userProfile }): Promise<UserWithAccessAndRefreshTokens> => {
    assertNotNull("defaultStoreId", userProfile.defaultStoreId);
    assertNotNull("accountId", userProfile.accountId);

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
        const account = await createAccount(uuid());
        updatedUser.accountId = account.id;
    }

    const response = await new DynamoDB.DocumentClient()
        .update({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: userId
            },
            ConditionExpression: 'version=:originalVersion',
            UpdateExpression: 'set accountId=:accountId, defaultStoreId=:defaultStoreId, emailAddress=:emailAddress, refreshToken=:refreshToken, version=:updatedVersion',
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

const sendMagicLinkEmail = async ({ emailAddress }) => {
    const user = await scanByEmailAddress({ emailAddress });

    const message = `( https://honesty.store )

*********************************************************************
Tap the button below on your phone to log in to honesty.store
*********************************************************************

Log in to honesty.store ( ${baseUrl}/${user.defaultStoreId}?code=${signAccessToken({ userId: user.id })} )
`;
    const response = await new SES({apiVersion: '2010-12-01'})
        .sendEmail({
            Destination: {
                ToAddresses: [user.emailAddress]
            },
            Source: 'no-reply@honesty.store',
            Message: {
                Subject: { Charset: 'UTF-8', Data: 'Log in to honesty.store' },
                Body: { Text: { Charset: 'UTF-8', Data: message } }
            }
        })
        .promise();

    return response.MessageId;
};

const app = express();

app.use(bodyParser.json());

const router = express.Router();

router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    promiseResponse<User>(
        get({ userId }),
        res);
});

router.get('/accessToken/:accessToken', (req, res) => {
    const { accessToken } = req.params;

    promiseResponse<User>(
        getByAccessToken({ accessToken }),
        res);
});

router.get('/refreshToken/:refreshToken', (req, res) => {
    const { refreshToken } = req.params;

    promiseResponse<UserWithAccessToken>(
        getByRefreshToken({ refreshToken }),
        res);
});

router.get('/magicLink/:magicLinkToken', (req, res) => {
    const { magicLinkToken } = req.params;

    promiseResponse<UserWithAccessAndRefreshTokens>(
        getByMagicLinkToken({ magicLinkToken }),
        res);
});

router.get('/emailAddress/:emailAddress', (req, res) => {
    const { emailAddress } = req.params;

    promiseResponse<User>(
        async () => externaliseUser(await scanByEmailAddress({ emailAddress })),
        response);
});

router.post('/', (req, res) => {
    const { userId, ...userProfile } = req.body;

    promiseResponse<UserWithAccessAndRefreshTokens>(
        createUser({ userId, userProfile }),
        res);
});

router.put('/:userId', (req, res) => {
    const { userId } = req.params;
    const userProfile = req.body;

    promiseResponse<User>(
        updateUser({ userId, userProfile }),
        res);
});

router.post('/magicLink/:emailAddress', (req, res) => {
    const { emailAddress } = req.params;

    const sendMagicLinkEmailAndReturnEmpty = async () => {
        await sendMagicLinkEmail({ emailAddress });
        return {};
    };

    promiseResponse<{}>(
        sendMagicLinkEmailAndReturnEmpty,
        response);
});

app.use('/user/v1', router);

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    get({ userId: TEST_DATA_USER_ID })
        .then(() => {
            res.send(200);
        })
        .catch(() => {
            res.send(500);
        });
});

app.listen(3000);
